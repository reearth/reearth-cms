package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func NewSchemaJSON(s *schema.Schema) integrationapi.SchemaJSON {
	return integrationapi.SchemaJSON{
		Schema:     lo.ToPtr("https://json-schema.org/draft/2020-12/schema"),
		Id:         s.ID().Ref().StringRef(),
		Type:       lo.ToPtr("object"),
		Properties: toSchemaJSONProperties(s.Fields()),
	}
}

func NewSchemaJSONWitModel(m *model.Model, s *schema.Schema) integrationapi.SchemaJSON {
	return integrationapi.SchemaJSON{
		Schema:      lo.ToPtr("https://json-schema.org/draft/2020-12/schema"),
		Id:          m.ID().Ref().StringRef(),
		Title:       lo.ToPtr(m.Name()),
		Description: lo.ToPtr(m.Description()),
		Type:        lo.ToPtr("object"),
		Properties:  toSchemaJSONProperties(s.Fields()),
	}
}

func (s *Server) SchemaByModelAsJSON(ctx context.Context, request SchemaByModelAsJSONRequestObject) (SchemaByModelAsJSONResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelAsJSON400Response{}, err
		}
		return SchemaByModelAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return SchemaByModelAsJSON400Response{}, err
	}

	res := NewSchemaJSONWitModel(m, sp.Schema())
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
			return MetadataSchemaByModelAsJSON400Response{}, err
		}
		return MetadataSchemaByModelAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		return MetadataSchemaByModelAsJSON400Response{}, err
	}

	res := NewSchemaJSONWitModel(m, sp.MetaSchema())
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
			return SchemaByModelWithProjectAsJSON400Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON400Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON400Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	res := NewSchemaJSONWitModel(m, sch.Schema())
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
			return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
		}
		return MetadataSchemaByModelWithProjectAsJSON400Response{}, err
	}

	res := NewSchemaJSONWitModel(m, sch.MetaSchema())
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
			return SchemaByIDAsJSON400Response{}, err
		}
		return SchemaByIDAsJSON400Response{}, err
	}

	res := NewSchemaJSON(sch)
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

	// prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	// if err != nil {
	// 	if errors.Is(err, rerror.ErrNotFound) {
	// 		return SchemaByIDWithProjectAsJSON400Response{}, err
	// 	}
	// 	return SchemaByIDWithProjectAsJSON400Response{}, err
	// }

	// ms, _, err := uc.Model.FindByProjectAndKeyword(ctx, prj.ID(), lo.FromPtrOr(request.Params.Keyword, ""), p, op)
	// if err != nil {
	// 	return nil, err
	// }

	// models := make([]integrationapi.Model, 0, len(ms))
	// for _, m := range ms {
	// 	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	// 	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
	// 		return nil, err
	// 	}
	// 	models = append(models, integrationapi.NewModel(m, sp, lastModified))
	// }

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDWithProjectAsJSON400Response{}, err
		}
		return SchemaByIDWithProjectAsJSON400Response{}, err
	}

	res := NewSchemaJSON(sch)
	return SchemaByIDWithProjectAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: res.Properties,
	}, nil
}

func toSchemaJSONProperties(f schema.FieldList) *map[string]interface{} {
	properties := make(map[string]interface{})
	for _, field := range f {
		fieldType, format := toSchemaJSONTypeAndFormat(field.Type())
		fieldSchema := map[string]interface{}{
			"type":        fieldType,
			"title":       field.Name(),
			"description": field.Description(),
		}
		if format != "" {
			fieldSchema["format"] = format
		}
		properties[field.Key().String()] = fieldSchema
	}
	return &properties
}

func toSchemaJSONTypeAndFormat(t value.Type) (string, string) {
	switch t {
	case "text", "textArea", "richText", "markdown", "select", "tag", "asset", "reference":
		return "string", ""
	case "integer":
		return "integer", ""
	case "number":
		return "number", ""
	case "bool", "checkbox":
		return "boolean", ""
	case "date":
		return "string", "date"
	case "url":
		return "string", "uri"
	case "group":
		return "array", ""
	case "geometryObject", "geometryEditor":
		return "object", ""
	default:
		return "string", ""
	}
}
