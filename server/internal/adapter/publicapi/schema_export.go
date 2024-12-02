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
	res := exporters.NewSchemaJSON(m.ID().Ref().StringRef(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(sp.Schema().Fields(), gsMap))
	return toSchemaJSON(res), nil
}

func toSchemaJSON(s exporters.SchemaJSON) SchemaJSON {
	return SchemaJSON{
		Schema:      s.Schema,
		Id:          s.Id,
		Title:       s.Title,
		Description: s.Description,
		Type:        s.Type,
		Properties:  toSchemaJSONProperties(s.Properties),
	}
}

func toSchemaJSONProperties(pp map[string]exporters.SchemaJSONProperties) map[string]SchemaJSONProperties {
	res := map[string]SchemaJSONProperties{}
	for k, v := range pp {
		res[k] = SchemaJSONProperties{
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

func toSchemaJSONItems(pp *exporters.SchemaJSON) *SchemaJSON {
	if pp == nil {
		return nil
	}
	return &SchemaJSON{
		Type:       pp.Type,
		Properties: toSchemaJSONProperties(pp.Properties),
	}
}
