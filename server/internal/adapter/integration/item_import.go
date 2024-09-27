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

func fromJsonBody(inp integrationapi.ModelImportJSONRequestBody, frc io.ReadCloser, sp schema.Package) (interfaces.ImportItemsParam, error) {
	defer func() { _ = frc.Close() }()
	isGeoJson := inp.Format == integrationapi.ModelImportJSONBodyFormatGeoJson
	items, fields, err := itemsFromJson(frc, isGeoJson, inp.GeometryFieldKey, sp)
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

	isGeoJson := body.Format == integrationapi.ModelImportMultipartBodyFormatGeoJson
	items, fields, err := itemsFromJson(fc, isGeoJson, body.GeometryFieldKey, sp)
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

func itemsFromJson(r io.Reader, isGeoJson bool, geoField *string, sp schema.Package) ([]interfaces.ImportItemParam, []interfaces.CreateFieldParam, error) {
	var jsonObjects []map[string]any
	if isGeoJson {
		var geoJson integrationapi.GeoJSON
		err := json.NewDecoder(r).Decode(&geoJson)
		if err != nil {
			return nil, nil, err
		}
		if geoJson.Features == nil {
			return nil, nil, rerror.ErrInvalidParams
		}
		for _, feature := range *geoJson.Features {
			var f map[string]any
			_ = json.Unmarshal(lo.Must(json.Marshal(feature)), &f)
			jsonObjects = append(jsonObjects, f)
		}
	} else {
		err := json.NewDecoder(r).Decode(&jsonObjects)
		if err != nil {
			return nil, nil, err
		}
	}

	items := make([]interfaces.ImportItemParam, 0)
	fields := make([]interfaces.CreateFieldParam, 0)
	for _, o := range jsonObjects {
		var iId *id.ItemID
		idStr, _ := o["Id"].(*string)
		iId = id.ItemIDFromRef(idStr)
		item := interfaces.ImportItemParam{
			ItemId:     iId,
			MetadataID: nil,
			Fields:     nil,
		}
		if isGeoJson {
			if geoField == nil {
				return nil, nil, rerror.ErrInvalidParams
			}

			geoFieldKey := key2.New(*geoField)
			if !geoFieldKey.IsValid() {
				return nil, nil, rerror.ErrInvalidParams
			}
			geoFieldId := id.FieldIDFromRef(geoField)
			f := sp.FieldByIDOrKey(geoFieldId, &geoFieldKey)
			if f == nil { // TODO: check GeoField type
				return nil, nil, rerror.ErrInvalidParams
			}

			v, err := json.Marshal(o["geometry"])
			if err != nil {
				return nil, nil, err
			}
			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: f.ID().Ref(),
				Key:   f.Key().Ref(),
				Value: string(v),
				// Group is not supported
				Group: nil,
			})

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
			if f != nil && !isAssignable(newField.Type, f.Type()) {
				continue
			}

			if f == nil {
				prevField, found := lo.Find(fields, func(fp interfaces.CreateFieldParam) bool {
					return fp.Key == key.String()
				})
				if found && prevField.Type != newField.Type {
					return nil, nil, ErrDataMismatch
				}
				if !found {
					fields = append(fields, newField)
				}
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
	return items, fields, nil
}

// isAssignable returns true if vt1 is assignable to vt2
func isAssignable(vt1, vt2 value.Type) bool {
	if vt1 == vt2 {
		return true
	}
	if vt1 == value.TypeInteger &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeBool &&
		(vt2 == value.TypeCheckbox || vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeText &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	return false
}

func FieldFrom(k string, v any, sp schema.Package) interfaces.CreateFieldParam {
	t := value.TypeText
	switch reflect.TypeOf(v).Kind() {
	case reflect.Bool:
		t = value.TypeBool
	case reflect.Int:
	case reflect.Int8:
	case reflect.Int16:
	case reflect.Int32:
	case reflect.Int64:
	case reflect.Uint:
	case reflect.Uint8:
	case reflect.Uint16:
	case reflect.Uint32:
	case reflect.Uint64:
	case reflect.Float32:
	case reflect.Float64:
		t = value.TypeInteger
	case reflect.String:
		t = value.TypeText
	default:

	}
	return interfaces.CreateFieldParam{
		ModelID:     nil,
		SchemaID:    sp.Schema().ID(),
		Type:        t,
		Name:        k,
		Description: lo.ToPtr("auto created by json/geoJson import"),
		Key:         k,
		// type property is not supported in import
		TypeProperty: nil,
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
