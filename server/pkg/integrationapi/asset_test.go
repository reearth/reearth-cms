package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToAssetFile(t *testing.T) {
	f3 := asset.NewFile().Name("aaa").Path("/a/aaa").Build()
	f2 := asset.NewFile().Name("a").Path("/a").Size(10).Files([]*asset.File{f3}).Build()
	f1 := asset.NewFile().Name("").Path("/").Size(11).Files([]*asset.File{f2}).Build()

	a := ToAssetFile(f1, true)
	e := &File{
		Name:        lo.ToPtr(""),
		Path:        lo.ToPtr("/"),
		Size:        lo.ToPtr(float32(11)),
		ContentType: lo.ToPtr(""),
		Children: lo.ToPtr([]File{
			{
				Name:        lo.ToPtr("a"),
				Path:        lo.ToPtr("/a"),
				Size:        lo.ToPtr(float32(10)),
				ContentType: lo.ToPtr(""),
				Children: lo.ToPtr([]File{
					{
						Name:        lo.ToPtr("aaa"),
						Path:        lo.ToPtr("/a/aaa"),
						Size:        lo.ToPtr(float32(0)),
						ContentType: lo.ToPtr(""),
					},
				}),
			},
		}),
	}
	assert.Equal(t, e, a)

	a = ToAssetFile(f1, false)
	e = &File{
		Name:        lo.ToPtr(""),
		Path:        lo.ToPtr("/"),
		Size:        lo.ToPtr(float32(11)),
		ContentType: lo.ToPtr(""),
	}
	assert.Equal(t, e, a)

	assert.Nil(t, ToAssetFile(nil, true))
}

func Test_NewAsset(t *testing.T) {
	timeNow := time.Now()
	name := "aaa"
	path := "a/aaa"
	uid := user.NewID()
	pid := project.NewID()
	a := asset.New().NewID().Project(pid).Size(100).NewUUID().
		CreatedByUser(uid).Thread(id.NewThreadID().Ref()).CreatedAt(timeNow).MustBuild()

	f1 := asset.NewFile().Name(name).Path(path).ContentType("s").Size(10).Build()
	a.SetAccessInfoResolver(func(*asset.Asset) *asset.AccessInfo {
		return &asset.AccessInfo{
			Public: false,
			Url:    "www.",
		}
	})

	tests := []struct {
		name  string
		a     *asset.Asset
		f     *asset.File
		urlFn asset.AccessInfoResolver
		all   bool
		want  *Asset
	}{
		{
			name: "success",
			a:    a,
			f:    f1,
			all:  true,
			want: &Asset{
				Name:      lo.ToPtr("aaa"),
				Id:        a.ID(),
				Url:       "www.",
				CreatedAt: timeNow,
				File: &File{
					Name:        lo.ToPtr("aaa"),
					Path:        lo.ToPtr("/a/aaa"),
					ContentType: lo.ToPtr("s"),
					Size:        lo.ToPtr(float32(10)),
				},
				ContentType: lo.ToPtr("s"),
				TotalSize:   lo.ToPtr(float32(100)),
				PreviewType: lo.ToPtr(Unknown),
				ProjectId:   pid,
				Public:      false,
			},
		},
		{
			name: "asset and file input is nil",
			a:    nil,
			f:    nil,
			all:  false,
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NewAsset(tt.a, tt.f, tt.all)

			assert.Equal(t, result, tt.want)
		})
	}
}

func TestToAssetArchiveExtractionStatus(t *testing.T) {
	tests := []struct {
		name     string
		input    *asset.ArchiveExtractionStatus
		expected *AssetArchiveExtractionStatus
	}{
		{
			name:     "Nil input",
			input:    nil,
			expected: nil,
		},
		{
			name:     "Status done",
			input:    lo.ToPtr(asset.ArchiveExtractionStatusDone),
			expected: lo.ToPtr(Done),
		},
		{
			name:     "Status failed",
			input:    lo.ToPtr(asset.ArchiveExtractionStatusFailed),
			expected: lo.ToPtr(Failed),
		},
		{
			name:     "Status in progress",
			input:    lo.ToPtr(asset.ArchiveExtractionStatusInProgress),
			expected: lo.ToPtr(InProgress),
		},
		{
			name:     "Status pending",
			input:    lo.ToPtr(asset.ArchiveExtractionStatusPending),
			expected: lo.ToPtr(Pending),
		},
		{
			name:     "Unknown status",
			input:    lo.ToPtr(asset.ArchiveExtractionStatus("unknown")),
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ToAssetArchiveExtractionStatus(tt.input)
			assert.Equal(t, result, tt.expected)
		})
	}
}

func TestToPreviewType(t *testing.T) {
	tests := []struct {
		name     string
		input    *asset.PreviewType
		expected *AssetPreviewType
	}{
		{
			name:     "Nil input",
			input:    nil,
			expected: lo.ToPtr(Unknown),
		},
		{
			name:     "PreviewTypeGeo",
			input:    lo.ToPtr(asset.PreviewTypeGeo),
			expected: lo.ToPtr(Geo),
		},
		{
			name:     "PreviewTypeGeo3dTiles",
			input:    lo.ToPtr(asset.PreviewTypeGeo3dTiles),
			expected: lo.ToPtr(Geo3dTiles),
		},
		{
			name:     "PreviewTypeGeoMvt",
			input:    lo.ToPtr(asset.PreviewTypeGeoMvt),
			expected: lo.ToPtr(GeoMvt),
		},
		{
			name:     "PreviewTypeModel3d",
			input:    lo.ToPtr(asset.PreviewTypeModel3d),
			expected: lo.ToPtr(Model3d),
		},
		{
			name:     "PreviewTypeImage",
			input:    lo.ToPtr(asset.PreviewTypeImage),
			expected: lo.ToPtr(Image),
		},
		{
			name:     "PreviewTypeImageSvg",
			input:    lo.ToPtr(asset.PreviewTypeImageSvg),
			expected: lo.ToPtr(ImageSvg),
		},
		{
			name:     "PreviewTypeCSV",
			input:    lo.ToPtr(asset.PreviewTypeCSV),
			expected: lo.ToPtr(Csv),
		},
		{
			name:     "PreviewTypeUnknown",
			input:    lo.ToPtr(asset.PreviewTypeUnknown),
			expected: lo.ToPtr(Unknown),
		},
		{
			name:     "Unrecognized PreviewType",
			input:    lo.ToPtr(asset.PreviewType("unrecognized")),
			expected: lo.ToPtr(Unknown),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ToPreviewType(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
