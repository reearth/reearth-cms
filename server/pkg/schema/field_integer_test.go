package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldInteger_NewFieldInteger(t *testing.T) {
	min := 1
	max := 100
	u, _ := NewFieldInteger(lo.ToPtr(int64(min)), lo.ToPtr(int64(max)))
	assert.Equal(t, &FieldInteger{}, u)
}
