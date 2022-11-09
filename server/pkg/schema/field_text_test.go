package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldTextFrom(t *testing.T) {
	assert.Equal(t, &FieldText{}, NewFieldText(nil))
	assert.Equal(t, &FieldText{maxLength: lo.ToPtr(256)}, NewFieldText(lo.ToPtr(256)))
}

func TestFieldText_TypeProperty(t *testing.T) {
	f := &FieldText{maxLength: lo.ToPtr(256)}
	assert.Equal(t, &TypeProperty{text: f}, f.TypeProperty())
}

func TestFieldText_MaxLength(t *testing.T) {
	assert.Equal(t, lo.ToPtr(256), (&FieldText{maxLength: lo.ToPtr(256)}).MaxLength())
}
