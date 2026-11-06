// Command api runs the Verdantis HTTP API.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/auth"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/config"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/database"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/lote"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/server"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/traceability"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/user"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	if err := run(); err != nil {
		slog.Error("api stopped", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	if err := database.Migrate(ctx, db); err != nil {
		return err
	}

	signer, err := traceability.NewSigner(cfg.SigningSeed)
	if err != nil {
		return err
	}
	if cfg.SigningSeed == nil {
		slog.Warn("SIGNING_KEY_SEED not set: using a temporary key, certificates will not verify after a restart")
	}

	tokens := auth.NewTokens(cfg.JWTSecret, cfg.JWTTTL)
	userSvc := user.NewService(user.NewPostgresRepository(db), tokens)
	loteSvc := lote.NewService(lote.NewPostgresRepository(db), signer)

	srv := &http.Server{
		Addr: cfg.HTTPAddr,
		Handler: server.NewRouter(server.Deps{
			Users:       user.NewHandler(userSvc),
			Lotes:       lote.NewHandler(loteSvc, cfg.PublicWebURL),
			RequireAuth: tokens.Middleware,
			DB:          db,
			CORSOrigins: cfg.CORSOrigins,
		}),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("api listening", "addr", cfg.HTTPAddr, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	slog.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
