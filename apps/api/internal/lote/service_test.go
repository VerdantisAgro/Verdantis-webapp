package lote

import (
	"context"
	"testing"
	"time"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/traceability"
)

// memRepo is an in-memory Repository used to test the service rules.
type memRepo struct {
	lotes  map[int64]*Lote
	events map[int64][]Event
	nextID int64
}

func newMemRepo() *memRepo {
	return &memRepo{lotes: map[int64]*Lote{}, events: map[int64][]Event{}}
}

func (m *memRepo) List(_ context.Context, userID int64) ([]Lote, error) {
	var out []Lote
	for _, l := range m.lotes {
		if l.UserID == userID {
			out = append(out, *l)
		}
	}
	return out, nil
}

func (m *memRepo) Get(_ context.Context, userID, id int64) (*Lote, error) {
	if l, ok := m.lotes[id]; ok && l.UserID == userID {
		cp := *l
		return &cp, nil
	}
	return nil, nil
}

func (m *memRepo) Create(_ context.Context, l *Lote) error {
	m.nextID++
	l.ID, l.CreatedAt = m.nextID, time.Now()
	cp := *l
	m.lotes[l.ID] = &cp
	return nil
}

func (m *memRepo) Update(_ context.Context, l *Lote) error {
	cp := *l
	m.lotes[l.ID] = &cp
	return nil
}

func (m *memRepo) Delete(_ context.Context, userID, id int64) (bool, error) {
	if l, ok := m.lotes[id]; ok && l.UserID == userID {
		delete(m.lotes, id)
		return true, nil
	}
	return false, nil
}

func (m *memRepo) ListEvents(_ context.Context, loteID int64) ([]Event, error) {
	return append([]Event(nil), m.events[loteID]...), nil
}

func (m *memRepo) AppendEvent(ctx context.Context, userID, loteID int64, next func(*Lote, *Event) (*Event, error)) (*Event, error) {
	l, _ := m.Get(ctx, userID, loteID)
	if l == nil {
		return nil, nil
	}
	var last *Event
	if evs := m.events[loteID]; len(evs) > 0 {
		last = &evs[len(evs)-1]
	}
	ev, err := next(l, last)
	if err != nil {
		return nil, err
	}
	ev.ID = int64(len(m.events[loteID]) + 1)
	m.events[loteID] = append(m.events[loteID], *ev)
	return ev, nil
}

func (m *memRepo) Finalize(ctx context.Context, userID, loteID int64, seal func(*Lote, []Event) (*Certificate, error)) (*Certificate, error) {
	l, _ := m.Get(ctx, userID, loteID)
	if l == nil {
		return nil, nil
	}
	c, err := seal(l, m.events[loteID])
	if err != nil {
		return nil, err
	}
	stored := m.lotes[loteID]
	stored.Status, stored.VerificationCode, stored.FinalHash, stored.Signature, stored.FinalizedAt =
		StatusFinalized, &c.Code, &c.FinalHash, &c.Signature, &c.FinalizedAt
	return c, nil
}

func (m *memRepo) FindByCode(_ context.Context, code string) (*Lote, string, error) {
	for _, l := range m.lotes {
		if l.VerificationCode != nil && *l.VerificationCode == code {
			cp := *l
			return &cp, "Maria Silva", nil
		}
	}
	return nil, "", nil
}

func newTestService(t *testing.T) (*Service, *memRepo) {
	t.Helper()
	signer, err := traceability.NewSigner(make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	repo := newMemRepo()
	return NewService(repo, signer), repo
}

func wantKind(t *testing.T, err error, kind apperr.Kind) {
	t.Helper()
	if e, ok := apperr.As(err); !ok || e.Kind != kind {
		t.Fatalf("got error %v, want kind %d", err, kind)
	}
}

var validInput = Input{Name: "Lote A1", Crop: "Milho", ProductionTotal: 100, CostTotal: 5000, SalePrice: 80}

func TestCreateComputesProfit(t *testing.T) {
	svc, _ := newTestService(t)
	l, err := svc.Create(context.Background(), 1, validInput)
	if err != nil {
		t.Fatal(err)
	}
	if l.Revenue() != 8000 || l.Profit() != 3000 || l.Status != StatusActive {
		t.Fatalf("revenue=%v profit=%v status=%s", l.Revenue(), l.Profit(), l.Status)
	}
}

func TestCreateValidates(t *testing.T) {
	svc, _ := newTestService(t)
	planting := time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC)
	harvest := planting.AddDate(0, -1, 0)
	_, err := svc.Create(context.Background(), 1, Input{CostTotal: -1, PlantingDate: &planting, ExpectedHarvest: &harvest})
	wantKind(t, err, apperr.KindInvalid)
	e, _ := apperr.As(err)
	for _, field := range []string{"nomeLote", "cultura", "custoTotal", "previsaoColheita"} {
		if _, ok := e.Fields[field]; !ok {
			t.Errorf("missing field error for %s", field)
		}
	}
}

func TestLotesAreScopedToOwner(t *testing.T) {
	svc, _ := newTestService(t)
	ctx := context.Background()
	l, _ := svc.Create(ctx, 1, validInput)

	_, err := svc.Get(ctx, 2, l.ID)
	wantKind(t, err, apperr.KindNotFound)
	wantKind(t, svc.Delete(ctx, 2, l.ID), apperr.KindNotFound)
	_, err = svc.AddEvent(ctx, 2, l.ID, "IRRIGATION", "Irrigacao por gotejamento")
	wantKind(t, err, apperr.KindNotFound)
}

func TestEventsFormAChainAndFinalizeSealsIt(t *testing.T) {
	svc, _ := newTestService(t)
	ctx := context.Background()
	l, _ := svc.Create(ctx, 1, validInput)

	_, err := svc.Finalize(ctx, 1, l.ID)
	wantKind(t, err, apperr.KindInvalid) // no events yet

	first, err := svc.AddEvent(ctx, 1, l.ID, "soil_preparation", "Preparo do solo com grade")
	if err != nil {
		t.Fatal(err)
	}
	second, err := svc.AddEvent(ctx, 1, l.ID, "HARVEST", "Colheita mecanizada, 100 sacas")
	if err != nil {
		t.Fatal(err)
	}
	if first.Type != "SOIL_PREPARATION" || first.PreviousHash != traceability.GenesisHash(l.ID) {
		t.Fatalf("first event not linked to genesis: %+v", first)
	}
	if second.Seq != 2 || second.PreviousHash != first.Hash {
		t.Fatalf("second event not linked to first: %+v", second)
	}

	cert, err := svc.Finalize(ctx, 1, l.ID)
	if err != nil {
		t.Fatal(err)
	}
	if cert.FinalHash != second.Hash || cert.EventCount != 2 || len(cert.Code) != 10 {
		t.Fatalf("unexpected certificate: %+v", cert)
	}

	_, err = svc.AddEvent(ctx, 1, l.ID, "OTHER", "Evento depois de finalizar")
	wantKind(t, err, apperr.KindConflict)
	_, err = svc.Finalize(ctx, 1, l.ID)
	wantKind(t, err, apperr.KindConflict)

	v, err := svc.Verify(ctx, cert.Code)
	if err != nil {
		t.Fatal(err)
	}
	if !v.ChainIntact || !v.SignatureValid || v.ProducerName != "Maria" {
		t.Fatalf("verification failed: intact=%v signature=%v producer=%q", v.ChainIntact, v.SignatureValid, v.ProducerName)
	}
}

func TestVerifyDetectsTamperedEvent(t *testing.T) {
	svc, repo := newTestService(t)
	ctx := context.Background()
	l, _ := svc.Create(ctx, 1, validInput)
	_, _ = svc.AddEvent(ctx, 1, l.ID, "IRRIGATION", "Irrigacao por aspersao")
	cert, _ := svc.Finalize(ctx, 1, l.ID)

	repo.events[l.ID][0].Description = "Descricao alterada no banco"

	v, err := svc.Verify(ctx, cert.Code)
	if err != nil {
		t.Fatal(err)
	}
	if v.ChainIntact {
		t.Fatal("tampered chain reported as intact")
	}
}

func TestFinalizedLoteOnlyAcceptsFinancialChanges(t *testing.T) {
	svc, _ := newTestService(t)
	ctx := context.Background()
	l, _ := svc.Create(ctx, 1, validInput)
	_, _ = svc.AddEvent(ctx, 1, l.ID, "HARVEST", "Colheita manual completa")
	_, _ = svc.Finalize(ctx, 1, l.ID)

	sale := validInput
	sale.SalePrice = 95
	if _, err := svc.Update(ctx, 1, l.ID, sale); err != nil {
		t.Fatalf("financial update rejected: %v", err)
	}

	renamed := validInput
	renamed.Name = "Outro nome"
	_, err := svc.Update(ctx, 1, l.ID, renamed)
	wantKind(t, err, apperr.KindInvalid)
}

func TestSummaryAndTrend(t *testing.T) {
	svc, _ := newTestService(t)
	ctx := context.Background()
	_, _ = svc.Create(ctx, 1, validInput) // profit 3000
	_, _ = svc.Create(ctx, 1, Input{Name: "Lote B", Crop: "Soja", ProductionTotal: 10, CostTotal: 1000, SalePrice: 50})

	s, err := svc.Summary(ctx, 1)
	if err != nil {
		t.Fatal(err)
	}
	if s.TotalLotes != 2 || s.LucroTotal != 2500 || s.CulturaMaisRentavel != "Milho" || s.LoteMaisRentavel != "Lote A1" {
		t.Fatalf("unexpected summary: %+v", s)
	}

	trend, err := svc.ProfitTrend(ctx, 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(trend) != 1 || trend[0].Lucro != 2500 {
		t.Fatalf("unexpected trend: %+v", trend)
	}
}
