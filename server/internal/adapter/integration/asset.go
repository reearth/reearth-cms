package integration

import (
	"context"
	"errors"
	"strings"

	"github.com/oapi-codegen/runtime"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var ErrFileIsMissing = rerror.NewE(i18n.T("File is missing"))

func (s *Server) AssetFilter(ctx context.Context, request AssetFilterRequestObject) (AssetFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	var sort *usecasex.Sort
	if request.Params.Sort != nil {
		sort = &usecasex.Sort{
			Key:      string(*request.Params.Sort),
			Reverted: request.Params.Dir != nil && *request.Params.Dir == integrationapi.AssetFilterParamsDirDesc,
		}
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	filter := interfaces.AssetFilter{
		Keyword:     request.Params.Keyword,
		Sort:        sort,
		Pagination:  p,
		ContentType: request.Params.ContentTypes,
	}

	assets, pi, err := uc.Asset.FindByProject(ctx, request.ProjectId, filter, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetFilter404Response{}, err
		}
		return AssetFilter400Response{}, err
	}

	var fileMap map[asset.ID]*asset.File
	if filter.ContentType != nil {
		fileMap, err = uc.Asset.FindFilesByIDs(ctx, assets.IDs(), op)
		if err != nil {
			return AssetFilter400Response{}, err
		}
	}

	itemList, err := util.TryFilterMap(assets, func(a *asset.Asset) (integrationapi.Asset, bool, error) {
		var file *asset.File
		if filter.ContentType != nil {

			contentTypeFilterList := convertStringToSlice(*filter.ContentType)
			file = fileMap[a.ID()]

			if file == nil || !lo.Contains(contentTypeFilterList, file.ContentType()) {
				return integrationapi.Asset{}, false, nil
			}
		}

		aurl := uc.Asset.GetURL(a)
		aa := integrationapi.NewAsset(a, file, aurl, true)
		return *aa, true, nil
	})
	if err != nil {
		return AssetFilter400Response{}, err
	}

	if len(itemList) == 0 {
		return AssetFilter404Response{}, rerror.ErrNotFound
	}

	if len(itemList) < int(pi.TotalCount) {
		pi.TotalCount = int64(len(itemList))
	}

	return AssetFilter200JSONResponse{
		Items:      &itemList,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) AssetCreate(ctx context.Context, request AssetCreateRequestObject) (AssetCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	var f *file.File
	var token string

	var skipDecompression bool

	var err error
	if request.MultipartBody != nil {
		var inp integrationapi.AssetCreateMultipartBody
		if err := runtime.BindMultipart(&inp, *request.MultipartBody); err != nil {
			return AssetCreate400Response{}, err
		}
		if inp.File == nil {
			return AssetCreate400Response{}, ErrFileIsMissing
		}
		fc, err := inp.File.Reader()
		if err != nil {
			return AssetCreate400Response{}, err
		}
		f = &file.File{
			Content:         fc,
			Name:            inp.File.Filename(),
			Size:            inp.File.FileSize(),
			ContentType:     lo.FromPtr(inp.ContentType),     // TODO: check HTTP header also
			ContentEncoding: lo.FromPtr(inp.ContentEncoding), // TODO: check HTTP header also
		}
		skipDecompression = lo.FromPtrOr(inp.SkipDecompression, false)
	}

	if request.JSONBody != nil {
		if request.JSONBody.Url == nil && request.JSONBody.Token == nil {
			return AssetCreate400Response{}, ErrFileIsMissing
		}
		token = lo.FromPtr(request.JSONBody.Token)
		if request.JSONBody.Url != nil {
			f, err = file.FromURL(ctx, *request.JSONBody.Url)
			if err != nil {
				return AssetCreate400Response{}, err
			}
		}
		skipDecompression = lo.FromPtr(request.JSONBody.SkipDecompression)
	}

	cp := interfaces.CreateAssetParam{
		ProjectID:         request.ProjectId,
		File:              f,
		SkipDecompression: skipDecompression,
		Token:             token,
	}

	a, af, err := uc.Asset.Create(ctx, cp, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCreate404Response{}, err
		}
		return AssetCreate400Response{}, err
	}

	aurl := uc.Asset.GetURL(a)
	aa := integrationapi.NewAsset(a, af, aurl, true)
	return AssetCreate200JSONResponse(*aa), nil
}

func (s *Server) AssetDelete(ctx context.Context, request AssetDeleteRequestObject) (AssetDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	aId, err := uc.Asset.Delete(ctx, request.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetDelete404Response{}, err
		}
		return AssetDelete400Response{}, err
	}

	return AssetDelete200JSONResponse{
		Id: &aId,
	}, nil
}

func (s *Server) AssetGet(ctx context.Context, request AssetGetRequestObject) (AssetGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	a, err := uc.Asset.FindByID(ctx, request.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetGet404Response{}, err
		}
		return AssetGet400Response{}, err
	}

	f, err := uc.Asset.FindFileByID(ctx, request.AssetId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return AssetGet400Response{}, err
	}

	aurl := uc.Asset.GetURL(a)
	aa := integrationapi.NewAsset(a, f, aurl, true)
	return AssetGet200JSONResponse(*aa), nil
}

func (s *Server) AssetUploadCreate(ctx context.Context, request AssetUploadCreateRequestObject) (AssetUploadCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	au, err := uc.Asset.CreateUpload(ctx, interfaces.CreateAssetUploadParam{
		ProjectID:       request.ProjectId,
		Filename:        lo.FromPtr(request.Body.Name),
		ContentLength:   int64(lo.FromPtr(request.Body.ContentLength)),
		ContentEncoding: lo.FromPtr(request.Body.ContentEncoding),
		ContentType:     lo.FromPtr(request.Body.ContentType),
		Cursor:          lo.FromPtr(request.Body.Cursor),
	}, op)

	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetUploadCreate404Response{}, err
		}
		return AssetUploadCreate400Response{}, err
	}

	return AssetUploadCreate200JSONResponse{
		Url:             &au.URL,
		Token:           &au.UUID,
		ContentType:     lo.EmptyableToPtr(au.ContentType),
		ContentLength:   lo.EmptyableToPtr(int(au.ContentLength)),
		ContentEncoding: lo.EmptyableToPtr(au.ContentEncoding),
		Next:            lo.EmptyableToPtr(au.Next),
	}, nil
}

func convertStringToSlice(input string) []string {
	splitStrings := strings.Split(input, ",")

	for i := range splitStrings {
		splitStrings[i] = strings.TrimSpace(splitStrings[i])
	}

	return splitStrings
}
