// Package config loads the API configuration from environment variables.
package config

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	Env          string
	HTTPAddr     string
	DatabaseURL  string
	JWTSecret    []byte
	JWTTTL       time.Duration
	CORSOrigins  []string
	PublicWebURL string
	// SigningSeed is the 32-byte Ed25519 seed used to sign traceability
	// certificates. Empty means a throwaway key is generated at startup.
	SigningSeed []byte
}

func (c Config) IsProduction() bool { return c.Env == "production" }

func Load() (Config, error) {
	cfg := Config{
		Env:          getenv("APP_ENV", "development"),
		HTTPAddr:     getenv("HTTP_ADDR", ":8080"),
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		JWTSecret:    []byte(os.Getenv("JWT_SECRET")),
		CORSOrigins:  splitList(getenv("CORS_ORIGINS", "http://localhost:3000")),
		PublicWebURL: strings.TrimRight(getenv("PUBLIC_WEB_URL", "http://localhost:3000"), "/"),
	}

	ttl, err := time.ParseDuration(getenv("JWT_TTL", "24h"))
	if err != nil {
		return Config{}, fmt.Errorf("JWT_TTL: %w", err)
	}
	cfg.JWTTTL = ttl

	if seed := os.Getenv("SIGNING_KEY_SEED"); seed != "" {
		raw, err := base64.StdEncoding.DecodeString(seed)
		if err != nil || len(raw) != 32 {
			return Config{}, errors.New("SIGNING_KEY_SEED must be 32 bytes encoded in base64")
		}
		cfg.SigningSeed = raw
	}

	return cfg, cfg.validate()
}

func (c Config) validate() error {
	var errs []error
	if c.DatabaseURL == "" {
		errs = append(errs, errors.New("DATABASE_URL is required"))
	}
	if len(c.JWTSecret) < 32 {
		errs = append(errs, errors.New("JWT_SECRET must have at least 32 characters"))
	}
	if c.IsProduction() && c.SigningSeed == nil {
		errs = append(errs, errors.New("SIGNING_KEY_SEED is required in production"))
	}
	return errors.Join(errs...)
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitList(v string) []string {
	var out []string
	for _, item := range strings.Split(v, ",") {
		if item = strings.TrimSpace(item); item != "" {
			out = append(out, item)
		}
	}
	return out
}
