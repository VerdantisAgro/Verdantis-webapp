package lote

import (
	"net/http"
	"time"

	"github.com/skip2/go-qrcode"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/auth"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/httpx"
)

type Handler struct {
	svc          *Service
	publicWebURL string
}

func NewHandler(svc *Service, publicWebURL string) *Handler {
	return &Handler{svc: svc, publicWebURL: publicWebURL}
}

// ---- request / response bodies ----

type loteRequest struct {
	NomeLote         string  `json:"nomeLote"`
	Cultura          string  `json:"cultura"`
	Variedade        string  `json:"variedade"`
	AreaHectares     float64 `json:"areaHectares"`
	DataPlantio      *string `json:"dataPlantio"`
	PrevisaoColheita *string `json:"previsaoColheita"`
	ProducaoTotal    float64 `json:"producaoTotal"`
	CustoTotal       float64 `json:"custoTotal"`
	PrecoVenda       float64 `json:"precoVenda"`
}

func (req loteRequest) toInput() (Input, error) {
	v := apperr.Validator{}
	planting, ok := parseDate(req.DataPlantio)
	v.Check(ok, "dataPlantio", "Data invalida (use AAAA-MM-DD).")
	harvest, ok := parseDate(req.PrevisaoColheita)
	v.Check(ok, "previsaoColheita", "Data invalida (use AAAA-MM-DD).")
	if err := v.Err(); err != nil {
		return Input{}, err
	}
	return Input{
		Name:            req.NomeLote,
		Crop:            req.Cultura,
		Variety:         req.Variedade,
		AreaHectares:    req.AreaHectares,
		PlantingDate:    planting,
		ExpectedHarvest: harvest,
		ProductionTotal: req.ProducaoTotal,
		CostTotal:       req.CustoTotal,
		SalePrice:       req.PrecoVenda,
	}, nil
}

func parseDate(v *string) (*time.Time, bool) {
	if v == nil || *v == "" {
		return nil, true
	}
	t, err := time.Parse(time.DateOnly, *v)
	if err != nil {
		return nil, false
	}
	return &t, true
}

func formatDate(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.Format(time.DateOnly)
	return &s
}

type loteResponse struct {
	ID                int64      `json:"id"`
	NomeLote          string     `json:"nomeLote"`
	Cultura           string     `json:"cultura"`
	Variedade         string     `json:"variedade"`
	AreaHectares      float64    `json:"areaHectares"`
	DataPlantio       *string    `json:"dataPlantio"`
	PrevisaoColheita  *string    `json:"previsaoColheita"`
	ProducaoTotal     float64    `json:"producaoTotal"`
	CustoTotal        float64    `json:"custoTotal"`
	PrecoVenda        float64    `json:"precoVenda"`
	Receita           float64    `json:"receita"`
	Lucro             float64    `json:"lucro"`
	Status            string     `json:"status"`
	CodigoVerificacao *string    `json:"codigoVerificacao"`
	HashFinal         *string    `json:"hashFinal"`
	FinalizadoEm      *time.Time `json:"finalizadoEm"`
	CriadoEm          time.Time  `json:"criadoEm"`
	AtualizadoEm      time.Time  `json:"atualizadoEm"`
}

func toLoteResponse(l *Lote) loteResponse {
	return loteResponse{
		ID:                l.ID,
		NomeLote:          l.Name,
		Cultura:           l.Crop,
		Variedade:         l.Variety,
		AreaHectares:      l.AreaHectares,
		DataPlantio:       formatDate(l.PlantingDate),
		PrevisaoColheita:  formatDate(l.ExpectedHarvest),
		ProducaoTotal:     l.ProductionTotal,
		CustoTotal:        l.CostTotal,
		PrecoVenda:        l.SalePrice,
		Receita:           l.Revenue(),
		Lucro:             l.Profit(),
		Status:            l.Status,
		CodigoVerificacao: l.VerificationCode,
		HashFinal:         l.FinalHash,
		FinalizadoEm:      l.FinalizedAt,
		CriadoEm:          l.CreatedAt,
		AtualizadoEm:      l.UpdatedAt,
	}
}

type eventRequest struct {
	TipoEvento string `json:"tipoEvento"`
	Descricao  string `json:"descricao"`
}

type eventResponse struct {
	ID           int64     `json:"id"`
	Seq          int       `json:"seq"`
	TipoEvento   string    `json:"tipoEvento"`
	Descricao    string    `json:"descricao"`
	OcorridoEm   time.Time `json:"ocorridoEm"`
	HashAnterior string    `json:"hashAnterior"`
	Hash         string    `json:"hash"`
}

func toEventResponses(events []Event) []eventResponse {
	out := make([]eventResponse, len(events))
	for i, e := range events {
		out[i] = eventResponse{
			ID: e.ID, Seq: e.Seq, TipoEvento: e.Type, Descricao: e.Description,
			OcorridoEm: e.OccurredAt, HashAnterior: e.PreviousHash, Hash: e.Hash,
		}
	}
	return out
}

type certificateResponse struct {
	CodigoVerificacao string    `json:"codigoVerificacao"`
	HashFinal         string    `json:"hashFinal"`
	Assinatura        string    `json:"assinatura"`
	FinalizadoEm      time.Time `json:"finalizadoEm"`
	TotalEventos      int       `json:"totalEventos"`
	URLVerificacao    string    `json:"urlVerificacao"`
}

// ---- authenticated routes ----

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	lotes, err := h.svc.List(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	out := make([]loteResponse, len(lotes))
	for i := range lotes {
		out[i] = toLoteResponse(&lotes[i])
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	l, err := h.svc.Get(r.Context(), auth.UserID(r.Context()), id)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toLoteResponse(l))
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	in, ok := decodeLote(w, r)
	if !ok {
		return
	}
	l, err := h.svc.Create(r.Context(), auth.UserID(r.Context()), in)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, toLoteResponse(l))
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	in, ok := decodeLote(w, r)
	if !ok {
		return
	}
	l, err := h.svc.Update(r.Context(), auth.UserID(r.Context()), id, in)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toLoteResponse(l))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	if err := h.svc.Delete(r.Context(), auth.UserID(r.Context()), id); err != nil {
		httpx.Error(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListEvents(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	events, err := h.svc.ListEvents(r.Context(), auth.UserID(r.Context()), id)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toEventResponses(events))
}

func (h *Handler) AddEvent(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	var req eventRequest
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, r, err)
		return
	}
	ev, err := h.svc.AddEvent(r.Context(), auth.UserID(r.Context()), id, req.TipoEvento, req.Descricao)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, toEventResponses([]Event{*ev})[0])
}

func (h *Handler) Finalize(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathID(r, "id")
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	c, err := h.svc.Finalize(r.Context(), auth.UserID(r.Context()), id)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, certificateResponse{
		CodigoVerificacao: c.Code,
		HashFinal:         c.FinalHash,
		Assinatura:        c.Signature,
		FinalizadoEm:      c.FinalizedAt,
		TotalEventos:      c.EventCount,
		URLVerificacao:    h.verificationURL(c.Code),
	})
}

func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	s, err := h.svc.Summary(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, s)
}

func (h *Handler) ProfitTrend(w http.ResponseWriter, r *http.Request) {
	t, err := h.svc.ProfitTrend(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, t)
}

// ---- public routes ----

type verificationResponse struct {
	CodigoVerificacao string          `json:"codigoVerificacao"`
	NomeLote          string          `json:"nomeLote"`
	Cultura           string          `json:"cultura"`
	Variedade         string          `json:"variedade"`
	AreaHectares      float64         `json:"areaHectares"`
	DataPlantio       *string         `json:"dataPlantio"`
	PrevisaoColheita  *string         `json:"previsaoColheita"`
	Produtor          string          `json:"produtor"`
	FinalizadoEm      *time.Time      `json:"finalizadoEm"`
	HashFinal         string          `json:"hashFinal"`
	Assinatura        string          `json:"assinatura"`
	ChavePublica      string          `json:"chavePublica"`
	CadeiaIntegra     bool            `json:"cadeiaIntegra"`
	AssinaturaValida  bool            `json:"assinaturaValida"`
	Eventos           []eventResponse `json:"eventos"`
}

func (h *Handler) Verify(w http.ResponseWriter, r *http.Request) {
	v, err := h.svc.Verify(r.Context(), r.PathValue("code"))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	l := v.Lote
	httpx.JSON(w, http.StatusOK, verificationResponse{
		CodigoVerificacao: *l.VerificationCode,
		NomeLote:          l.Name,
		Cultura:           l.Crop,
		Variedade:         l.Variety,
		AreaHectares:      l.AreaHectares,
		DataPlantio:       formatDate(l.PlantingDate),
		PrevisaoColheita:  formatDate(l.ExpectedHarvest),
		Produtor:          v.ProducerName,
		FinalizadoEm:      l.FinalizedAt,
		HashFinal:         *l.FinalHash,
		Assinatura:        *l.Signature,
		ChavePublica:      v.PublicKey,
		CadeiaIntegra:     v.ChainIntact,
		AssinaturaValida:  v.SignatureValid,
		Eventos:           toEventResponses(v.Events),
	})
}

// QRCode returns a PNG pointing to the public verification page.
func (h *Handler) QRCode(w http.ResponseWriter, r *http.Request) {
	v, err := h.svc.Verify(r.Context(), r.PathValue("code"))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	png, err := qrcode.Encode(h.verificationURL(*v.Lote.VerificationCode), qrcode.Medium, 512)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	_, _ = w.Write(png)
}

func (h *Handler) verificationURL(code string) string {
	return h.publicWebURL + "/verificar/" + code
}

func decodeLote(w http.ResponseWriter, r *http.Request) (Input, bool) {
	var req loteRequest
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, r, err)
		return Input{}, false
	}
	in, err := req.toInput()
	if err != nil {
		httpx.Error(w, r, err)
		return Input{}, false
	}
	return in, true
}
