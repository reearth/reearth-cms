package integration

import (
	"bytes"
	"context"
	"errors"
	"io"
	"mime/multipart"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func (s Server) AssetFilter(ctx context.Context, request AssetFilterRequestObject) (AssetFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	var sort asset.SortType
	if request.Params.Sort != nil {
		var err error
		sort, err = asset.SortTypeFromString(string(*request.Params.Sort))
		if err != nil {
			return nil, err
		}
	}

	f := interfaces.AssetFilter{
		Keyword: nil,
		Sort:    &sort,
		Pagination: &usecasex.Pagination{
			Before: nil,
			After:  nil,
			First:  lo.ToPtr(1000),
			Last:   nil,
		},
	}

	assets, pi, err := uc.Asset.FindByProject(ctx, id.ProjectID(request.ProjectId), f, op)
	if err != nil {

	}
	itemList := lo.Map(assets, func(a *asset.Asset, _ int) integrationapi.Asset {
		aa, err := ToAsset(a, uc.Asset.GetURL(a))
		if err != nil {
			return integrationapi.Asset{}
		}
		return *aa
	})

	return AssetFilter200JSONResponse{
		Items:      &itemList,
		Page:       lo.ToPtr(1),
		PerPage:    lo.ToPtr(1000),
		TotalCount: lo.ToPtr(pi.TotalCount),
	}, nil
}

func (s Server) AssetCreate(ctx context.Context, request AssetCreateRequestObject) (AssetCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	f, err := ToFile(request.Body)
	if err != nil {
		return AssetCreate400Response{}, err
	}

	cp := interfaces.CreateAssetParam{
		ProjectID: id.ProjectID(request.ProjectId),
		File:      f,
	}
	a, err := uc.Asset.Create(ctx, cp, op)
	if err != nil {
		return AssetCreate400Response{}, err
	}
	aa, err := ToAsset(a, uc.Asset.GetURL(a))
	if err != nil {
		return AssetCreate400Response{}, err
	}
	return AssetCreate200JSONResponse(*aa), nil
}

func (s Server) AssetDelete(ctx context.Context, request AssetDeleteRequestObject) (AssetDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	aId, err := uc.Asset.Delete(ctx, id.AssetID(request.AssetId), op)
	if err != nil {
		return AssetDelete400Response{}, nil
	}
	return AssetDelete200JSONResponse{
		Id: &aId,
	}, nil
}

func (s Server) AssetGet(ctx context.Context, request AssetGetRequestObject) (AssetGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	a, err := uc.Asset.FindByID(ctx, id.AssetID(request.AssetId), op)
	if err != nil {
		return AssetGet400Response{}, err
	}
	aa, err := ToAsset(a, uc.Asset.GetURL(a))
	if err != nil {
		return AssetGet400Response{}, err
	}
	return AssetGet200JSONResponse(*aa), nil
}

func ToFile(multipartReader *multipart.Reader) (*file.File, error) {
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

		var buf bytes.Buffer
		tee := io.TeeReader(p, &buf)
		defer p.Close()

		return &file.File{
			Content:     io.NopCloser(&buf),
			Path:        p.FileName(),
			Size:        getSize(tee),
			ContentType: p.Header.Get("Content-Type"),
		}, nil

	}
	return nil, errors.New("file not found")
}

func getSize(stream io.Reader) int64 {
	buf := new(bytes.Buffer)
	_, err := buf.ReadFrom(stream)
	if err != nil {
		return 0
	}
	return int64(buf.Len())
}

func ToAsset(a *asset.Asset, aUrl string) (*integrationapi.Asset, error) {
	pt, err := ToPreviewType(a.PreviewType())
	if err != nil {
		return nil, err
	}
	return &integrationapi.Asset{
		ContentType: lo.ToPtr(a.File().ContentType()),
		CreatedAt:   &types.Date{Time: a.CreatedAt()},
		File: &integrationapi.File{
			Children:    nil,
			ContentType: lo.ToPtr(a.File().ContentType()),
			Name:        lo.ToPtr(a.FileName()),
			Size:        lo.ToPtr(float32(a.Size())),
			Url:         &aUrl,
		},
		Id:          a.ID().Ref(),
		Name:        lo.ToPtr(a.FileName()),
		PreviewType: pt,
		ProjectId:   a.Project().Ref(),
		TotalSize:   lo.ToPtr(float32(a.Size())),
		UpdatedAt:   &types.Date{Time: a.CreatedAt()},
	}, nil
}

func ToPreviewType(pt *asset.PreviewType) (*integrationapi.AssetPreviewType, error) {
	if pt == nil {
		return lo.ToPtr(integrationapi.AssetPreviewType("")), nil
	}
	switch *pt {
	case asset.PreviewTypeGeo:
		return lo.ToPtr(integrationapi.Geo), nil
	case asset.PreviewTypeGeo3d:
		return lo.ToPtr(integrationapi.Geo3d), nil
	case asset.PreviewTypeModel3d:
		return lo.ToPtr(integrationapi.Model3d), nil
	case asset.PreviewTypeImage:
		return lo.ToPtr(integrationapi.Image), nil
	}
	return nil, errors.New("invalid preview type")
}
