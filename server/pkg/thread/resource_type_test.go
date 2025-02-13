package thread

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestResourceType_ResourceTypeFrom(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			TA   ResourceType
			Bool bool
		}
	}{
		{
			Name: "item",
			Expected: struct {
				TA   ResourceType
				Bool bool
			}{
				TA:   ResourceTypeItem,
				Bool: true,
			},
		},
		{
			Name: "ITEM",
			Expected: struct {
				TA   ResourceType
				Bool bool
			}{
				TA:   ResourceTypeItem,
				Bool: true,
			},
		},
		{
			Name: "asset",
			Expected: struct {
				TA   ResourceType
				Bool bool
			}{
				TA:   ResourceTypeAsset,
				Bool: true,
			},
		},
		{
			Name: "request",
			Expected: struct {
				TA   ResourceType
				Bool bool
			}{
				TA:   ResourceTypeRequest,
				Bool: true,
			},
		},
		{
			Name: "undefined",
			Expected: struct {
				TA   ResourceType
				Bool bool
			}{
				TA:   ResourceType(""),
				Bool: false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := ResourceTypeFrom(tc.Name)
			assert.Equal(t, tc.Expected.TA, res)
			assert.Equal(t, tc.Expected.Bool, ok)
		})
	}
}

func TestResourceType_ResourceTypeFromRef(t *testing.T) {
	i := ResourceTypeItem
	is := ResourceTypeAsset
	g := ResourceTypeRequest

	tests := []struct {
		Name     string
		Input    *string
		Expected *ResourceType
	}{
		{
			Name:     "item",
			Input:    lo.ToPtr("item"),
			Expected: &i,
		},
		{
			Name:     "upper case item",
			Input:    lo.ToPtr("ITEM"),
			Expected: &i,
		},
		{
			Name:     "asset",
			Input:    lo.ToPtr("asset"),
			Expected: &is,
		},
		{
			Name:     "request",
			Input:    lo.ToPtr("request"),
			Expected: &g,
		},
		{
			Name:  "undefined",
			Input: lo.ToPtr("undefined"),
		},
		{
			Name: "nil input",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := ResourceTypeFromRef(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

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