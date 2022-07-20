package schema

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
)

type Field struct {
	id           FieldID
	name         string
	description  string
	key          key.Key
	updatedAt    time.Time
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

func (f *Field) SetKey(key key.Key) {
	f.key = key
}

func (f *Field) CreatedAt() time.Time {
	return f.id.Timestamp()
}

func (f *Field) UpdatedAt() time.Time {
	return f.updatedAt
}

func (f *Field) SetUpdatedAt(updatedAt time.Time) {
	f.updatedAt = updatedAt
}

func (f *Field) Type() Type {
	return f.typeProperty.Type()
}
