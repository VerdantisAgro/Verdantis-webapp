package traceability

import (
	"testing"
	"time"
)

func buildChain(loteID int64, descriptions ...string) []StoredEvent {
	var out []StoredEvent
	prev := GenesisHash(loteID)
	base := time.Date(2026, 3, 1, 10, 0, 0, 123456789, time.UTC)
	for i, d := range descriptions {
		ev := Event{
			LoteID:       loteID,
			Seq:          i + 1,
			Type:         "IRRIGATION",
			Description:  d,
			OccurredAt:   Normalize(base.Add(time.Duration(i) * time.Hour)),
			PreviousHash: prev,
		}
		h := Hash(ev)
		out = append(out, StoredEvent{Event: ev, Hash: h})
		prev = h
	}
	return out
}

func TestVerifyChainAcceptsIntactChain(t *testing.T) {
	events := buildChain(7, "plantio", "irrigacao", "colheita")
	last, _, ok := VerifyChain(7, events)
	if !ok {
		t.Fatal("intact chain reported as broken")
	}
	if last != events[2].Hash {
		t.Fatalf("last hash = %s, want %s", last, events[2].Hash)
	}
}

func TestVerifyChainDetectsTampering(t *testing.T) {
	tests := map[string]func([]StoredEvent){
		"edited description": func(e []StoredEvent) { e[1].Description = "adubacao" },
		"edited timestamp":   func(e []StoredEvent) { e[0].OccurredAt = e[0].OccurredAt.Add(time.Second) },
		"broken link":        func(e []StoredEvent) { e[2].PreviousHash = e[0].Hash },
		"wrong lote":         func(e []StoredEvent) { e[0].LoteID = 8 },
	}
	for name, tamper := range tests {
		t.Run(name, func(t *testing.T) {
			events := buildChain(7, "plantio", "irrigacao", "colheita")
			tamper(events)
			if _, _, ok := VerifyChain(7, events); ok {
				t.Fatal("tampered chain reported as valid")
			}
		})
	}
}

func TestVerifyChainDetectsRemovedEvent(t *testing.T) {
	events := buildChain(7, "plantio", "irrigacao", "colheita")
	removed := append([]StoredEvent{events[0]}, events[2])
	_, broken, ok := VerifyChain(7, removed)
	if ok || broken != 3 {
		t.Fatalf("got ok=%v broken=%d, want broken at seq 3", ok, broken)
	}
}

func TestHashSeparatesFields(t *testing.T) {
	a := Event{LoteID: 1, Seq: 1, Type: "OTHER", Description: "a\nb", PreviousHash: "x"}
	b := Event{LoteID: 1, Seq: 1, Type: "OTHER\na", Description: "b", PreviousHash: "x"}
	if Hash(a) == Hash(b) {
		t.Fatal("different events produced the same hash")
	}
}

func TestSignerRoundTrip(t *testing.T) {
	seed := make([]byte, 32)
	s, err := NewSigner(seed)
	if err != nil {
		t.Fatal(err)
	}
	sig := s.Sign("ABC123", "deadbeef")
	if !s.Verify("ABC123", "deadbeef", sig) {
		t.Fatal("valid signature rejected")
	}
	if s.Verify("ABC124", "deadbeef", sig) || s.Verify("ABC123", "deadbeee", sig) {
		t.Fatal("signature accepted for different data")
	}
}
