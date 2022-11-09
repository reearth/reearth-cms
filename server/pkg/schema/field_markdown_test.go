package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldMarkdown_NewFieldMarkdown(t *testing.T) {
	m := lo.ToPtr(123)
	u := NewFieldMarkdown(m)
	assert.Equal(t, &FieldMarkdown{}, u)
}

func TestFieldMarkdown_TypeProperty(t *testing.T) {
	tp := (&FieldMarkdown{}).TypeProperty()
	assert.Equal(t, &TypeProperty{markdown: &FieldMarkdown{}}, tp)
}

func TestFieldMarkdown_MaxLength(t *testing.T) {
	i := (&FieldMarkdown{}).MaxLength()
	assert.Equal(t, lo.ToPtr(123), i)
}

func TestFieldMarkdown_Validate(t *testing.T) {
	err := (&FieldMarkdown{}).Validate(&value.Value{})
	assert.NoError(t, err)
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
