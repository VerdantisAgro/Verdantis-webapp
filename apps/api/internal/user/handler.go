package user

import (
	"net/http"
	"time"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/auth"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/httpx"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

type registerRequest struct {
	NomeCompleto string `json:"nomeCompleto"`
	Email        string `json:"email"`
	CPF          string `json:"cpf"`
	Senha        string `json:"senha"`
}

type loginRequest struct {
	Email string `json:"email"`
	Senha string `json:"senha"`
}

type sessionResponse struct {
	Token string `json:"token"`
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type userResponse struct {
	ID       int64     `json:"id"`
	Nome     string    `json:"nome"`
	Email    string    `json:"email"`
	CPF      string    `json:"cpf"`
	CriadoEm time.Time `json:"criadoEm"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, r, err)
		return
	}
	s, err := h.svc.Register(r.Context(), RegisterInput{
		Name: req.NomeCompleto, Email: req.Email, CPF: req.CPF, Password: req.Senha,
	})
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, toSession(s))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, r, err)
		return
	}
	s, err := h.svc.Login(r.Context(), req.Email, req.Senha)
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toSession(s))
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	u, err := h.svc.Get(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, userResponse{
		ID: u.ID, Nome: u.Name, Email: u.Email, CPF: maskCPF(u.CPF), CriadoEm: u.CreatedAt,
	})
}

func toSession(s *Session) sessionResponse {
	return sessionResponse{Token: s.Token, ID: s.User.ID, Name: s.User.Name, Email: s.User.Email}
}

// maskCPF shows only the middle digits, e.g. ***.456.789-**.
func maskCPF(cpf string) string {
	if len(cpf) != 11 {
		return ""
	}
	return "***." + cpf[3:6] + "." + cpf[6:9] + "-**"
}
