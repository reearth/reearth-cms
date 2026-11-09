package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometry(t *testing.T) {
	t.Parallel()

	f := NewGeometry()
	assert.Equal(t, &FieldGeometry{}, f)
	assert.Equal(t, value.TypeGeometry, f.Type())
	assert.Equal(t, &TypeProperty{t: value.TypeGeometry, geometry: f}, f.TypeProperty())
	assert.Equal(t, f, f.Clone())
	assert.Nil(t, (*FieldGeometry)(nil).Clone())
	assert.NoError(t, f.ValidateMultiple(nil))
}

func TestFieldGeometry_Validate(t *testing.T) {
	t.Parallel()

	assert.NoError(t, NewGeometry().Validate(value.TypeGeometry.Value(`{"type":"Point","coordinates":[1,1]}`)))
	assert.ErrorIs(t, NewGeometry().Validate(value.TypeText.Value("a")), ErrInvalidValue)
	assert.ErrorIs(t, NewGeometry().Validate(value.TypeGeometryEditor.Value(`{"type":"Point","coordinates":[1,1]}`)), ErrInvalidValue)
}
