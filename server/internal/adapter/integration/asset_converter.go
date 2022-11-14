package integration

import (
	"bytes"
	"errors"
	"io"
	"mime/multipart"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/samber/lo"
)

func toFile(multipartReader *multipart.Reader) (*file.File, error) {
	for {
		p, err := multipartReader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if p.FormName() != "file" {
			if err := p.Close(); err != nil {
				return nil, err
			}
			continue
		}

		buf := new(bytes.Buffer)
		s, err := buf.ReadFrom(p)
		if err != nil {
			return nil, err
		}

		return &file.File{
			Content:     io.NopCloser(buf),
			Path:        p.FileName(),
			Size:        s,
			ContentType: p.Header.Get("Content-Type"),
		}, nil
	}
	return nil, errors.New("file not found")
}

func toAsset(a *asset.Asset, aUrl string) (*integrationapi.Asset, error) {
	return &integrationapi.Asset{
		ContentType: lo.ToPtr(a.File().ContentType()),
		CreatedAt:   &types.Date{Time: a.CreatedAt()},
		File: &integrationapi.File{
			Children:    nil,
			ContentType: lo.ToPtr(a.File().ContentType()),
			Name:        lo.ToPtr(a.FileName()),
			Size:        lo.ToPtr(float32(a.Size())),
			Path:        &aUrl,
		},
		Id:          a.ID().Ref(),
		Name:        lo.ToPtr(a.FileName()),
		PreviewType: toPreviewType(a.PreviewType()),
		ProjectId:   a.Project().Ref(),
		TotalSize:   lo.ToPtr(float32(a.Size())),
		UpdatedAt:   &types.Date{Time: a.CreatedAt()},
	}, nil
}

func toPreviewType(pt *asset.PreviewType) *integrationapi.AssetPreviewType {
	if pt == nil {
		return lo.ToPtr(integrationapi.Unknown)
	}
	switch *pt {
	case asset.PreviewTypeGeo:
		return lo.ToPtr(integrationapi.Geo)
	case asset.PreviewTypeGeo3d:
		return lo.ToPtr(integrationapi.Geo3d)
	case asset.PreviewTypeModel3d:
		return lo.ToPtr(integrationapi.Model3d)
	case asset.PreviewTypeImage:
		return lo.ToPtr(integrationapi.Image)
	case asset.PreviewTypeUnknown:
		return lo.ToPtr(integrationapi.Unknown)
	default:
		return lo.ToPtr(integrationapi.Unknown)
	}
}
