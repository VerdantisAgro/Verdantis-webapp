// Package traceability builds and verifies the hash chain of a lote's events
// and signs the final hash so third parties can check a certificate.
package traceability

import (
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"strings"
	"time"
)

// version is part of every hashed payload so the format can evolve.
const version = "v1"

// EventTypes accepted by the API, mirroring the front-end options.
var EventTypes = []string{
	"SOIL_PREPARATION",
	"INPUT_ADDITION",
	"FERTILIZATION",
	"PEST_CONTROL",
	"IRRIGATION",
	"PRUNING",
	"INSPECTION",
	"HARVEST",
	"OTHER",
}

// Event holds exactly the fields that are covered by the hash.
type Event struct {
	LoteID       int64
	Seq          int
	Type         string
	Description  string
	OccurredAt   time.Time
	PreviousHash string
}

// GenesisHash is the "previous hash" of a lote's first event.
func GenesisHash(loteID int64) string {
	return sum("verdantis:" + version + ":genesis:" + strconv.FormatInt(loteID, 10))
}

// Normalize truncates a timestamp to what PostgreSQL stores (microseconds, UTC)
// so a hash computed before saving can be recomputed after loading.
func Normalize(t time.Time) time.Time {
	return t.UTC().Truncate(time.Microsecond)
}

// Hash returns the hex SHA-256 of the event's canonical form. Fields are joined
// with a newline and the description is escaped so no field can spill into
// the next one.
func Hash(e Event) string {
	canonical := strings.Join([]string{
		version,
		strconv.FormatInt(e.LoteID, 10),
		strconv.Itoa(e.Seq),
		e.Type,
		strconv.Quote(e.Description),
		Normalize(e.OccurredAt).Format(time.RFC3339Nano),
		e.PreviousHash,
	}, "\n")
	return sum(canonical)
}

// StoredEvent is an event as persisted, with the hash that was saved for it.
type StoredEvent struct {
	Event
	Hash string
}

// VerifyChain recomputes every hash in order and reports the first event whose
// stored hash or link to the previous event does not match. It returns the
// last hash of a valid chain.
func VerifyChain(loteID int64, events []StoredEvent) (lastHash string, brokenSeq int, ok bool) {
	prev := GenesisHash(loteID)
	for i, ev := range events {
		if ev.Seq != i+1 || ev.LoteID != loteID || ev.PreviousHash != prev || Hash(ev.Event) != ev.Hash {
			return "", ev.Seq, false
		}
		prev = ev.Hash
	}
	return prev, 0, true
}

func sum(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}
