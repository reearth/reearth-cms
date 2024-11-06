package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

func (c *Controller) getSchema(ctx context.Context, prj, mkey string) (SchemaJSON, error) {
	_, err := c.checkProject(ctx, prj)
	if err != nil {
		return SchemaJSON{}, err
	}

	if mkey == "" {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	mid, err := id.ModelIDFrom(mkey)
	if err != nil {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	m, err := c.usecases.Model.FindByID(ctx, mid, nil)
	if err != nil {
		return SchemaJSON{}, err
	}

	if m.Key().String() != mkey || !m.Public() {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return SchemaJSON{}, err
	}

	return NewSchemaJSON(sp.Schema()), nil
}
