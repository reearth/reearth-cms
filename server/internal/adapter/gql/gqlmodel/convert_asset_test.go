package gqlmodel

import (
	"testing"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestConvertAsset_ToAsset(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	var pti asset.PreviewType = asset.PreviewTypeImage
	uuid := uuid.New().String()
	f := asset.NewFile().Name("aaa.jpg").Size(1000).ContentType("image/jpg").Build()

	a1 := asset.New().ID(id1).Project(pid1).CreatedBy(uid1).FileName("aaa.jpg").Size(1000).Type(&pti).File(f).UUID(uuid).MustBuild()

	want1 := Asset{
		ID:          ID(id1.String()),
		ProjectID:   ID(pid1.String()),
		CreatedAt:   id1.Timestamp(),
		CreatedByID: ID(uid1.String()),
		FileName:    "aaa.jpg",
		Size:        1000,
		PreviewType: ToPreviewType(&pti),
		File:        ToAssetFile(f),
		UUID:        uuid,
		URL:         "xxx",
	}

	var a2 *asset.Asset = nil
	want2 := (*Asset)(nil)

	tests := []struct {
		name string
		arg  *asset.Asset
		want *Asset
	}{
		{
			name: "to asset valid",
			arg:  a1,
			want: &want1,
		},
		{
			name: "to asset nil",
			arg:  a2,
			want: want2,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			resolver := func(_ *asset.Asset) string {
				return "xxx"
			}
			got := ToAsset(tc.arg, resolver)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestConvertAsset_FromPreviewType(t *testing.T) {
	var pt1 PreviewType = PreviewTypeImage
	want1 := asset.PreviewTypeImage

	var pt2 PreviewType = PreviewTypeGeo
	want2 := asset.PreviewTypeGeo

	var pt3 PreviewType = PreviewTypeGeo3d
	want3 := asset.PreviewTypeGeo3d

	var pt4 PreviewType = PreviewTypeModel3d
	want4 := asset.PreviewTypeModel3d

	var pt5 *PreviewType = nil
	want5 := (*asset.PreviewType)(nil)

	var pt6 PreviewType = "test"
	want6 := (*asset.PreviewType)(nil)

	var pt7 PreviewType = PreviewTypeUnknown
	want7 := asset.PreviewTypeUnknown

	tests := []struct {
		name string
		arg  *PreviewType
		want *asset.PreviewType
	}{
		{
			name: "to asset image",
			arg:  &pt1,
			want: &want1,
		},
		{
			name: "to asset geo",
			arg:  &pt2,
			want: &want2,
		},
		{
			name: "to asset geo3d",
			arg:  &pt3,
			want: &want3,
		},
		{
			name: "to asset model3d",
			arg:  &pt4,
			want: &want4,
		},
		{
			name: "to asset nil",
			arg:  pt5,
			want: want5,
		},
		{
			name: "to asset other",
			arg:  &pt6,
			want: want6,
		},
		{
			name: "to asset unknown",
			arg:  &pt7,
			want: &want7,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := FromPreviewType(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestConvertAsset_ToPreviewType(t *testing.T) {
	var pt1 asset.PreviewType = asset.PreviewTypeImage
	want1 := PreviewTypeImage

	var pt2 asset.PreviewType = asset.PreviewTypeGeo
	want2 := PreviewTypeGeo

	var pt3 asset.PreviewType = asset.PreviewTypeGeo3d
	want3 := PreviewTypeGeo3d

	var pt4 asset.PreviewType = asset.PreviewTypeModel3d
	want4 := PreviewTypeModel3d

	var pt5 *asset.PreviewType = nil
	want5 := (*PreviewType)(nil)

	var pt6 asset.PreviewType = "test"
	want6 := (*PreviewType)(nil)

	var pt7 asset.PreviewType = asset.PreviewTypeUnknown
	want7 := PreviewTypeUnknown

	tests := []struct {
		name string
		arg  *asset.PreviewType
		want *PreviewType
	}{
		{
			name: "to asset image",
			arg:  &pt1,
			want: &want1,
		},
		{
			name: "to asset geo",
			arg:  &pt2,
			want: &want2,
		},
		{
			name: "to asset geo3d",
			arg:  &pt3,
			want: &want3,
		},
		{
			name: "to asset model3d",
			arg:  &pt4,
			want: &want4,
		},
		{
			name: "to asset nil",
			arg:  pt5,
			want: want5,
		},
		{
			name: "to asset other",
			arg:  &pt6,
			want: want6,
		},
		{
			name: "to asset unknown",
			arg:  &pt7,
			want: &want7,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := ToPreviewType(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestConvertAsset_ToAssetFile(t *testing.T) {
	c := []*asset.File{}
	f1 := asset.NewFile().Name("aaa.jpg").Size(1000).ContentType("image/jpg").Path("/").Children(c).Build()

	want1 := AssetFile{
		Name:        "aaa.jpg",
		Size:        int64(1000),
		ContentType: lo.ToPtr("image/jpg"),
		Path:        "/",
		Children:    lo.Map(c, func(a *asset.File, _ int) *AssetFile { return ToAssetFile(a) }),
	}

	var f2 *asset.File = nil
	want2 := (*AssetFile)(nil)

	tests := []struct {
		name string
		arg  *asset.File
		want *AssetFile
	}{
		{
			name: "to asset file valid",
			arg:  f1,
			want: &want1,
		},
		{
			name: "to asset file nil",
			arg:  f2,
			want: want2,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := ToAssetFile(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestConvertAsset_AssetSortTypeFrom(t *testing.T) {
	st1 := AssetSortTypeName
	var want1 asset.SortType = asset.SortTypeName

	st2 := AssetSortTypeSize
	var want2 asset.SortType = asset.SortTypeSize

	st3 := AssetSortTypeDate
	var want3 asset.SortType = asset.SortTypeDate

	st4 := (*AssetSortType)(nil)
	var want4 *asset.SortType = nil

	var st5 AssetSortType = "test"
	want5 := (*asset.SortType)(nil)

	tests := []struct {
		name string
		arg  *AssetSortType
		want *asset.SortType
	}{
		{
			name: "to sort type name",
			arg:  &st1,
			want: &want1,
		},
		{
			name: "to sort type size",
			arg:  &st2,
			want: &want2,
		},
		{
			name: "to sort type date",
			arg:  &st3,
			want: &want3,
		},
		{
			name: "to sort type nil",
			arg:  st4,
			want: want4,
		},
		{
			name: "to sort type other",
			arg:  &st5,
			want: want5,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := AssetSortTypeFrom(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}
