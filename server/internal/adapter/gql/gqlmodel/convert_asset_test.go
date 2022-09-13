package gqlmodel

import (
	"testing"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestConvertAsset_ToAsset(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	var pti asset.PreviewType = asset.PreviewTypeIMAGE
	uuid := uuid.New().String()
	f := &asset.File{}
	f.SetName("aaa.jpg")
	f.SetSize(1000)
	f.SetContentType("image/jpg")

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

			got := ToAsset(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestPreviewType_ToAsset(t *testing.T) {

	var pt1 asset.PreviewType = asset.PreviewTypeIMAGE
	want1 := PreviewTypeIMAGE

	var pt2 asset.PreviewType = asset.PreviewTypeGEO
	want2 := PreviewTypeGEO

	var pt3 asset.PreviewType = asset.PreviewTypeGEO3D
	want3 := PreviewTypeGEO3D

	var pt4 asset.PreviewType = asset.PreviewTypeMODEL3D
	want4 := PreviewTypeMODEL3D

	var pt5 *asset.PreviewType = nil
	want5 := (*PreviewType)(nil)

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
