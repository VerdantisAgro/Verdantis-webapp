// Package user handles accounts: registration, login and profile.
package user

import (
	"context"
	"errors"
	"net/mail"
	"strings"
	"time"
	"unicode"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
	"github.com/caiolucasxz55/verdantis/apps/api/internal/auth"
)

type User struct {
	ID           int64
	Name         string
	Email        string
	CPF          string
	PasswordHash string
	CreatedAt    time.Time
}

var ErrDuplicate = errors.New("duplicate user")

type Repository interface {
	Create(ctx context.Context, u *User) error
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByID(ctx context.Context, id int64) (*User, error)
}

type TokenIssuer interface {
	Issue(userID int64) (string, error)
}

type Service struct {
	repo   Repository
	tokens TokenIssuer
}

func NewService(repo Repository, tokens TokenIssuer) *Service {
	return &Service{repo: repo, tokens: tokens}
}

type RegisterInput struct {
	Name     string
	Email    string
	CPF      string
	Password string
}

type Session struct {
	Token string
	User  *User
}

func (s *Service) Register(ctx context.Context, in RegisterInput) (*Session, error) {
	in.Name = strings.TrimSpace(in.Name)
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	in.CPF = onlyDigits(in.CPF)

	v := apperr.Validator{}
	v.Check(len(in.Name) >= 3, "nomeCompleto", "Informe o nome completo.")
	v.Check(isEmail(in.Email), "email", "E-mail invalido.")
	v.Check(validCPF(in.CPF), "cpf", "CPF invalido.")
	v.Check(len(in.Password) >= 8, "senha", "A senha deve ter pelo menos 8 caracteres.")
	if err := v.Err(); err != nil {
		return nil, err
	}

	hash, err := auth.HashPassword(in.Password)
	if err != nil {
		return nil, err
	}
	u := &User{Name: in.Name, Email: in.Email, CPF: in.CPF, PasswordHash: hash}
	if err := s.repo.Create(ctx, u); err != nil {
		if errors.Is(err, ErrDuplicate) {
			return nil, apperr.Conflict("Ja existe uma conta com este e-mail ou CPF.")
		}
		return nil, err
	}
	return s.newSession(u)
}

func (s *Service) Login(ctx context.Context, email, password string) (*Session, error) {
	u, err := s.repo.FindByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil {
		return nil, err
	}
	// Same message for unknown e-mail and wrong password.
	if u == nil || !auth.CheckPassword(u.PasswordHash, password) {
		return nil, apperr.Unauthorized("E-mail ou senha invalidos.")
	}
	return s.newSession(u)
}

func (s *Service) Get(ctx context.Context, id int64) (*User, error) {
	u, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, apperr.NotFound("Usuario nao encontrado.")
	}
	return u, nil
}

func (s *Service) newSession(u *User) (*Session, error) {
	token, err := s.tokens.Issue(u.ID)
	if err != nil {
		return nil, err
	}
	return &Session{Token: token, User: u}, nil
}

func isEmail(v string) bool {
	addr, err := mail.ParseAddress(v)
	return err == nil && addr.Address == v
}

func onlyDigits(v string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) {
			return r
		}
		return -1
	}, v)
}

// validCPF checks the two verification digits of a Brazilian CPF.
func validCPF(cpf string) bool {
	if len(cpf) != 11 || strings.Count(cpf, cpf[:1]) == 11 {
		return false
	}
	digit := func(n int) int {
		sum := 0
		for i := 0; i < n; i++ {
			sum += int(cpf[i]-'0') * (n + 1 - i)
		}
		d := (sum * 10) % 11
		if d == 10 {
			return 0
		}
		return d
	}
	return digit(9) == int(cpf[9]-'0') && digit(10) == int(cpf[10]-'0')
}
