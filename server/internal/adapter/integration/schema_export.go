package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

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
	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(ctx, sp.Schema().Fields(), gsMap))
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

	sp, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		return MetadataSchemaByModelAsJSON404Response{}, err
	}

	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(ctx, sp.MetaSchema().Fields(), nil))
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
	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(ctx, sch.Schema().Fields(), gsMap))
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

	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(ctx, sch.MetaSchema().Fields(), nil))
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
	res := exporters.NewSchemaJSON(sch.ID().String(), nil, nil, exporters.BuildProperties(ctx, sch.Fields(), gsMap))
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
	res := exporters.NewSchemaJSON(sch.ID().String(), nil, nil, exporters.BuildProperties(ctx, sch.Fields(), gsMap))
	return SchemaByIDWithProjectAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: res.Properties,
	}, nil
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
