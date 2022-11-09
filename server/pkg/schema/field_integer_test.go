package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldInteger_NewFieldInteger(t *testing.T) {
	var min, max int
	u, _ := NewFieldInteger(lo.ToPtr(int64(min)), lo.ToPtr(int64(max)))
	assert.Equal(t, &FieldInteger{min: lo.ToPtr(int64(0)), max: lo.ToPtr(int64(0))}, u)
}
