package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldAsset_NewFieldAsset(t *testing.T) {
	a := NewFieldAsset()
	assert.Equal(t, &FieldAsset{}, a)
}

func TestFieldAsset_TypeProperty(t *testing.T) {
	tp := (&FieldAsset{}).TypeProperty()
	assert.Equal(t, &TypeProperty{asset: &FieldAsset{}}, tp)
}

func TestFieldAsset_Validate(t *testing.T) {
	err := (&FieldAsset{}).Validate(&value.Value{})
	assert.NoError(t, err)
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
