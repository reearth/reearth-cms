package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const defaultJSONSchemaVersion = "https://json-schema.org/draft/2020-12/schema"

func NewSchemaJSON(s *schema.Schema, pp *map[string]interface{}) integrationapi.SchemaJSON {
	return integrationapi.SchemaJSON{
		Schema:     lo.ToPtr(defaultJSONSchemaVersion),
		Id:         s.ID().Ref().StringRef(),
		Type:       lo.ToPtr("object"),
		Properties: pp,
	}
}

func NewSchemaJSONWitModel(m *model.Model, pp *map[string]interface{}) integrationapi.SchemaJSON {
	return integrationapi.SchemaJSON{
		Schema:      lo.ToPtr(defaultJSONSchemaVersion),
		Id:          m.ID().Ref().StringRef(),
		Title:       lo.ToPtr(m.Name()),
		Description: lo.ToPtr(m.Description()),
		Type:        lo.ToPtr("object"),
		Properties:  pp,
	}
}

func (s *Server) SchemaByModelAsJSON(ctx context.Context, request SchemaByModelAsJSONRequestObject) (SchemaByModelAsJSONResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelAsJSON404Response{}, err
		}
		return SchemaByModelAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return SchemaByModelAsJSON404Response{}, err
	}

	gsMap := buildGroupSchemaMap(ctx, sp.Schema(), uc)
	res := NewSchemaJSONWitModel(m, buildProperties(sp.Schema().Fields(), gsMap))
	return SchemaByModelAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  res.Properties,
	}, nil
}

func (s *Server) MetadataSchemaByModelAsJSON(ctx context.Context, request MetadataSchemaByModelAsJSONRequestObject) (MetadataSchemaByModelAsJSONResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelAsJSON404Response{}, err
		}
		return MetadataSchemaByModelAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return MetadataSchemaByModelAsJSON404Response{}, err
	}

	res := NewSchemaJSONWitModel(m, buildProperties(sp.MetaSchema().Fields(), nil))
	return MetadataSchemaByModelAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  res.Properties,
	}, nil
}

func (s *Server) SchemaByModelWithProjectAsJSON(ctx context.Context, request SchemaByModelWithProjectAsJSONRequestObject) (SchemaByModelWithProjectAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON404Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON404Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON404Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	gsMap := buildGroupSchemaMap(ctx, sch.Schema(), uc)
	res := NewSchemaJSONWitModel(m, buildProperties(sch.Schema().Fields(), gsMap))
	return SchemaByModelWithProjectAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  res.Properties,
	}, nil
}

func (s *Server) MetadataSchemaByModelWithProjectAsJSON(ctx context.Context, request MetadataSchemaByModelWithProjectAsJSONRequestObject) (MetadataSchemaByModelWithProjectAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelWithProjectAsJSON404Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelWithProjectAsJSON404Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelWithProjectAsJSON404Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	res := NewSchemaJSONWitModel(m, buildProperties(sch.MetaSchema().Fields(), nil))
	return MetadataSchemaByModelWithProjectAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  res.Properties,
	}, nil
}

func (s *Server) SchemaByIDAsJSON(ctx context.Context, request SchemaByIDAsJSONRequestObject) (SchemaByIDAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDAsJSON404Response{}, err
		}
		return SchemaByIDAsJSON400Response{}, err
	}

	gsMap := buildGroupSchemaMap(ctx, sch, uc)
	res := NewSchemaJSON(sch, buildProperties(sch.Fields(), gsMap))
	return SchemaByIDAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: res.Properties,
	}, nil
}

func (s *Server) SchemaByIDWithProjectAsJSON(ctx context.Context, request SchemaByIDWithProjectAsJSONRequestObject) (SchemaByIDWithProjectAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	_, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDWithProjectAsJSON404Response{}, err
		}
		return SchemaByIDWithProjectAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDWithProjectAsJSON404Response{}, err
		}
		return SchemaByIDWithProjectAsJSON400Response{}, err
	}

	gsMap := buildGroupSchemaMap(ctx, sch, uc)
	res := NewSchemaJSON(sch, buildProperties(sch.Fields(), gsMap))
	return SchemaByIDWithProjectAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: res.Properties,
	}, nil
}

func buildProperties(fields schema.FieldList, gsMap map[id.GroupID]*schema.Schema) *map[string]interface{} {
	properties := make(map[string]interface{})
	for _, field := range fields {
		fieldType, format := determineTypeAndFormat(field.Type())
		fieldSchema := map[string]interface{}{
			"type":        fieldType,
			"title":       field.Name(),
			"description": field.Description(),
		}
		if format != "" {
			fieldSchema["format"] = format
		}
		field.TypeProperty().Match(schema.TypePropertyMatch{
			Text:     func(f *schema.FieldText) { addMaxLength(fieldSchema, f.MaxLength()) },
			TextArea: func(f *schema.FieldTextArea) { addMaxLength(fieldSchema, f.MaxLength()) },
			RichText: func(f *schema.FieldRichText) { addMaxLength(fieldSchema, f.MaxLength()) },
			Markdown: func(f *schema.FieldMarkdown) { addMaxLength(fieldSchema, f.MaxLength()) },
			Integer:  func(f *schema.FieldInteger) { addMinMax(fieldSchema, f.Min(), f.Max()) },
			Number:   func(f *schema.FieldNumber) { addMinMax(fieldSchema, f.Min(), f.Max()) },
			Group:    func(f *schema.FieldGroup) { addGroupItems(fieldSchema, gsMap[f.Group()]) },
		})
		properties[field.Key().String()] = fieldSchema
	}
	return &properties
}

func addMaxLength(schemaMap map[string]interface{}, maxLength *int) {
	if maxLength != nil {
		schemaMap["maxLength"] = *maxLength
	}
}

func addMinMax(schemaMap map[string]interface{}, min, max interface{}) {
	switch minVal := min.(type) {
	case *int64:
		if minVal != nil {
			schemaMap["minimum"] = *minVal
		}
	case *float64:
		if minVal != nil {
			schemaMap["minimum"] = *minVal
		}
	}
	switch maxVal := max.(type) {
	case *int64:
		if maxVal != nil {
			schemaMap["maximum"] = *maxVal
		}
	case *float64:
		if maxVal != nil {
			schemaMap["maximum"] = *maxVal
		}
	}
}

func addGroupItems(fieldSchema map[string]interface{}, gs *schema.Schema) {
	if gs != nil {
		fieldSchema["items"] = buildProperties(gs.Fields(), nil)
	}
}

func determineTypeAndFormat(t value.Type) (string, string) {
	switch t {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag, value.TypeReference:
		return "string", ""
	case value.TypeInteger:
		return "integer", ""
	case value.TypeNumber:
		return "number", ""
	case value.TypeBool, value.TypeCheckbox:
		return "boolean", ""
	case value.TypeDateTime:
		return "string", "date-time"
	case value.TypeURL:
		return "string", "uri"
	case value.TypeAsset:
		return "string", "binary"
	case value.TypeGroup:
		return "array", ""
	case value.TypeGeometryObject, value.TypeGeometryEditor:
		return "object", ""
	default:
		return "string", ""
	}
}

func buildGroupSchemaMap(ctx context.Context, sch *schema.Schema, uc *interfaces.Container) map[id.GroupID]*schema.Schema {
	groupSchemaMap := make(map[id.GroupID]*schema.Schema)
	for _, field := range sch.Fields() {
		field.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(fg *schema.FieldGroup) {
				groupSchema, err := uc.Schema.FindByGroup(ctx, fg.Group(), nil)
				if err == nil {
					groupSchemaMap[fg.Group()] = groupSchema
				}
			},
		})
	}
	return groupSchemaMap
}
