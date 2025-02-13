package thread

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestResourceType_String(t *testing.T) {
	s := "item"
	pt := ResourceTypeItem
	assert.Equal(t, s, pt.String())
}

func TestResourceType_StringRef(t *testing.T) {
	var pt1 *ResourceType
	var pt2 *ResourceType = lo.ToPtr(ResourceTypeItem)
	s := string(*pt2)

	tests := []struct {
		Name     string
		Input    *string
		Expected *string
	}{
		{
			Name:     "nil ResourceType pointer",
			Input:    pt1.StringRef(),
			Expected: nil,
		},
		{
			Name:     "ResourceType pointer",
			Input:    pt2.StringRef(),
			Expected: &s,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Input)
		})
	}
}