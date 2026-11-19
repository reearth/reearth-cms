package schema

import (
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

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
