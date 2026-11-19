package schema

import (
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// bigValidGeoJSON builds a valid GeoJSON LineString whose serialized form is at
// least size bytes by padding it with coordinate pairs.
func bigValidGeoJSON(size int) string {
	coords := make([][]float64, 0, size/8)
	for len(coords) < 2 || len(mustMarshalJSON(map[string]any{"type": "LineString", "coordinates": coords})) < size {
		coords = append(coords, []float64{1.234567, 2.345678})
	}
	return string(mustMarshalJSON(map[string]any{"type": "LineString", "coordinates": coords}))
}

func mustMarshalJSON(v any) []byte {
	return lo.Must(json.Marshal(v))
}

func TestField_ValidationError(t *testing.T) {
	f := NewField(NewURL().TypeProperty()).NewID().Key(id.NewKey("website")).MustBuild()

	t.Run("limit errors map to their specific code, even when wrapped", func(t *testing.T) {
		for err, want := range map[error]FieldValidationCode{
			ErrURLFieldMaxLengthExceeded:   FieldValidationCodeMaxLengthExceeded,
			ErrGeoFieldMaxSizeExceeded:     FieldValidationCodeMaxSizeExceeded,
			ErrGeoFieldInvalidGeoStructure: FieldValidationCodeInvalidGeoStructure,
		} {
			wrapped := fmt.Errorf("ctx: %w", err)
			assert.Equal(t, FieldValidationError{
				Field:  f.ID().Ref(),
				Key:    f.Key().Ref(),
				Code:   want,
				Detail: wrapped,
			}, f.ValidationError(wrapped, FieldValidationCodeConstraint))
		}
	})

	t.Run("other error uses fallback code", func(t *testing.T) {
		boom := errors.New("boom")
		got := f.ValidationError(boom, FieldValidationCodeConstraint)
		assert.Equal(t, FieldValidationError{
			Field:  f.ID().Ref(),
			Key:    f.Key().Ref(),
			Code:   FieldValidationCodeConstraint,
			Detail: boom,
		}, got)
		assert.ErrorIs(t, got, boom)
	})
}
