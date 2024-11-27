package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
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

	gsMap := exporters.BuildGroupSchemaMap(sp)
	res := exporters.NewSchemaJSON(m.ID().Ref().StringRef(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return SchemaByModelAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  toSchemaJSONProperties(res.Properties),
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

	res := exporters.NewSchemaJSON(m.ID().Ref().StringRef(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sp.MetaSchema().Fields(), nil))
	return MetadataSchemaByModelAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  toSchemaJSONProperties(res.Properties),
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

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelWithProjectAsJSON404Response{}, err
		}
		return SchemaByModelWithProjectAsJSON400Response{}, err
	}

	gsMap := exporters.BuildGroupSchemaMap(sp)
	res := exporters.NewSchemaJSON(m.ID().Ref().StringRef(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return SchemaByModelWithProjectAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  toSchemaJSONProperties(res.Properties),
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

	res := exporters.NewSchemaJSON(m.ID().Ref().StringRef(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sch.MetaSchema().Fields(), nil))
	return MetadataSchemaByModelWithProjectAsJSON200JSONResponse{
		Schema:      res.Schema,
		Id:          res.Id,
		Title:       res.Title,
		Description: res.Description,
		Type:        res.Type,
		Properties:  toSchemaJSONProperties(res.Properties),
	}, nil
}

func (s *Server) SchemaByIDAsJSON(ctx context.Context, request SchemaByIDAsJSONRequestObject) (SchemaByIDAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	m, err := uc.Model.FindBySchema(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDAsJSON404Response{}, err
		}
		return SchemaByIDAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDAsJSON404Response{}, err
		}
		return SchemaByIDAsJSON400Response{}, err
	}

	gsMap := exporters.BuildGroupSchemaMap(sp)
	res := exporters.NewSchemaJSON(sp.Schema().ID().Ref().StringRef(), nil, nil, exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return SchemaByIDAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: toSchemaJSONProperties(res.Properties),
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

	m, err := uc.Model.FindBySchema(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDWithProjectAsJSON404Response{}, err
		}
		return SchemaByIDWithProjectAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByIDWithProjectAsJSON404Response{}, err
		}
		return SchemaByIDWithProjectAsJSON400Response{}, err
	}

	gsMap := exporters.BuildGroupSchemaMap(sp)
	res := exporters.NewSchemaJSON(sp.Schema().ID().Ref().StringRef(), nil, nil, exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return SchemaByIDWithProjectAsJSON200JSONResponse{
		Schema:     res.Schema,
		Id:         res.Id,
		Type:       res.Type,
		Properties: toSchemaJSONProperties(res.Properties),
	}, nil
}

func toSchemaJSONProperties(pp map[string]exporters.SchemaJSONProperties) map[string]integrationapi.SchemaJSONProperties {
	res := map[string]integrationapi.SchemaJSONProperties{}
	for k, v := range pp {
		res[k] = integrationapi.SchemaJSONProperties{
			Type:        v.Type,
			Title:       v.Title,
			Description: v.Description,
			Format:      v.Format,
			Minimum:     v.Minimum,
			Maximum:     v.Maximum,
			MaxLength:   v.MaxLength,
			Items:       toSchemaJSONItems(v.Items),
		}
	}
	return res
}

func toSchemaJSONItems(pp *exporters.SchemaJSON) *integrationapi.SchemaJSON {
	if pp == nil {
		return nil
	}
	return &integrationapi.SchemaJSON{
		Type:       pp.Type,
		Properties: toSchemaJSONProperties(pp.Properties),
	}
}
