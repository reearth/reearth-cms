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

func TestFieldValidationErrors_Details(t *testing.T) {
	t.Parallel()

	fid := NewFieldID()

	fe := func(index *int, group *id.ItemGroupID) FieldValidationError {
		return FieldValidationError{Field: fid.Ref(), Key: id.NewKey("title").Ref(), Code: FieldValidationCodeConstraint, Detail: ErrInvalidValue, Index: index, Group: group}
	}

	tests := []struct {
		name    string
		err     FieldValidationError
		wantKey string
	}{
		{name: "top-level field", err: fe(nil, nil), wantKey: "title"},
		{name: "element of a top-level multiple field", err: fe(lo.ToPtr(1), nil), wantKey: "title[1]"},
		//{name: "field in a group", err: fe(nil, &single), wantKey: "group.title"},
		//{name: "element of a multiple field in a group", err: fe(lo.ToPtr(1), &single), wantKey: "group.title[1]"},
		//{name: "field in a multiple group", err: fe(nil, &multiple), wantKey: "groups[2].title"},
		//{name: "element of a multiple field in a multiple group", err: fe(lo.ToPtr(0), &multiple), wantKey: "groups[2].title[0]"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := FieldValidationErrors{tt.err}.Details()
			assert.Equal(t, []FieldValidationErrorDetail{{Field: tt.wantKey, Code: string(FieldValidationCodeConstraint), Detail: ErrInvalidValue.Error()}}, got)

			// internal IDs are never exposed
			b, err := json.Marshal(got)
			assert.NoError(t, err)
			assert.NotContains(t, string(b), fid.String())
			if tt.err.Group != nil {
				assert.NotContains(t, string(b), tt.err.Group.String())
			}
		})
	}
}
