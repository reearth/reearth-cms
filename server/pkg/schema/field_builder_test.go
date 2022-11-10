package schema

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/stretchr/testify/assert"
)

func TestNewField(t *testing.T) {
	fb := NewField(&TypeProperty{})
	assert.Equal(t, &FieldBuilder{f: &Field{typeProperty: &TypeProperty{}}}, fb)
}

func TestFieldBuilder_Build(t *testing.T) {
	ff := &Field{
		id:           id.NewFieldID(),
		key:          key.New("xxxxxxxx"),
		typeProperty: &TypeProperty{},
	}
	f, err := (&FieldBuilder{f: ff}).Build()
	assert.NoError(t, err)
	assert.Equal(t, ff, f)

	f, err = (&FieldBuilder{f: &Field{}}).Build()
	assert.ErrorIs(t, err, ErrInvalidID)
	assert.Nil(t, f)

	f, err = (&FieldBuilder{f: &Field{id: id.NewFieldID()}}).Build()
	assert.ErrorIs(t, err, ErrInvalidKey)
	assert.Nil(t, f)

	f, err = (&FieldBuilder{f: &Field{
		id:  id.NewFieldID(),
		key: key.New("xxxxxxxx"),
	}}).Build()
	assert.ErrorIs(t, err, ErrInvalidTypeProperty)
	assert.Nil(t, f)

	wantErr := errors.New("a")
	f, err = (&FieldBuilder{err: wantErr}).Build()
	assert.Same(t, wantErr, err)
	assert.Nil(t, f)
}
