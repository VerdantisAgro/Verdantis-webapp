package user

import (
	"context"
	"testing"

	"github.com/caiolucasxz55/verdantis/apps/api/internal/apperr"
)

type memRepo struct {
	users []*User
}

func (m *memRepo) Create(_ context.Context, u *User) error {
	for _, existing := range m.users {
		if existing.Email == u.Email || existing.CPF == u.CPF {
			return ErrDuplicate
		}
	}
	u.ID = int64(len(m.users) + 1)
	m.users = append(m.users, u)
	return nil
}

func (m *memRepo) FindByEmail(_ context.Context, email string) (*User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, nil
}

func (m *memRepo) FindByID(_ context.Context, id int64) (*User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, nil
}

type fakeTokens struct{}

func (fakeTokens) Issue(int64) (string, error) { return "token", nil }

const validCPFNumber = "52998224725"

func TestRegisterAndLogin(t *testing.T) {
	svc := NewService(&memRepo{}, fakeTokens{})
	ctx := context.Background()

	s, err := svc.Register(ctx, RegisterInput{Name: "Maria Silva", Email: " Maria@Exemplo.com ", CPF: "529.982.247-25", Password: "senha-forte"})
	if err != nil {
		t.Fatalf("register: %v", err)
	}
	if s.User.Email != "maria@exemplo.com" || s.User.CPF != validCPFNumber {
		t.Fatalf("input not normalized: %+v", s.User)
	}

	if _, err := svc.Login(ctx, "MARIA@exemplo.com", "senha-forte"); err != nil {
		t.Fatalf("login: %v", err)
	}
	_, err = svc.Login(ctx, "maria@exemplo.com", "errada")
	if e, ok := apperr.As(err); !ok || e.Kind != apperr.KindUnauthorized {
		t.Fatalf("wrong password: got %v, want unauthorized", err)
	}
}

func TestRegisterRejectsInvalidAndDuplicate(t *testing.T) {
	svc := NewService(&memRepo{}, fakeTokens{})
	ctx := context.Background()

	_, err := svc.Register(ctx, RegisterInput{Name: "Jo", Email: "x", CPF: "11111111111", Password: "123"})
	e, ok := apperr.As(err)
	if !ok || e.Kind != apperr.KindInvalid || len(e.Fields) != 4 {
		t.Fatalf("got %v, want 4 field errors", err)
	}

	in := RegisterInput{Name: "Maria Silva", Email: "maria@exemplo.com", CPF: validCPFNumber, Password: "senha-forte"}
	if _, err := svc.Register(ctx, in); err != nil {
		t.Fatal(err)
	}
	_, err = svc.Register(ctx, in)
	if e, ok := apperr.As(err); !ok || e.Kind != apperr.KindConflict {
		t.Fatalf("got %v, want conflict", err)
	}
}

func TestValidCPF(t *testing.T) {
	for cpf, want := range map[string]bool{
		validCPFNumber: true,
		"52998224724":  false,
		"00000000000":  false,
		"123":          false,
	} {
		if got := validCPF(cpf); got != want {
			t.Errorf("validCPF(%q) = %v, want %v", cpf, got, want)
		}
	}
}
