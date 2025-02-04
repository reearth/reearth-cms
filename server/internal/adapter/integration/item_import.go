package integration

import (
	"context"

	"github.com/oapi-codegen/runtime"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

func (s *Server) ModelImport(ctx context.Context, request ModelImportRequestObject) (ModelImportResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	// run as background
	if request.JSONBody != nil && lo.FromPtrOr(request.JSONBody.AsBackground, false) {
		err := uc.Item.TriggerImportJob(ctx,
			request.JSONBody.AssetId,
			request.ModelId,
			string(request.JSONBody.Format),
			string(request.JSONBody.Strategy),
			lo.FromPtr(request.JSONBody.GeometryFieldKey),
			lo.FromPtrOr(request.JSONBody.MutateSchema, false),
			op,
		)
		if err != nil {
			return nil, err
		}
		return nil, nil
	}

	sp, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		return nil, err
	}

	var cp interfaces.ImportItemsParam
	if request.JSONBody != nil {
		frc, _, err := uc.Asset.DownloadByID(ctx, request.JSONBody.AssetId, nil, op)
		if err != nil {
			return nil, err
		}

		cp = fromJsonBody(*request.JSONBody)
		cp.Reader = frc
	}

	if request.MultipartBody != nil {
		var body integrationapi.ModelImportMultipartRequestBody
		if err := runtime.BindMultipart(&body, *request.MultipartBody); err != nil {
			return nil, err
		}
		if body.File == nil {
			return nil, ErrFileIsMissing
		}
		fc, err := body.File.Reader()
		if err != nil {
			return nil, err
		}
		defer func() { _ = fc.Close() }()

		cp, err = fromMultiPartBody(body)
		if err != nil {
			return nil, err
		}
		cp.Reader = fc
	}

	cp.ModelID = request.ModelId
	cp.SP = *sp

	res, err := uc.Item.Import(ctx, cp, op)
	if err != nil {
		return nil, err
	}

	return ModelImport200JSONResponse{
		ModelId:       request.ModelId.Ref(),
		IgnoredCount:  &res.Ignored,
		InsertedCount: &res.Inserted,
		UpdatedCount:  &res.Updated,
		ItemsCount:    &res.Total,
		NewFields: lo.ToPtr(lo.Map(res.NewFields, func(f *schema.Field, _ int) integrationapi.SchemaField {
			return integrationapi.SchemaField{
				Id:       f.ID().Ref(),
				Key:      lo.ToPtr(f.Key().String()),
				Multiple: lo.ToPtr(f.Multiple()),
				Required: lo.ToPtr(f.Required()),
				Type:     lo.ToPtr(integrationapi.ValueType(f.Type())),
			}
		})),
	}, nil
}

func fromJsonBody(inp integrationapi.ModelImportJSONRequestBody) interfaces.ImportItemsParam {
	return interfaces.ImportItemsParam{
		Strategy:     interfaces.ImportStrategyTypeFromString(string(inp.Strategy)),
		Format:       interfaces.ImportFormatTypeFromString(string(inp.Format)),
		MutateSchema: lo.FromPtrOr(inp.MutateSchema, false),
		GeoField:     inp.GeometryFieldKey,
	}
}

func fromMultiPartBody(body integrationapi.ModelImportMultipartRequestBody) (interfaces.ImportItemsParam, error) {
	return interfaces.ImportItemsParam{
		Strategy:     interfaces.ImportStrategyTypeFromString(string(body.Strategy)),
		Format:       interfaces.ImportFormatTypeFromString(string(body.Format)),
		MutateSchema: lo.FromPtrOr(body.MutateSchema, false),
		GeoField:     body.GeometryFieldKey,
	}, nil
}
