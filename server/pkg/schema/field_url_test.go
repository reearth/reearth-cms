package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldURL_NewFieldURL(t *testing.T) {
	u := NewFieldURL()
	assert.Equal(t, &FieldURL{}, u)
}

func TestFieldURL_TypeProperty(t *testing.T) {
	tp := (&FieldURL{}).TypeProperty()
	assert.Equal(t, &TypeProperty{url: &FieldURL{}}, tp)
}

func TestFieldURL_Validate(t *testing.T) {
	err := (&FieldURL{}).Validate(&value.Value{})
	assert.NoError(t, err)
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
