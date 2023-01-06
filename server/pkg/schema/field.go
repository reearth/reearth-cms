package schema

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

var ErrValueRequired = errors.New("value is required")

type Field struct {
	id           FieldID
	name         string
	description  string
	key          key.Key
	unique       bool
	multiple     bool
	required     bool
	updatedAt    time.Time
	defaultValue *value.Multiple
	typeProperty *TypeProperty
}

func (f *Field) ID() FieldID {
	return f.id
}

func (f *Field) Name() string {
	return f.name
}

func (f *Field) SetName(name string) {
	f.name = name
}

func (f *Field) Description() string {
	return f.description
}

func (f *Field) SetDescription(description string) {
	f.description = description
}

func (f *Field) DefaultValue() *value.Multiple {
	return f.defaultValue
}

func (f *Field) SetDefaultValue(v *value.Multiple) error {
	if v == nil {
		f.defaultValue = nil
		return nil
	}

	if v.Type() != f.Type() {
		return ErrInvalidValue
	}
	if err := f.Validate(v); err != nil {
		return err
	}
	f.defaultValue = v
	return nil
}

func (f *Field) Key() key.Key {
	return f.key
}

func (f *Field) SetKey(key key.Key) {
	f.key = key
}

func (f *Field) Unique() bool {
	return f.unique
}

func (f *Field) Multiple() bool {
	return f.multiple
}

func (f *Field) Required() bool {
	return f.required
}

func (f *Field) SetRequired(req bool) {
	f.required = req
}

func (f *Field) SetUnique(unique bool) {
	f.unique = unique
}

func (f *Field) SetMultiple(m bool) {
	f.multiple = m
}

func (f *Field) CreatedAt() time.Time {
	return f.id.Timestamp()
}

func (f *Field) UpdatedAt() time.Time {
	if f.updatedAt.IsZero() {
		return f.id.Timestamp()
	}
	return f.updatedAt
}

func (f *Field) Type() value.Type {
	return f.typeProperty.Type()
}

func (f *Field) TypeProperty() *TypeProperty {
	return f.typeProperty
}

func (f *Field) SetTypeProperty(tp *TypeProperty) error {
	if tp == nil {
		return ErrInvalidType
	}
	if f.defaultValue != nil {
		for _, v := range f.defaultValue.Values() {
			if err := tp.Validate(v); err != nil {
				return err
			}
		}
	}
	f.typeProperty = tp
	return nil
}

func (f *Field) Clone() *Field {
	if f == nil {
		return nil
	}

	return &Field{
		id:           f.id,
		name:         f.name,
		description:  f.description,
		key:          f.key,
		unique:       f.unique,
		multiple:     f.multiple,
		required:     f.required,
		updatedAt:    f.updatedAt,
		typeProperty: f.typeProperty.Clone(),
		defaultValue: f.defaultValue.Clone(),
	}
}

// Validate the Multiple value against the Field schema
// if its multiple it will return only the first error
func (f *Field) Validate(m *value.Multiple) error {
	if f.required && m.IsEmpty() {
		return ErrValueRequired
	}
	if m.IsEmpty() {
		return nil
	}
	if !f.multiple && m.Len() > 1 {
		return ErrInvalidValue
	}
	for _, v := range m.Values() {
		if err := f.typeProperty.Validate(v); err != nil {
			return err
		}
	}
	return nil
}
