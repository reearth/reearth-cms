package schema

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
)

type Field struct {
	id               FieldID
	name             string
	description      string
	key              key.Key
	unique           bool
	multiValue       bool
	required         bool
	overrideRequired bool
	updatedAt        time.Time
	typeProperty     *TypeProperty
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

func (f *Field) SetKey(key key.Key) {
	f.key = key
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

func (f *Field) OverrideRequired() bool {
	return f.overrideRequired
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

func (f *Field) Type() Type {
	return f.typeProperty.Type()
}

func (f *Field) TypeProperty() *TypeProperty {
	return f.typeProperty
}

func (f *Field) SetTypeProperty(tp *TypeProperty) {
	if f.typeProperty != nil && tp != nil && f.typeProperty.Type() != tp.Type() {
		return
	}
	f.typeProperty = tp.Clone()
}

func (f *Field) Clone() *Field {
	if f == nil {
		return nil
	}

	return &Field{
		id:               f.id.Clone(),
		name:             f.name,
		description:      f.description,
		key:              f.key,
		unique:           f.unique,
		multiValue:       f.multiValue,
		required:         f.required,
		overrideRequired: f.overrideRequired,
		updatedAt:        f.updatedAt,
		typeProperty:     f.typeProperty.Clone(),
	}
}
