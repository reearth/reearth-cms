package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearthx/rerror"
)

func (c *Controller) GetSchemaJSON(ctx context.Context, wsAlias, pAlias, mKey, schemaType string) (types.JSONSchema, error) {
	wpm, err := c.loadWPMContext(ctx, "", pAlias, mKey)
	if err != nil {
		return types.JSONSchema{}, err
	}

	target := interfaces.SchemaExportTargetSchema
	if schemaType == "metadata_schema" {
		target = interfaces.SchemaExportTargetMetadata
	}
	js, err := c.usecases.Schema.Export(ctx, interfaces.ExportSchemaParam{
		ModelID: wpm.Model.ID(),
		Target:  target,
	}, nil)
	if err != nil {
		return types.JSONSchema{}, rerror.ErrNotFound
	}

	return *js, nil
}
