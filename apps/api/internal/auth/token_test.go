package auth

import (
	"testing"
	"time"
)

func TestTokensRoundTrip(t *testing.T) {
	tokens := NewTokens([]byte("0123456789abcdef0123456789abcdef"), time.Hour)

	raw, err := tokens.Issue(42)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	id, err := tokens.Parse(raw)
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	if id != 42 {
		t.Fatalf("got user %d, want 42", id)
	}
}

func TestTokensRejectExpiredAndForeign(t *testing.T) {
	tokens := NewTokens([]byte("0123456789abcdef0123456789abcdef"), time.Hour)
	raw, _ := tokens.Issue(1)

	later := NewTokens(tokens.secret, time.Hour)
	later.now = func() time.Time { return time.Now().Add(2 * time.Hour) }
	if _, err := later.Parse(raw); err == nil {
		t.Fatal("expired token was accepted")
	}

	other := NewTokens([]byte("ffffffffffffffffffffffffffffffff"), time.Hour)
	if _, err := other.Parse(raw); err == nil {
		t.Fatal("token signed with another secret was accepted")
	}
}

func TestPasswordHash(t *testing.T) {
	hash, err := HashPassword("segredo123")
	if err != nil {
		t.Fatal(err)
	}
	if !CheckPassword(hash, "segredo123") {
		t.Fatal("correct password rejected")
	}
	if CheckPassword(hash, "outra") {
		t.Fatal("wrong password accepted")
	}
}
