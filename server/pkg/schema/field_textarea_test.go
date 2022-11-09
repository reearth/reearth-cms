package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldTextArea_NewFieldTextArea(t *testing.T) {
	m := lo.ToPtr(123)
	u := NewFieldTextArea(m)
	assert.Equal(t, &FieldTextArea{maxLength: lo.ToPtr(123)}, u)
}

func TestFieldTextArea_TypeProperty(t *testing.T) {
	tp := (&FieldTextArea{}).TypeProperty()
	assert.Equal(t, &TypeProperty{textArea: &FieldTextArea{}}, tp)
}

func TestFieldTextArea_MaxLength(t *testing.T) {
	i := (&FieldTextArea{maxLength: lo.ToPtr(123)}).MaxLength()
	assert.Equal(t, lo.ToPtr(123), i)
}

func TestFieldTextArea_Validate(t *testing.T) {
	err := (&FieldTextArea{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
