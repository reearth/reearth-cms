package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldInteger_NewFieldInteger(t *testing.T) {
	min := int64(1)
	max := lo.ToPtr(123)
	u, _ := NewFieldInteger(min, max)
	assert.Equal(t, &FieldInteger{}, u)
}
