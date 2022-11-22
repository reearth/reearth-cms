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
	defaultValue *value.Value
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

func (f *Field) DefaultValue() *value.Value {
	return f.defaultValue
}

func (f *Field) SetDefaultValue(v *value.Value) error {
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
		if err := tp.Validate(f.DefaultValue()); err != nil {
			return err
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

func (f *Field) Validate(v *value.Value) error {
	if f.required && v.IsEmpty() {
		return ErrValueRequired
	}
	if v.IsEmpty() {
		return nil
	}
	return f.typeProperty.Validate(v)
}
