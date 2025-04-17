package asset

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/file"
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
			Name: "image_svg",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeImageSvg,
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
			Name: "geo_3d_tiles",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGeo3dTiles,
				Bool: true,
			},
		},
		{
			Name: "geo_mvt",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeGeoMvt,
				Bool: true,
			},
		},
		{
			Name: "model_3d",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeModel3d,
				Bool: true,
			},
		},
		{
			Name: "csv",
			Expected: struct {
				TA   PreviewType
				Bool bool
			}{
				TA:   PreviewTypeCSV,
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
	is := PreviewTypeImageSvg
	g := PreviewTypeGeo
	g3d := PreviewTypeGeo3dTiles
	mvt := PreviewTypeGeoMvt
	m := PreviewTypeModel3d
	c := PreviewTypeCSV
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
			Name:     "image_svg",
			Input:    lo.ToPtr("image_svg"),
			Expected: &is,
		},
		{
			Name:     "geo",
			Input:    lo.ToPtr("geo"),
			Expected: &g,
		},
		{
			Name:     "geo_3d_tiles",
			Input:    lo.ToPtr("geo_3d_tiles"),
			Expected: &g3d,
		},
		{
			Name:     "geo_mvt",
			Input:    lo.ToPtr("geo_mvt"),
			Expected: &mvt,
		},
		{
			Name:     "model_3d",
			Input:    lo.ToPtr("model_3d"),
			Expected: &m,
		},
		{
			Name:     "csv",
			Input:    lo.ToPtr("csv"),
			Expected: &c,
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

func TestPreviewType_DetectPreviewType(t *testing.T) {
	f1 := file.File{
		Name:        "image.png",
		ContentType: "image/png",
	}
	want1 := PreviewTypeImage
	got1 := DetectPreviewType(&f1)
	assert.Equal(t, want1, *got1)

	f2 := file.File{
		Name:        "file.geojson",
		ContentType: "application/json",
	}
	want2 := PreviewTypeGeo
	got2 := DetectPreviewType(&f2)
	assert.Equal(t, want2, *got2)
}

func TestPreviewType_PreviewTypeFromContentType(t *testing.T) {
	c1 := "image/png"
	want1 := PreviewTypeImage
	got1 := PreviewTypeFromContentType(c1)
	assert.Equal(t, want1, got1)

	c2 := "video/mp4"
	want2 := PreviewTypeUnknown
	got2 := PreviewTypeFromContentType(c2)
	assert.Equal(t, want2, got2)

	c3 := "image/svg"
	want3 := PreviewTypeImageSvg
	got3 := PreviewTypeFromContentType(c3)
	assert.Equal(t, want3, got3)

	c4 := "text/csv"
	want4 := PreviewTypeCSV
	got4 := PreviewTypeFromContentType(c4)
	assert.Equal(t, want4, got4)
}

func TestPreviewType_PreviewTypeFromExtension(t *testing.T) {
	ext1 := ".png"
	want1 := PreviewTypeImage
	got1 := PreviewTypeFromExtension(ext1)
	assert.Equal(t, want1, got1)

	ext2 := ".kml"
	want2 := PreviewTypeGeo
	got2 := PreviewTypeFromExtension(ext2)
	assert.Equal(t, want2, got2)

	ext3 := ".svg"
	want3 := PreviewTypeImageSvg
	got3 := PreviewTypeFromExtension(ext3)
	assert.Equal(t, want3, got3)

	ext4 := ".csv"
	want4 := PreviewTypeCSV
	got4 := PreviewTypeFromExtension(ext4)
	assert.Equal(t, want4, got4)

	ext5 := ".glb"
	want5 := PreviewTypeModel3d
	got5 := PreviewTypeFromExtension(ext5)
	assert.Equal(t, want5, got5)

	ext6 := ".mvt"
	want6 := PreviewTypeGeoMvt
	got6 := PreviewTypeFromExtension(ext6)
	assert.Equal(t, want6, got6)

	want7 := PreviewTypeUnknown
	got7 := PreviewTypeFromExtension("")
	assert.Equal(t, want7, got7)
}

func TestPreviewType_String(t *testing.T) {
	s := "image"
	pt := PreviewTypeImage
	assert.Equal(t, s, pt.String())
}

func TestPreviewType_StringRef(t *testing.T) {
	var pt1 *PreviewType
	var pt2 = lo.ToPtr(PreviewTypeImage)
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

func TestPreviewType_Prev(t *testing.T) {
	t.Parallel()
	assert.Equal(t, func() *PreviewType { pt := PreviewType("image"); return &pt }(), PreviewTypeImage.Ref())
}
