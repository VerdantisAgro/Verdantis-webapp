// Package server wires handlers to routes.
package server

import (
	"context"
	"net/http"
	"time"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/httpx"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/lote"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/user"
)

type Pinger interface {
	Ping(ctx context.Context) error
}

type Deps struct {
	Users       *user.Handler
	Lotes       *lote.Handler
	RequireAuth httpx.Middleware
	DB          Pinger
	CORSOrigins []string
}

func NewRouter(d Deps) http.Handler {
	mux := http.NewServeMux()
	authed := func(h http.HandlerFunc) http.Handler { return d.RequireAuth(h) }

	mux.HandleFunc("GET /healthz", health(d.DB))

	mux.HandleFunc("POST /api/auth/register", d.Users.Register)
	mux.HandleFunc("POST /api/auth/login", d.Users.Login)
	mux.Handle("GET /api/me", authed(d.Users.Me))

	mux.Handle("GET /api/lotes", authed(d.Lotes.List))
	mux.Handle("POST /api/lotes", authed(d.Lotes.Create))
	mux.Handle("GET /api/lotes/{id}", authed(d.Lotes.Get))
	mux.Handle("PUT /api/lotes/{id}", authed(d.Lotes.Update))
	mux.Handle("DELETE /api/lotes/{id}", authed(d.Lotes.Delete))
	mux.Handle("GET /api/lotes/{id}/eventos", authed(d.Lotes.ListEvents))
	mux.Handle("POST /api/lotes/{id}/eventos", authed(d.Lotes.AddEvent))
	mux.Handle("POST /api/lotes/{id}/finalizar", authed(d.Lotes.Finalize))

	mux.Handle("GET /api/dashboard", authed(d.Lotes.Summary))
	mux.Handle("GET /api/analytics/tendencia-lucro", authed(d.Lotes.ProfitTrend))

	mux.HandleFunc("GET /api/public/verificacao/{code}", d.Lotes.Verify)
	mux.HandleFunc("GET /api/public/verificacao/{code}/qrcode.png", d.Lotes.QRCode)

	return httpx.Chain(mux, httpx.Recoverer, httpx.Logger, httpx.CORS(d.CORSOrigins))
}

func health(db Pinger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := db.Ping(ctx); err != nil {
			httpx.JSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable"})
			return
		}
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}
