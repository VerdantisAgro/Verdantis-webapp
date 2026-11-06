// Package lote manages production lots, their traceability events and the
// certificate issued when a lote is finalized.
package lote

import (
	"context"
	"math"
	"time"
)

const (
	StatusActive    = "ativo"
	StatusFinalized = "finalizado"
)

type Lote struct {
	ID               int64
	UserID           int64
	Name             string
	Crop             string
	Variety          string
	AreaHectares     float64
	PlantingDate     *time.Time
	ExpectedHarvest  *time.Time
	ProductionTotal  float64
	CostTotal        float64
	SalePrice        float64
	Status           string
	VerificationCode *string
	FinalHash        *string
	Signature        *string
	FinalizedAt      *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func (l *Lote) Revenue() float64 { return round2(l.ProductionTotal * l.SalePrice) }
func (l *Lote) Profit() float64  { return round2(l.Revenue() - l.CostTotal) }
func (l *Lote) IsFinalized() bool {
	return l.Status == StatusFinalized
}

type Event struct {
	ID           int64
	LoteID       int64
	Seq          int
	Type         string
	Description  string
	OccurredAt   time.Time
	PreviousHash string
	Hash         string
}

// Certificate is what finalizing a lote stores and returns.
type Certificate struct {
	Code        string
	FinalHash   string
	Signature   string
	FinalizedAt time.Time
	EventCount  int
}

// Repository persists lotes. Methods that take a callback run it inside a
// transaction holding a row lock on the lote, so concurrent requests cannot
// fork the event chain or finalize twice.
type Repository interface {
	List(ctx context.Context, userID int64) ([]Lote, error)
	Get(ctx context.Context, userID, id int64) (*Lote, error)
	Create(ctx context.Context, l *Lote) error
	Update(ctx context.Context, l *Lote) error
	Delete(ctx context.Context, userID, id int64) (bool, error)
	ListEvents(ctx context.Context, loteID int64) ([]Event, error)
	AppendEvent(ctx context.Context, userID, loteID int64, next func(l *Lote, last *Event) (*Event, error)) (*Event, error)
	Finalize(ctx context.Context, userID, loteID int64, seal func(l *Lote, events []Event) (*Certificate, error)) (*Certificate, error)
	FindByCode(ctx context.Context, code string) (*Lote, string, error)
}

func round2(v float64) float64 { return math.Round(v*100) / 100 }
