package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldInteger(t *testing.T) {
	var min, max int
	u, _ := NewFieldInteger(lo.ToPtr(int64(min)), lo.ToPtr(int64(max)))
	assert.Equal(t, &FieldInteger{min: lo.ToPtr(int64(0)), max: lo.ToPtr(int64(0))}, u)
}

func TestFieldInteger_Validate(t *testing.T) {
	assert.NoError(t, (&FieldInteger{}).Validate(value.Must(value.TypeInteger, 100)))
	assert.Error(t, (&FieldInteger{min: lo.ToPtr(int64(0))}).Validate(value.Must(value.TypeInteger, -1)))
	assert.Error(t, (&FieldInteger{max: lo.ToPtr(int64(0))}).Validate(value.Must(value.TypeInteger, 1)))
	assert.Same(t, ErrInvalidValue, (&FieldInteger{min: lo.ToPtr(int64(0)), max: lo.ToPtr(int64(0))}).Validate(value.Must(value.TypeBool, true)))
}
