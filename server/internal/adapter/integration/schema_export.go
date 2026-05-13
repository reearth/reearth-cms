package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearthx/rerror"
)

func (s *Server) SchemaByModelAsJSON(ctx context.Context, request SchemaByModelAsJSONRequestObject) (SchemaByModelAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelAsJSON404Response{}, err
		}
		return SchemaByModelAsJSON400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, wp.Model.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaByModelAsJSON404Response{}, err
		}
		return SchemaByModelAsJSON400Response{}, err
	}

	return SchemaByModelAsJSON200JSONResponse(exporters.NewJSONSchema(wp.Model, sp, exporters.JSONSchemaExportTargetSchema)), nil
}

func (s *Server) MetadataSchemaByModelAsJSON(ctx context.Context, request MetadataSchemaByModelAsJSONRequestObject) (MetadataSchemaByModelAsJSONResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelAsJSON404Response{}, err
		}
		return MetadataSchemaByModelAsJSON400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, wp.Model.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return MetadataSchemaByModelAsJSON404Response{}, err
		}
		return MetadataSchemaByModelAsJSON400Response{}, err
	}

	return MetadataSchemaByModelAsJSON200JSONResponse(exporters.NewJSONSchema(wp.Model, sch, exporters.JSONSchemaExportTargetMetadataSchema)), nil
}
