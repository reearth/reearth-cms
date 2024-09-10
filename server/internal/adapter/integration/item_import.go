package integration

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"reflect"

	"github.com/oapi-codegen/runtime"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	key2 "github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var ErrDataMismatch = rerror.NewE(i18n.T("data type mismatch"))

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

		cp, err = fromJsonBody(*request.JSONBody, frc, *sp)
		if err != nil {
			return nil, err
		}
	}

	if request.MultipartBody != nil {
		cp, err = fromMultiPartBody(request.MultipartBody, *sp)
		if err != nil {
			return nil, err
		}
	}

	cp.ModelID = m.ID()

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

func fromJsonBody(inp integrationapi.ModelImportJSONRequestBody, frc io.ReadCloser, sp schema.Package) (interfaces.ImportItemsParam, error) {
	defer func() { _ = frc.Close() }()
	items, fields, err := itemsFromJson(frc, inp.Format == integrationapi.ModelImportJSONBodyFormatGeoJson, sp)
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}

	s, err := fromStrategyType(string(inp.Strategy))
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}
	return interfaces.ImportItemsParam{
		SP:           sp,
		Strategy:     s,
		MutateSchema: lo.FromPtrOr(inp.MutateSchema, false),
		Items:        items,
		Fields:       fields,
	}, nil
}

func fromMultiPartBody(inp *multipart.Reader, sp schema.Package) (interfaces.ImportItemsParam, error) {
	var body integrationapi.ModelImportMultipartRequestBody
	if err := runtime.BindMultipart(&body, *inp); err != nil {
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
	defer func() { _ = fc.Close() }()

	items, fields, err := itemsFromJson(fc, body.Format == integrationapi.ModelImportMultipartBodyFormatGeoJson, sp)
	if err != nil {
		return interfaces.ImportItemsParam{}, err
	}

	return interfaces.ImportItemsParam{
		SP:           sp,
		Strategy:     s,
		MutateSchema: lo.FromPtrOr(body.MutateSchema, false),
		Items:        items,
		Fields:       fields,
	}, nil
}

func itemsFromJson(r io.Reader, isGeoJson bool, sp schema.Package) ([]interfaces.ImportItemParam, []interfaces.CreateFieldParam, error) {
	var jsonObjects []map[string]any
	if isGeoJson {
		var geoJson map[string]any
		err := json.NewDecoder(r).Decode(&geoJson)
		if err != nil {
			return nil, nil, err
		}
		features, ok := geoJson["features"].([]map[string]any)
		if !ok {
			return nil, nil, rerror.ErrInvalidParams
		}
		jsonObjects = features
	} else {
		err := json.NewDecoder(r).Decode(&jsonObjects)
		if err != nil {
			return nil, nil, err
		}
	}

	items := make([]interfaces.ImportItemParam, 0)
	fields := make([]interfaces.CreateFieldParam, 0)
	for _, o := range jsonObjects {
		idStr := o["id"].(string)
		iId, err := id.ItemIDFrom(idStr)
		if err != nil {
			return nil, nil, err
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
				return nil, nil, rerror.ErrInvalidParams
			}
			newField := FieldFrom(key.String(), v, sp)
			f := sp.FieldByIDOrKey(nil, &key)
			if f != nil && f.Type() != newField.Type {
				continue
			}

			if f == nil {
				prevField, ok := lo.Find(fields, func(fp interfaces.CreateFieldParam) bool {
					return fp.Key == key.String()
				})
				if ok && prevField.Type != newField.Type {
					return nil, nil, ErrDataMismatch
				}
				if ok {
					continue
				}
				fields = append(fields, newField)
			}

			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: nil,
				Key:   key.Ref(),
				Value: v,
				// Group is not supported
				Group: nil,
			})
		}
		items = append(items, item)
	}
	return items, nil, nil
}

func FieldFrom(k string, v any, sp schema.Package) interfaces.CreateFieldParam {
	t := value.TypeText
	switch reflect.TypeOf(v).String() {
	case "Bool":
		t = value.TypeBool
		break
	case "Int":
	case "Int8":
	case "Int16":
	case "Int32":
	case "Int64":
	case "Uint":
	case "Uint8":
	case "Uint16":
	case "Uint32":
	case "Uint64":
	case "Float32":
	case "Float64":
		t = value.TypeNumber
		break
	case "String":
		t = value.TypeText
		break
	default:

	}
	return interfaces.CreateFieldParam{
		ModelID:      nil,
		SchemaID:     sp.Schema().ID(),
		Type:         t,
		Name:         k,
		Description:  lo.ToPtr("auto created by json/geoJson import"),
		Key:          k,
		TypeProperty: nil, // TODO: infer type
	}
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
