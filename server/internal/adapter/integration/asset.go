package integration

import (
	"context"
	"errors"

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
var ErrAtLeastOneAssetID = rerror.NewE(i18n.T("At least one asset ID is required"))

func (s *Server) AssetFilter(ctx context.Context, req AssetFilterRequestObject) (AssetFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	wp, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetFilter404Response{}, err
		}
		return AssetFilter400Response{}, err
	}

	var sort *usecasex.Sort
	if req.Params.Sort != nil {
		sort = &usecasex.Sort{
			Key:      string(*req.Params.Sort),
			Reverted: req.Params.Dir != nil && *req.Params.Dir == integrationapi.AssetFilterParamsDirDesc,
		}
	}

	p := fromPagination(req.Params.Page, req.Params.PerPage)
	f := interfaces.AssetFilter{
		Keyword:    req.Params.Keyword,
		Sort:       sort,
		Pagination: p,
	}

	assets, pi, err := uc.Asset.Search(ctx, wp.Project.ID(), f, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetFilter404Response{}, err
		}
		return AssetFilter400Response{}, err
	}

	itemList, err := util.TryMap(assets, func(a *asset.Asset) (integrationapi.Asset, error) {
		aa := integrationapi.NewAsset(a, nil, true)
		return *aa, nil
	})
	if err != nil {
		return AssetFilter400Response{}, err
	}

	return AssetFilter200JSONResponse{
		Items:      &itemList,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) AssetCreate(ctx context.Context, req AssetCreateRequestObject) (AssetCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCreate400Response{}, err
		}
		return AssetCreate400Response{}, err
	}

	var f *file.File
	var token string

	var skipDecompression bool

	if req.MultipartBody != nil {
		var inp integrationapi.AssetCreateMultipartBody
		if err := runtime.BindMultipart(&inp, *req.MultipartBody); err != nil {
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

	if req.JSONBody != nil {
		if req.JSONBody.Url == nil && req.JSONBody.Token == nil {
			return AssetCreate400Response{}, ErrFileIsMissing
		}
		token = lo.FromPtr(req.JSONBody.Token)
		if req.JSONBody.Url != nil {
			f, err = file.FromURL(ctx, *req.JSONBody.Url)
			if err != nil {
				return AssetCreate400Response{}, err
			}
		}
		skipDecompression = lo.FromPtr(req.JSONBody.SkipDecompression)
	}

	cp := interfaces.CreateAssetParam{
		ProjectID:         wp.Project.ID(),
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

	aa := integrationapi.NewAsset(a, af, true)
	return AssetCreate200JSONResponse(*aa), nil
}

func (s *Server) AssetDelete(ctx context.Context, req AssetDeleteRequestObject) (AssetDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetDelete404Response{}, err
		}
		return AssetDelete400Response{}, err
	}

	aId, err := uc.Asset.Delete(ctx, req.AssetId, op)
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

func (s *Server) AssetBatchDelete(ctx context.Context, req AssetBatchDeleteRequestObject) (AssetBatchDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetBatchDelete404Response{}, err
		}
		return AssetBatchDelete400Response{}, err
	}

	if req.Body == nil || len(*req.Body.AssetIDs) == 0 {
		return AssetBatchDelete400Response{}, ErrAtLeastOneAssetID
	}

	ids, err := uc.Asset.BatchDelete(ctx, *req.Body.AssetIDs, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetBatchDelete404Response{}, err
		}
		return AssetBatchDelete400Response{}, err
	}

	return AssetBatchDelete200JSONResponse{
		Ids: &ids,
	}, nil
}

func (s *Server) AssetGet(ctx context.Context, req AssetGetRequestObject) (AssetGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetGet404Response{}, err
		}
		return AssetGet400Response{}, err
	}

	a, err := uc.Asset.FindByID(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetGet404Response{}, err
		}
		return AssetGet400Response{}, err
	}

	f, err := uc.Asset.FindFileByID(ctx, req.AssetId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return AssetGet400Response{}, err
	}

	aa := integrationapi.NewAsset(a, f, true)
	return AssetGet200JSONResponse(*aa), nil
}

func (s *Server) AssetUploadCreate(ctx context.Context, req AssetUploadCreateRequestObject) (AssetUploadCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetUploadCreate404Response{}, err
		}
		return AssetUploadCreate400Response{}, err
	}

	au, err := uc.Asset.CreateUpload(ctx, interfaces.CreateAssetUploadParam{
		ProjectID:       wp.Project.ID(),
		Filename:        lo.FromPtr(req.Body.Name),
		ContentLength:   int64(lo.FromPtr(req.Body.ContentLength)),
		ContentEncoding: lo.FromPtr(req.Body.ContentEncoding),
		ContentType:     lo.FromPtr(req.Body.ContentType),
		Cursor:          lo.FromPtr(req.Body.Cursor),
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

func (s *Server) AssetContentGet(ctx context.Context, req AssetContentGetRequestObject) (AssetContentGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetContentGet404Response{}, err
		}
		return AssetContentGet400Response{}, err
	}

	a, err := uc.Asset.FindByUUID(ctx, req.Uuid1+req.Uuid2, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetContentGet404Response{}, err
		}
		return AssetContentGet400Response{}, err
	}
	if a.FileName() != req.Filename {
		return AssetContentGet404Response{}, rerror.ErrNotFound
	}

	rc, _, err := uc.Asset.DownloadByID(ctx, a.ID(), nil, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetContentGet404Response{}, err
		}
		return AssetContentGet400Response{}, err
	}

	return AssetContentGet200ApplicationoctetStreamResponse{
		Body:          rc,
		ContentLength: int64(a.Size()),
	}, nil
}

func (s *Server) AssetPublish(ctx context.Context, req AssetPublishRequestObject) (AssetPublishResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetPublish404Response{}, err
		}
		return AssetPublish400Response{}, err
	}

	a, err := uc.Asset.Publish(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetPublish404Response{}, err
		}
		return AssetPublish400Response{}, err
	}

	f, err := uc.Asset.FindFileByID(ctx, req.AssetId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return AssetPublish404Response{}, err
	}

	aa := integrationapi.NewAsset(a, f, true)
	return AssetPublish200JSONResponse(*aa), nil
}

func (s *Server) AssetUnpublish(ctx context.Context, req AssetUnpublishRequestObject) (AssetUnpublishResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetUnpublish404Response{}, err
		}
		return AssetUnpublish400Response{}, err
	}

	a, err := uc.Asset.Unpublish(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetUnpublish404Response{}, err
		}
		return AssetUnpublish400Response{}, err
	}

	f, err := uc.Asset.FindFileByID(ctx, req.AssetId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return AssetUnpublish404Response{}, err
	}

	aa := integrationapi.NewAsset(a, f, true)
	return AssetUnpublish200JSONResponse(*aa), nil
}
