package user

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

const selectUser = `SELECT id, name, email, cpf, password_hash, created_at FROM users`

func (r *PostgresRepository) Create(ctx context.Context, u *User) error {
	err := r.db.QueryRow(ctx,
		`INSERT INTO users (name, email, cpf, password_hash) VALUES ($1, $2, $3, $4)
		 RETURNING id, created_at`,
		u.Name, u.Email, u.CPF, u.PasswordHash,
	).Scan(&u.ID, &u.CreatedAt)

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
		return ErrDuplicate
	}
	return err
}

func (r *PostgresRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
	return r.findOne(ctx, selectUser+` WHERE lower(email) = lower($1)`, email)
}

func (r *PostgresRepository) FindByID(ctx context.Context, id int64) (*User, error) {
	return r.findOne(ctx, selectUser+` WHERE id = $1`, id)
}

func (r *PostgresRepository) findOne(ctx context.Context, query string, arg any) (*User, error) {
	var u User
	err := r.db.QueryRow(ctx, query, arg).
		Scan(&u.ID, &u.Name, &u.Email, &u.CPF, &u.PasswordHash, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
