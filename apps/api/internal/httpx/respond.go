// Package httpx holds HTTP helpers shared by every handler: JSON encoding,
// error mapping and middleware.
package httpx

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
)

const maxBodyBytes = 1 << 20 // 1 MiB

type errorBody struct {
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if v == nil {
		return
	}
	if err := json.NewEncoder(w).Encode(v); err != nil {
		slog.Error("encode response", "err", err)
	}
}

// Error writes err as JSON. Domain errors keep their message; anything else is
// logged and reported as a generic 500 so internals never leak.
func Error(w http.ResponseWriter, r *http.Request, err error) {
	if e, ok := apperr.As(err); ok {
		JSON(w, statusFor(e.Kind), errorBody{Message: e.Message, Fields: e.Fields})
		return
	}
	slog.ErrorContext(r.Context(), "unhandled error", "err", err, "method", r.Method, "path", r.URL.Path)
	JSON(w, http.StatusInternalServerError, errorBody{Message: "Erro interno do servidor."})
}

func statusFor(k apperr.Kind) int {
	switch k {
	case apperr.KindInvalid:
		return http.StatusUnprocessableEntity
	case apperr.KindNotFound:
		return http.StatusNotFound
	case apperr.KindConflict:
		return http.StatusConflict
	case apperr.KindUnauthorized:
		return http.StatusUnauthorized
	default:
		return http.StatusInternalServerError
	}
}

// Decode reads a JSON body into dst, rejecting unknown fields and oversized bodies.
func Decode(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		switch {
		case errors.Is(err, io.EOF):
			return apperr.Invalid("Corpo da requisicao vazio.", nil)
		case errors.As(err, &maxErr):
			return apperr.Invalid("Corpo da requisicao muito grande.", nil)
		default:
			return apperr.Invalid("JSON invalido: "+err.Error(), nil)
		}
	}
	return nil
}

// PathID parses a positive integer path parameter.
func PathID(r *http.Request, name string) (int64, error) {
	id, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	if err != nil || id <= 0 {
		return 0, apperr.NotFound("Recurso nao encontrado.")
	}
	return id, nil
}
