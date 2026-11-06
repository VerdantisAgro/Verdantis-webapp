package lote

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

const loteColumns = `id, user_id, name, crop, variety, area_hectares, planting_date, expected_harvest,
	production_total, cost_total, sale_price, status, verification_code, final_hash, signature,
	finalized_at, created_at, updated_at`

func scanLote(row pgx.Row) (*Lote, error) {
	var l Lote
	err := row.Scan(&l.ID, &l.UserID, &l.Name, &l.Crop, &l.Variety, &l.AreaHectares,
		&l.PlantingDate, &l.ExpectedHarvest, &l.ProductionTotal, &l.CostTotal, &l.SalePrice,
		&l.Status, &l.VerificationCode, &l.FinalHash, &l.Signature, &l.FinalizedAt,
		&l.CreatedAt, &l.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *PostgresRepository) List(ctx context.Context, userID int64) ([]Lote, error) {
	rows, err := r.db.Query(ctx,
		`SELECT `+loteColumns+` FROM lotes WHERE user_id = $1 ORDER BY created_at DESC, id DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lotes := []Lote{}
	for rows.Next() {
		l, err := scanLote(rows)
		if err != nil {
			return nil, err
		}
		lotes = append(lotes, *l)
	}
	return lotes, rows.Err()
}

func (r *PostgresRepository) Get(ctx context.Context, userID, id int64) (*Lote, error) {
	return scanLote(r.db.QueryRow(ctx,
		`SELECT `+loteColumns+` FROM lotes WHERE id = $1 AND user_id = $2`, id, userID))
}

func (r *PostgresRepository) Create(ctx context.Context, l *Lote) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO lotes (user_id, name, crop, variety, area_hectares, planting_date, expected_harvest,
			production_total, cost_total, sale_price, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING id, created_at, updated_at`,
		l.UserID, l.Name, l.Crop, l.Variety, l.AreaHectares, l.PlantingDate, l.ExpectedHarvest,
		l.ProductionTotal, l.CostTotal, l.SalePrice, l.Status,
	).Scan(&l.ID, &l.CreatedAt, &l.UpdatedAt)
}

func (r *PostgresRepository) Update(ctx context.Context, l *Lote) error {
	return r.db.QueryRow(ctx,
		`UPDATE lotes SET name = $3, crop = $4, variety = $5, area_hectares = $6, planting_date = $7,
			expected_harvest = $8, production_total = $9, cost_total = $10, sale_price = $11,
			updated_at = now()
		 WHERE id = $1 AND user_id = $2
		 RETURNING updated_at`,
		l.ID, l.UserID, l.Name, l.Crop, l.Variety, l.AreaHectares, l.PlantingDate, l.ExpectedHarvest,
		l.ProductionTotal, l.CostTotal, l.SalePrice,
	).Scan(&l.UpdatedAt)
}

func (r *PostgresRepository) Delete(ctx context.Context, userID, id int64) (bool, error) {
	tag, err := r.db.Exec(ctx, `DELETE FROM lotes WHERE id = $1 AND user_id = $2`, id, userID)
	return tag.RowsAffected() > 0, err
}

const eventColumns = `id, lote_id, seq, type, description, occurred_at, previous_hash, hash`

func (r *PostgresRepository) ListEvents(ctx context.Context, loteID int64) ([]Event, error) {
	return listEvents(ctx, r.db, loteID)
}

type querier interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
}

func listEvents(ctx context.Context, q querier, loteID int64) ([]Event, error) {
	rows, err := q.Query(ctx, `SELECT `+eventColumns+` FROM lote_events WHERE lote_id = $1 ORDER BY seq`, loteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []Event{}
	for rows.Next() {
		var e Event
		if err := rows.Scan(&e.ID, &e.LoteID, &e.Seq, &e.Type, &e.Description, &e.OccurredAt,
			&e.PreviousHash, &e.Hash); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, rows.Err()
}

// lockLote loads the lote with FOR UPDATE inside tx. It returns nil when the
// lote does not exist or belongs to another user.
func lockLote(ctx context.Context, tx pgx.Tx, userID, loteID int64) (*Lote, error) {
	return scanLote(tx.QueryRow(ctx,
		`SELECT `+loteColumns+` FROM lotes WHERE id = $1 AND user_id = $2 FOR UPDATE`, loteID, userID))
}

func (r *PostgresRepository) AppendEvent(ctx context.Context, userID, loteID int64,
	next func(l *Lote, last *Event) (*Event, error),
) (*Event, error) {
	var created *Event
	err := pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		l, err := lockLote(ctx, tx, userID, loteID)
		if err != nil || l == nil {
			return err
		}

		var last *Event
		var e Event
		err = tx.QueryRow(ctx,
			`SELECT `+eventColumns+` FROM lote_events WHERE lote_id = $1 ORDER BY seq DESC LIMIT 1`, loteID,
		).Scan(&e.ID, &e.LoteID, &e.Seq, &e.Type, &e.Description, &e.OccurredAt, &e.PreviousHash, &e.Hash)
		switch {
		case err == nil:
			last = &e
		case !errors.Is(err, pgx.ErrNoRows):
			return err
		}

		ev, err := next(l, last)
		if err != nil {
			return err
		}
		if err := tx.QueryRow(ctx,
			`INSERT INTO lote_events (lote_id, seq, type, description, occurred_at, previous_hash, hash)
			 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
			ev.LoteID, ev.Seq, ev.Type, ev.Description, ev.OccurredAt, ev.PreviousHash, ev.Hash,
		).Scan(&ev.ID); err != nil {
			return err
		}
		created = ev
		return nil
	})
	return created, err
}

func (r *PostgresRepository) Finalize(ctx context.Context, userID, loteID int64,
	seal func(l *Lote, events []Event) (*Certificate, error),
) (*Certificate, error) {
	var cert *Certificate
	err := pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		l, err := lockLote(ctx, tx, userID, loteID)
		if err != nil || l == nil {
			return err
		}
		events, err := listEvents(ctx, tx, loteID)
		if err != nil {
			return err
		}
		c, err := seal(l, events)
		if err != nil {
			return err
		}
		if _, err := tx.Exec(ctx,
			`UPDATE lotes SET status = $2, verification_code = $3, final_hash = $4, signature = $5,
				finalized_at = $6, updated_at = now()
			 WHERE id = $1`,
			loteID, StatusFinalized, c.Code, c.FinalHash, c.Signature, c.FinalizedAt,
		); err != nil {
			return err
		}
		cert = c
		return nil
	})
	return cert, err
}

func (r *PostgresRepository) FindByCode(ctx context.Context, code string) (*Lote, string, error) {
	var producer string
	l, err := scanLote(r.db.QueryRow(ctx,
		`SELECT `+loteColumns+` FROM lotes WHERE verification_code = $1`, code))
	if err != nil || l == nil {
		return nil, "", err
	}
	if err := r.db.QueryRow(ctx, `SELECT name FROM users WHERE id = $1`, l.UserID).Scan(&producer); err != nil {
		return nil, "", err
	}
	return l, producer, nil
}
