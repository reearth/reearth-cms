package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldRichText_NewFieldRichText(t *testing.T) {
	ml := 123
	b := NewFieldRichText(&ml)
	assert.Equal(t, &FieldRichText{}, b)
}

func TestFieldRichText_TypeProperty(t *testing.T) {
	tp := (&FieldRichText{}).TypeProperty()
	assert.Equal(t, &TypeProperty{richText: &FieldRichText{}}, tp)
}

func TestFieldRichText_Validate(t *testing.T) {
	err := (&FieldRichText{}).Validate(&value.Value{})
	assert.NoError(t, err)
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
