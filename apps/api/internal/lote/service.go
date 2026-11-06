package lote

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"slices"
	"strings"
	"time"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/traceability"
)

type Signer interface {
	Sign(code, finalHash string) string
	Verify(code, finalHash, signature string) bool
	PublicKeyBase64() string
}

type Service struct {
	repo   Repository
	signer Signer
	now    func() time.Time
}

func NewService(repo Repository, signer Signer) *Service {
	return &Service{repo: repo, signer: signer, now: time.Now}
}

type Input struct {
	Name            string
	Crop            string
	Variety         string
	AreaHectares    float64
	PlantingDate    *time.Time
	ExpectedHarvest *time.Time
	ProductionTotal float64
	CostTotal       float64
	SalePrice       float64
}

func (in *Input) normalize() {
	in.Name = strings.TrimSpace(in.Name)
	in.Crop = strings.TrimSpace(in.Crop)
	in.Variety = strings.TrimSpace(in.Variety)
}

func (in Input) validate() error {
	v := apperr.Validator{}
	v.Check(in.Name != "" && len(in.Name) <= 120, "nomeLote", "Informe o nome do lote (ate 120 caracteres).")
	v.Check(in.Crop != "" && len(in.Crop) <= 60, "cultura", "Informe a cultura.")
	v.Check(len(in.Variety) <= 120, "variedade", "Variedade muito longa.")
	v.Check(in.AreaHectares >= 0, "areaHectares", "A area nao pode ser negativa.")
	v.Check(in.ProductionTotal >= 0, "producaoTotal", "A producao nao pode ser negativa.")
	v.Check(in.CostTotal >= 0, "custoTotal", "O custo nao pode ser negativo.")
	v.Check(in.SalePrice >= 0, "precoVenda", "O preco nao pode ser negativo.")
	v.Check(in.PlantingDate == nil || in.ExpectedHarvest == nil || !in.ExpectedHarvest.Before(*in.PlantingDate),
		"previsaoColheita", "A colheita nao pode ser antes do plantio.")
	return v.Err()
}

func (s *Service) List(ctx context.Context, userID int64) ([]Lote, error) {
	return s.repo.List(ctx, userID)
}

func (s *Service) Get(ctx context.Context, userID, id int64) (*Lote, error) {
	l, err := s.repo.Get(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, errNotFound
	}
	return l, nil
}

func (s *Service) Create(ctx context.Context, userID int64, in Input) (*Lote, error) {
	in.normalize()
	if err := in.validate(); err != nil {
		return nil, err
	}
	l := &Lote{UserID: userID, Status: StatusActive}
	apply(l, in)
	if err := s.repo.Create(ctx, l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *Service) Update(ctx context.Context, userID, id int64, in Input) (*Lote, error) {
	in.normalize()
	if err := in.validate(); err != nil {
		return nil, err
	}
	l, err := s.Get(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	// The certificate shows name, crop, variety and dates; after finalizing,
	// only the financial figures (e.g. the actual sale) may change.
	if l.IsFinalized() && !sameIdentity(l, in) {
		return nil, apperr.Invalid("Lote finalizado: apenas producao, custo e preco podem ser alterados.", nil)
	}
	apply(l, in)
	if err := s.repo.Update(ctx, l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *Service) Delete(ctx context.Context, userID, id int64) error {
	ok, err := s.repo.Delete(ctx, userID, id)
	if err != nil {
		return err
	}
	if !ok {
		return errNotFound
	}
	return nil
}

func (s *Service) ListEvents(ctx context.Context, userID, loteID int64) ([]Event, error) {
	if _, err := s.Get(ctx, userID, loteID); err != nil {
		return nil, err
	}
	return s.repo.ListEvents(ctx, loteID)
}

func (s *Service) AddEvent(ctx context.Context, userID, loteID int64, eventType, description string) (*Event, error) {
	eventType = strings.ToUpper(strings.TrimSpace(eventType))
	description = strings.TrimSpace(description)

	v := apperr.Validator{}
	v.Check(slices.Contains(traceability.EventTypes, eventType), "tipoEvento", "Tipo de evento invalido.")
	v.Check(len(description) >= 10 && len(description) <= 1000, "descricao", "A descricao deve ter entre 10 e 1000 caracteres.")
	if err := v.Err(); err != nil {
		return nil, err
	}

	ev, err := s.repo.AppendEvent(ctx, userID, loteID, func(l *Lote, last *Event) (*Event, error) {
		if l.IsFinalized() {
			return nil, apperr.Conflict("Lote finalizado nao aceita novos eventos.")
		}
		chain := traceability.Event{
			LoteID:       loteID,
			Seq:          1,
			Type:         eventType,
			Description:  description,
			OccurredAt:   traceability.Normalize(s.now()),
			PreviousHash: traceability.GenesisHash(loteID),
		}
		if last != nil {
			chain.Seq = last.Seq + 1
			chain.PreviousHash = last.Hash
		}
		return &Event{
			LoteID:       loteID,
			Seq:          chain.Seq,
			Type:         chain.Type,
			Description:  chain.Description,
			OccurredAt:   chain.OccurredAt,
			PreviousHash: chain.PreviousHash,
			Hash:         traceability.Hash(chain),
		}, nil
	})
	if err != nil {
		return nil, err
	}
	if ev == nil {
		return nil, errNotFound
	}
	return ev, nil
}

func (s *Service) Finalize(ctx context.Context, userID, loteID int64) (*Certificate, error) {
	cert, err := s.repo.Finalize(ctx, userID, loteID, func(l *Lote, events []Event) (*Certificate, error) {
		if l.IsFinalized() {
			return nil, apperr.Conflict("Lote ja finalizado.")
		}
		if len(events) == 0 {
			return nil, apperr.Invalid("Registre pelo menos um evento antes de finalizar.", nil)
		}
		finalHash, _, ok := traceability.VerifyChain(loteID, toChain(events))
		if !ok {
			return nil, apperr.Conflict("A cadeia de eventos deste lote esta inconsistente.")
		}
		code, err := newCode()
		if err != nil {
			return nil, err
		}
		return &Certificate{
			Code:        code,
			FinalHash:   finalHash,
			Signature:   s.signer.Sign(code, finalHash),
			FinalizedAt: traceability.Normalize(s.now()),
			EventCount:  len(events),
		}, nil
	})
	if err != nil {
		return nil, err
	}
	if cert == nil {
		return nil, errNotFound
	}
	return cert, nil
}

// Verification is the public view of a finalized lote.
type Verification struct {
	Lote           *Lote
	ProducerName   string
	Events         []Event
	ChainIntact    bool
	SignatureValid bool
	PublicKey      string
}

func (s *Service) Verify(ctx context.Context, code string) (*Verification, error) {
	l, producer, err := s.repo.FindByCode(ctx, strings.ToUpper(strings.TrimSpace(code)))
	if err != nil {
		return nil, err
	}
	if l == nil || l.FinalHash == nil || l.Signature == nil {
		return nil, apperr.NotFound("Certificado nao encontrado.")
	}
	events, err := s.repo.ListEvents(ctx, l.ID)
	if err != nil {
		return nil, err
	}
	last, _, intact := traceability.VerifyChain(l.ID, toChain(events))
	return &Verification{
		Lote:           l,
		ProducerName:   firstName(producer),
		Events:         events,
		ChainIntact:    intact && last == *l.FinalHash,
		SignatureValid: s.signer.Verify(*l.VerificationCode, *l.FinalHash, *l.Signature),
		PublicKey:      s.signer.PublicKeyBase64(),
	}, nil
}

var errNotFound = apperr.NotFound("Lote nao encontrado.")

func apply(l *Lote, in Input) {
	l.Name = in.Name
	l.Crop = in.Crop
	l.Variety = in.Variety
	l.AreaHectares = round2(in.AreaHectares)
	l.PlantingDate = in.PlantingDate
	l.ExpectedHarvest = in.ExpectedHarvest
	l.ProductionTotal = round2(in.ProductionTotal)
	l.CostTotal = round2(in.CostTotal)
	l.SalePrice = round2(in.SalePrice)
}

func sameIdentity(l *Lote, in Input) bool {
	return l.Name == in.Name && l.Crop == in.Crop && l.Variety == in.Variety &&
		round2(l.AreaHectares) == round2(in.AreaHectares) &&
		sameDate(l.PlantingDate, in.PlantingDate) && sameDate(l.ExpectedHarvest, in.ExpectedHarvest)
}

func sameDate(a, b *time.Time) bool {
	if a == nil || b == nil {
		return a == b
	}
	return a.Format(time.DateOnly) == b.Format(time.DateOnly)
}

func toChain(events []Event) []traceability.StoredEvent {
	out := make([]traceability.StoredEvent, len(events))
	for i, e := range events {
		out[i] = traceability.StoredEvent{
			Event: traceability.Event{
				LoteID:       e.LoteID,
				Seq:          e.Seq,
				Type:         e.Type,
				Description:  e.Description,
				OccurredAt:   e.OccurredAt,
				PreviousHash: e.PreviousHash,
			},
			Hash: e.Hash,
		}
	}
	return out
}

// newCode returns a 10-character code (50 random bits) for the public URL.
func newCode() (string, error) {
	b := make([]byte, 7)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b)[:10], nil
}

// firstName keeps the public page from exposing the producer's full name.
func firstName(name string) string {
	if fields := strings.Fields(name); len(fields) > 0 {
		return fields[0]
	}
	return ""
}
