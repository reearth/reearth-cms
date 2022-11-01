package value

import (
	"errors"

	"github.com/samber/lo"
)

type Value struct {
	t Type
	v any
}

type Type string

const TypeUnknown Type = ""

var ErrInvalidValue = errors.New("invalid value")

func New(t Type, v any) (*Value, error) {
	if v == nil {
		return nil, ErrInvalidValue
	}
	return NewOptional(t, v)
}

func NewOptional(t Type, v any) (*Value, error) {
	if ty := types[t]; ty != nil {
		if v == nil {
			return &Value{t: t, v: v}, nil
		}

		if w, err := ty.New(v); err != nil {
			return nil, ErrInvalidValue
		} else {
			return &Value{t: t, v: w}, nil
		}
	}
	return nil, ErrInvalidValue
}

func Must(t Type, v any) *Value {
	return lo.Must(New(t, v))
}

func (v *Value) Type() Type {
	if v == nil {
		return TypeUnknown
	}
	return v.t
}

func (v *Value) Value() any {
	if v == nil {
		return nil
	}
	return v.v
}
