package asset

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPreviewType_PreviewTypeFrom(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			TA   PreviewType
			Bool bool
		}
	}{
		{
			Name: "image",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeIMAGE,
				Bool: true,
			},
		},
		{
			Name: "geo",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGEO,
				Bool: true,
			},
		},
		{
			Name: "geo3d",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGEO3D,
				Bool: true,
			},
		},
		{
			Name: "model3d",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeMODEL3D,
				Bool: true,
			},
		},
		{
			Name: "unknown",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeUNKNOWN,
				Bool: true,
			},
		},
		{
			Name: "undefined",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewType(""),
				Bool: false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := PreviewTypeFrom(tc.Name)
			assert.Equal(t, tc.Expected.TA, res)
			assert.Equal(t, tc.Expected.Bool, ok)
		})
	}
}

func TestPreviewType_PreviewTypeFromRef(t *testing.T) {
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
			res := PreviewTypeFromRef(tc.Input)
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
