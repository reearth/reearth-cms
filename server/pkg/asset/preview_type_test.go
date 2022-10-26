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
				TA:   PreviewTypeImage,
				Bool: true,
			},
		},
		{
			Name: "IMAGE",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeImage,
				Bool: true,
			},
		},
		{
			Name: "geo",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGeo,
				Bool: true,
			},
		},
		{
			Name: "geo3d",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGeo3d,
				Bool: true,
			},
		},
		{
			Name: "model3d",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeModel3d,
				Bool: true,
			},
		},
		{
			Name: "unknown",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeUnknown,
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
	i := PreviewTypeImage
	g := PreviewTypeGeo
	g3d := PreviewTypeGeo3d
	m := PreviewTypeModel3d
	u := PreviewTypeUnknown

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
			Name:     "upper case image",
			Input:    lo.ToPtr("IMAGE"),
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
	c1 := "image/png"
	want1 := lo.ToPtr(PreviewTypeImage)
	got1 := PreviewTypeFromContentType(c1)
	assert.Equal(t, want1, got1)

	c2 := "video/mp4"
	want2 := lo.ToPtr(PreviewTypeUnknown)
	got2 := PreviewTypeFromContentType(c2)
	assert.Equal(t, want2, got2)
}

func TestPreviewType_String(t *testing.T) {
	s := "image"
	pt := PreviewTypeImage
	assert.Equal(t, s, pt.String())
}

func TestPreviewType_StringRef(t *testing.T) {
	var pt1 *PreviewType
	var pt2 *PreviewType = lo.ToPtr(PreviewTypeImage)
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
