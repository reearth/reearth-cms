package asset

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPreviewType_PreviewTypeFrom(t *testing.T) {
	i := PreviewTypeIMAGE
	g := PreviewTypeGEO
	g3d := PreviewTypeGEO3D
	m := PreviewTypeMODEL3D
	u := PreviewTypeUNKNOWN

	tests := []struct {
		Name     string
		Input    *string
		Expected *PreviewType
	}{
		{
			Name:     "image",
			Input:    lo.ToPtr("image"),
			Expected: &i,
		},
		{
			Name:     "geo",
			Input:    lo.ToPtr("geo"),
			Expected: &g,
		},
		{
			Name:     "geo3d",
			Input:    lo.ToPtr("geo3d"),
			Expected: &g3d,
		},
		{
			Name:     "model3d",
			Input:    lo.ToPtr("model3d"),
			Expected: &m,
		},
		{
			Name:     "unknown",
			Input:    lo.ToPtr("unknown"),
			Expected: &u,
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
			res := PreviewTypeFrom(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPreviewType_PreviewTypeFromContentType(t *testing.T) {
	var pt1 *PreviewType
	var pt2 *PreviewType = lo.ToPtr(PreviewTypeIMAGE)
	s := string(*pt2)

	tests := []struct {
		Name     string
		Input    *string
		Expected *string
	}{
		{
			Name:     "content type image",
			Input:    pt1.StringRef(),
			Expected: nil,
		},
		{
			Name:     "PreviewType pointer",
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

func TestPreviewType_String(t *testing.T) {
	s := "image"
	pt := PreviewTypeIMAGE
	assert.Equal(t, s, pt.String())
}

func TestPreviewType_StringRef(t *testing.T) {
	var pt1 *PreviewType
	var pt2 *PreviewType = lo.ToPtr(PreviewTypeIMAGE)
	s := string(*pt2)

	tests := []struct {
		Name     string
		Input    *string
		Expected *string
	}{
		{
			Name:     "nil PreviewType pointer",
			Input:    pt1.StringRef(),
			Expected: nil,
		},
		{
			Name:     "PreviewType pointer",
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
