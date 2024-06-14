package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldPosition struct {
	t value.Type
}

func NewPosition(t value.Type) *FieldPosition {
	return &FieldPosition{
		t: t,
	}
}

func (f *FieldPosition) Type() value.Type {
	return f.t
}

func (f *FieldPosition) Clone() *FieldPosition {
	if f == nil {
		return nil
	}
	return &FieldPosition{
		t: f.t,
	}
}

func (f *FieldPosition) Validate(v *value.Value) error {
	if v.Type() != f.t {
		return ErrInvalidValue
	}

	_, ok := v.ValuePosition()
	if !ok {
		return ErrInvalidValue
	}

	return nil
}
