package schema

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type Field struct {
	id           FieldID
	name         string
	description  string
	key          key.Key
	unique       bool
	multiValue   bool
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

func (f *Field) Key() key.Key {
	return f.key
}

func (f *Field) SetKey(key key.Key) error {
	if !key.IsValid() {
		return ErrInvalidKey
	}
	f.key = key
	return nil
}

func (f *Field) Unique() bool {
	return f.unique
}

func (f *Field) MultiValue() bool {
	return f.multiValue
}

func (f *Field) Required() bool {
	return f.required
}

func (f *Field) DefaultValue() *value.Value {
	return f.defaultValue
}

func (f *Field) SetRequired(req bool) {
	f.required = req
}

func (f *Field) SetUnique(unique bool) {
	f.unique = unique
}

func (f *Field) SetMultiValue(mv bool) {
	f.multiValue = mv
}

func (f *Field) SetDefaultValue(v *value.Value) error {
	if err := f.typeProperty.Validate(v); err != nil {
		return err
	}
	f.defaultValue = v
	return nil
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

func (f *Field) SetUpdatedAt(updatedAt time.Time) {
	f.updatedAt = updatedAt
}

func (f *Field) Type() value.Type {
	return f.typeProperty.Type()
}

func (f *Field) TypeProperty() *TypeProperty {
	return f.typeProperty
}

func (f *Field) SetTypeProperty(tp *TypeProperty) {
	if f.typeProperty == nil || tp == nil || f.typeProperty.Type() != tp.Type() {
		return
	}
	f.typeProperty = tp.Clone()
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
		multiValue:   f.multiValue,
		required:     f.required,
		updatedAt:    f.updatedAt,
		defaultValue: f.defaultValue.Clone(),
		typeProperty: f.typeProperty.Clone(),
	}
}

func (f *Field) Validate(v *value.Value) error {
	if f.required && v.IsEmpty() {
		return ErrValueRequired
	}

	return f.typeProperty.Validate(v)
}

func (f *Field) ValidateMultiple(vv []*value.Value) error {
	if !f.multiValue && len(vv) > 1 {
		return ErrValueShouldBeSingle
	}

	if f.required && len(vv) == 0 {
		return ErrValueRequired
	}

	for _, v := range vv {
		if err := f.Validate(v); err != nil {
			return err
		}
	}

	return nil
}

var (
	ErrValueRequired       = errors.New("value is missing but required")
	ErrValueShouldBeSingle = errors.New("value should be single")
)
