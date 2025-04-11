package gql

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.70

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

// Project is the resolver for the project field.
func (r *assetResolver) Project(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

// CreatedBy is the resolver for the createdBy field.
func (r *assetResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Asset) (gqlmodel.Operator, error) {
	switch obj.CreatedByType {
	case gqlmodel.OperatorTypeUser:
		return dataloaders(ctx).User.Load(obj.CreatedByID)
	case gqlmodel.OperatorTypeIntegration:
		return dataloaders(ctx).Integration.Load(obj.CreatedByID)
	default:
		return nil, nil
	}
}

// Items is the resolver for the items field.
func (r *assetResolver) Items(ctx context.Context, obj *gqlmodel.Asset) ([]*gqlmodel.AssetItem, error) {
	res, err := dataloaders(ctx).AssetItems.Load(obj.ID)
	return lo.Map(*res, func(i gqlmodel.AssetItem, _ int) *gqlmodel.AssetItem {
		return &i
	}), err
}

// Thread is the resolver for the thread field.
func (r *assetResolver) Thread(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Thread, error) {
	if obj.ThreadID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Thread.Load(*obj.ThreadID)
}

// CreateAsset is the resolver for the createAsset field.
func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	uc := usecases(ctx).Asset

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	params := interfaces.CreateAssetParam{
		ProjectID: pid,
		File:      gqlmodel.FromFile(input.File),
	}
	if input.URL != nil {
		params.File, err = file.FromURL(ctx, *input.URL)
		if err != nil {
			return nil, err
		}
	}
	params.Token = lo.FromPtr(input.Token)
	params.SkipDecompression = lo.FromPtr(input.SkipDecompression)

	res, _, err := uc.Create(ctx, params, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetPayload{
		Asset: gqlmodel.ToAsset(res, uc.GetURL),
	}, nil
}

// UpdateAsset is the resolver for the updateAsset field.
func (r *mutationResolver) UpdateAsset(ctx context.Context, input gqlmodel.UpdateAssetInput) (*gqlmodel.UpdateAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.ID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Asset
	res, err2 := uc.Update(ctx, interfaces.UpdateAssetParam{
		AssetID:     aid,
		PreviewType: gqlmodel.FromPreviewType(input.PreviewType),
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.UpdateAssetPayload{
		Asset: gqlmodel.ToAsset(res, uc.GetURL),
	}, nil
}

// DeleteAsset is the resolver for the deleteAsset field.
func (r *mutationResolver) DeleteAsset(ctx context.Context, input gqlmodel.DeleteAssetInput) (*gqlmodel.DeleteAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	res, err2 := usecases(ctx).Asset.Delete(ctx, aid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.DeleteAssetPayload{AssetID: gqlmodel.IDFrom(res)}, nil
}

// DeleteAssets is the resolver for the deleteAssets field.
func (r *mutationResolver) DeleteAssets(ctx context.Context, input gqlmodel.DeleteAssetsInput) (*gqlmodel.DeleteAssetsPayload, error) {
	ids, err := gqlmodel.ToIDs[id.Asset](input.AssetIds)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Asset.BatchDelete(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	// code to return deleted ids in []gqlmodel.ID
	deletedIds := make([]gqlmodel.ID, 0, len(res))
	for _, id := range res {
		deletedIds = append(deletedIds, gqlmodel.IDFrom(id))
	}

	return &gqlmodel.DeleteAssetsPayload{AssetIds: deletedIds}, nil
}

// DecompressAsset is the resolver for the decompressAsset field.
func (r *mutationResolver) DecompressAsset(ctx context.Context, input gqlmodel.DecompressAssetInput) (*gqlmodel.DecompressAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Asset
	res, err2 := uc.DecompressByID(ctx, aid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.DecompressAssetPayload{Asset: gqlmodel.ToAsset(res, uc.GetURL)}, nil
}

// CreateAssetUpload is the resolver for the createAssetUpload field.
func (r *mutationResolver) CreateAssetUpload(ctx context.Context, input gqlmodel.CreateAssetUploadInput) (*gqlmodel.CreateAssetUploadPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	au, err := usecases(ctx).Asset.CreateUpload(ctx, interfaces.CreateAssetUploadParam{
		ProjectID:       pid,
		Filename:        lo.FromPtr(input.Filename),
		ContentLength:   int64(lo.FromPtr(input.ContentLength)),
		ContentEncoding: lo.FromPtr(input.ContentEncoding),
		Cursor:          lo.FromPtr(input.Cursor),
	}, getOperator(ctx))
	if err != nil && errors.Is(err, rerror.ErrNotFound) {
		return &gqlmodel.CreateAssetUploadPayload{}, nil
	}
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetUploadPayload{
		URL:             au.URL,
		Token:           au.UUID,
		ContentType:     lo.EmptyableToPtr(au.ContentType),
		ContentLength:   int(au.ContentLength),
		ContentEncoding: lo.EmptyableToPtr(au.ContentEncoding),
		Next:            lo.EmptyableToPtr(au.Next),
	}, nil
}

// AssetFile is the resolver for the assetFile field.
func (r *queryResolver) AssetFile(ctx context.Context, assetID gqlmodel.ID) (*gqlmodel.AssetFile, error) {
	id, err := id.AssetIDFrom(string(assetID))
	if err != nil {
		return nil, err
	}
	f, err := usecases(ctx).Asset.FindFileByID(ctx, id, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return gqlmodel.ToAssetFile(f), nil
}

// Assets is the resolver for the assets field.
func (r *queryResolver) Assets(ctx context.Context, projectID gqlmodel.ID, keyword *string, sort *gqlmodel.AssetSort, pagination *gqlmodel.Pagination) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByProject(ctx, projectID, keyword, sort, pagination)
}

// AssetSchemaFields is the resolver for the assetSchemaFields field.
func (r *queryResolver) AssetSchemaFields(ctx context.Context, assetID gqlmodel.ID) (*gqlmodel.AssetSchemaFieldResult, error) {
	id, err := id.AssetIDFrom(string(assetID))
	if err != nil {
		return nil, err
	}
	fields, err := usecases(ctx).Asset.ConvertToSchemaFields(ctx, id, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return gqlmodel.AssetsToSchemaFieldData(fields), nil
}

// Asset returns AssetResolver implementation.
func (r *Resolver) Asset() AssetResolver { return &assetResolver{r} }

type assetResolver struct{ *Resolver }
