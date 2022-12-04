package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewField(t *testing.T) {
	// ok
	tp := NewText(nil).TypeProperty()
	dv := tp.Type().Value("aaa")
	id := id.NewFieldID()
	k := key.Random()
	assert.Equal(
		t,
		&Field{
			id:           id,
			name:         "name",
			description:  "a",
			key:          k,
			unique:       true,
			multiple:     true,
			required:     true,
			typeProperty: tp,
			defaultValue: dv.AsMultiple(),
		},
		NewField(tp).
			ID(id).
			Name("name").
			Description("a").
			Key(k).
			Multiple(true).
			Unique(true).
			Required(true).
			DefaultValue(dv.AsMultiple()).
			MustBuild(),
	)

	// error: invalid id
	_, err := NewField(tp).Build()
	assert.Equal(t, ErrInvalidID, err)

	// error: invalid type
	_, err = NewField(nil).NewID().Build()
	assert.Equal(t, ErrInvalidType, err)

	// error: invalid key
	_, err = NewField(tp).NewID().Build()
	assert.Equal(t, ErrInvalidKey, err)

	// error: invalid default value
	_, err = NewField(NewText(nil).TypeProperty()).
		NewID().
		Key(k).
		DefaultValue(value.TypeBool.Value(true).AsMultiple()).
		Build()
	assert.Equal(t, ErrInvalidValue, err)

	assert.Panics(t, func() {
		_ = NewField(tp).MustBuild()
	})
}
