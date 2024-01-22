package version

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestUnwrapValues(t *testing.T) {
	assert.Equal(t, []*int{lo.ToPtr(1), lo.ToPtr(2), lo.ToPtr(3)}, UnwrapValues([]*Version[int, int]{
		{value: Value[int]{value: lo.ToPtr(1)}},
		{value: Value[int]{value: lo.ToPtr(2)}},
		{value: Value[int]{value: lo.ToPtr(3)}},
	}))
	assert.Nil(t, UnwrapValues[int, int](nil))
}
