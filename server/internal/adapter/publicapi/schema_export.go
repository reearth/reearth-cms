package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (c *Controller) GetSchemaJSON(ctx context.Context, pKey, mKey string) (SchemaJSON, error) {
	pr, err := c.checkProject(ctx, pKey)
	if err != nil {
		return SchemaJSON{}, err
	}

	m, err := c.usecases.Model.FindByIDOrKey(ctx, pr.ID(), model.IDOrKey(mKey), nil)
	if err != nil || !m.Public() {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	gsMap := exporters.BuildGroupSchemaMap(sp)
	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return toSchemaJSON(res), nil
}

func toSchemaJSON(s exporters.SchemaJSON) SchemaJSON {
	return SchemaJSON{
		Schema:      s.Schema,
		Id:          s.Id,
		Title:       s.Title,
		Description: s.Description,
		Type:        s.Type,
		Properties:  s.Properties,
	}
}
