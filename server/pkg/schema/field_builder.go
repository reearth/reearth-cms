package schema

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/exp/slices"
)

var ErrInvalidKey = errors.New("invalid key")
var ErrInvalidTypeProperty = errors.New("type property missing")
var ErrUnsupportedUniqueField = errors.New("such field type can be unique")

var unsupportedUniqueTypes = []value.Type{value.TypeTag}

type FieldBuilder struct {
	f   *Field
	err error
}

func NewField(tp *TypeProperty) *FieldBuilder {
	return &FieldBuilder{
		f: &Field{typeProperty: tp},
	}
}

func (b *FieldBuilder) Build() (*Field, error) {
	if b.err != nil {
		return nil, b.err
	}
	if b.f.id.IsNil() {
		return nil, ErrInvalidID
	}
	if !b.f.key.IsValid() {
		return nil, ErrInvalidKey
	}
	if b.f.typeProperty == nil {
		return nil, ErrInvalidTypeProperty
	}
	if b.f.unique && !IsUniqueSupported(b.f.Type()) {
		return nil, ErrUnsupportedUniqueField
	}

	return b.f, nil
}

func (b *FieldBuilder) MustBuild() *Field {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *FieldBuilder) ID(id FieldID) *FieldBuilder {
	b.f.id = id
	return b
}

func (b *FieldBuilder) NewID() *FieldBuilder {
	b.f.id = NewFieldID()
	return b
}

func (b *FieldBuilder) Options(unique, multiValue, required bool) *FieldBuilder {
	b.f.unique = unique
	b.f.multiValue = multiValue
	b.f.required = required
	return b
}

func (b *FieldBuilder) Name(name string) *FieldBuilder {
	b.f.name = name
	return b
}

func (b *FieldBuilder) Description(description string) *FieldBuilder {
	b.f.description = description
	return b
}

func (b *FieldBuilder) Key(key key.Key) *FieldBuilder {
	b.err = b.f.SetKey(key)
	return b
}

func (b *FieldBuilder) RandomKey() *FieldBuilder {
	b.f.key = key.Random()
	return b
}

func (b *FieldBuilder) UpdatedAt(t time.Time) *FieldBuilder {
	b.f.updatedAt = t
	return b
}

func (b *FieldBuilder) DefaultValue(v *value.Value) *FieldBuilder {
	b.err = b.f.SetDefaultValue(v)
	return b
}

func IsUniqueSupported(t value.Type) bool {
	return !slices.Contains(unsupportedUniqueTypes, t)
}
