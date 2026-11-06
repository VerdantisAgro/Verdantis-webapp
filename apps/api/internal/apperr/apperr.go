// Package apperr defines domain errors that the HTTP layer maps to status codes.
package apperr

import "errors"

type Kind int

const (
	KindInvalid Kind = iota + 1
	KindNotFound
	KindConflict
	KindUnauthorized
)

type Error struct {
	Kind    Kind
	Message string
	Fields  map[string]string
}

func (e *Error) Error() string { return e.Message }

func Invalid(msg string, fields map[string]string) error {
	return &Error{Kind: KindInvalid, Message: msg, Fields: fields}
}

func NotFound(msg string) error     { return &Error{Kind: KindNotFound, Message: msg} }
func Conflict(msg string) error     { return &Error{Kind: KindConflict, Message: msg} }
func Unauthorized(msg string) error { return &Error{Kind: KindUnauthorized, Message: msg} }

// As returns the *Error wrapped in err, if any.
func As(err error) (*Error, bool) {
	var e *Error
	ok := errors.As(err, &e)
	return e, ok
}

// Validator collects field errors and turns them into a single Invalid error.
type Validator map[string]string

func (v Validator) Check(ok bool, field, msg string) {
	if !ok {
		if _, exists := v[field]; !exists {
			v[field] = msg
		}
	}
}

func (v Validator) Err() error {
	if len(v) == 0 {
		return nil
	}
	return Invalid("Dados invalidos.", v)
}
