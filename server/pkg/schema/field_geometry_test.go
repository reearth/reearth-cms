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

	tests := []struct {
		name string
		v    *value.Value
		want error
	}{
		{name: "geometry", v: value.TypeGeometry.Value(`{"type":"Point","coordinates":[1,1]}`)},
		{name: "text", v: value.TypeText.Value("a"), want: ErrInvalidValue},
		{name: "geometry editor", v: value.TypeGeometryEditor.Value(`{"type":"Point","coordinates":[1,1]}`), want: ErrInvalidValue},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := NewGeometry().Validate(tt.v)
			if tt.want == nil {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, tt.want)
			}
		})
	}
}
