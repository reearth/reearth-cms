package integration

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"

	"github.com/oapi-codegen/runtime"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	key2 "github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) ModelImport(ctx context.Context, request ModelImportRequestObject) (ModelImportResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelImport400Response{}, err
		}
		return nil, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	var cp interfaces.ImportItemsParam

	if request.JSONBody != nil {
		frc, err := uc.Asset.DownloadByID(ctx, request.JSONBody.AssetId, op)
		if err != nil {
			return nil, err
		}

		cp, err = fromJsonBody(*request.JSONBody, frc)
		if err != nil {
			return nil, err
		}
	}

	if request.MultipartBody != nil {
		cp, err = fromMultiPartBody(request.MultipartBody)
		if err != nil {
			return nil, err
		}
	}

	cp.ModelID = m.ID()
	cp.SP = *sp

	res, err := uc.Item.Import(ctx, cp, op)
	if err != nil {
		return nil, err
	}

	return ModelImport200JSONResponse{
		ModelId:       m.ID().Ref(),
		IgnoredCount:  &res.Ignored,
		InsertedCount: &res.Inserted,
		UpdatedCount:  &res.Updated,
		ItemsCount:    &res.Total,
		NewFields:     nil,
	}, nil
}

func fromJsonBody(inp integrationapi.ModelImportJSONRequestBody, frc io.ReadCloser) (interfaces.ImportItemsParam, error) {
	defer frc.Close()
	items, err := itemsFromJson(frc, inp.Format == integrationapi.ModelImportJSONBodyFormatGeoJson)
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}

	s, err := fromStrategyType(string(inp.Strategy))
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}
	return interfaces.ImportItemsParam{
		Strategy:     s,
		MutateSchema: lo.FromPtrOr(inp.MutateSchema, false),
		Items:        items,
	}, nil
}

func fromMultiPartBody(inp *multipart.Reader) (interfaces.ImportItemsParam, error) {
	var body integrationapi.ModelImportMultipartRequestBody
	if err := runtime.BindMultipart(&inp, *inp); err != nil {
		return interfaces.ImportItemsParam{}, err
	}
	s, err := fromStrategyType(string(body.Strategy))
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}
	if body.File == nil {
		return interfaces.ImportItemsParam{}, ErrFileIsMissing
	}
	fc, err := body.File.Reader()
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}
	defer fc.Close()

	items, err := itemsFromJson(fc, body.Format == integrationapi.ModelImportMultipartBodyFormatGeoJson)
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}

	return interfaces.ImportItemsParam{
		Strategy:     s,
		MutateSchema: lo.FromPtrOr(body.MutateSchema, false),
		Items:        items,
	}, nil
}

func itemsFromJson(r io.Reader, isGeoJson bool) ([]interfaces.ImportItemParam, error) {
	var obj []map[string]any
	err := json.NewDecoder(r).Decode(&obj)
	if err != nil {
		return nil, err
	}

	items := make([]interfaces.ImportItemParam, 0)
	for _, o := range obj {
		idStr := o["id"].(string)
		iId, err := id.ItemIDFrom(idStr)
		if err != nil {
			// TODO: check what is expected here
			//  A: return err
		}
		item := interfaces.ImportItemParam{
			ItemId:     iId.Ref(),
			MetadataID: nil,
			Fields:     nil,
		}
		if isGeoJson {
			// TODO: handle geo fields

			props, ok := o["properties"].(map[string]any)
			if !ok {
				continue
			}
			o = props
		}
		for k, v := range o {
			key := key2.New(k)
			if !key.IsValid() {
				// TODO: check if this is correct
				//  A: return err
				continue
			}
			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: nil,
				Key:   key.Ref(),
				// Type:  "",
				Value: v,
				// Group is not supported
				Group: nil,
			})
		}
		items = append(items, item)
	}
	return items, nil
}

func fromStrategyType(inp string) (interfaces.ImportStrategyType, error) {
	switch inp {
	case "insert":
		return interfaces.ImportStrategyTypeInsert, nil
	case "update":
		return interfaces.ImportStrategyTypeUpdate, nil
	case "upsert":
		return interfaces.ImportStrategyTypeUpsert, nil
	}
	return "", rerror.ErrInvalidParams
}
