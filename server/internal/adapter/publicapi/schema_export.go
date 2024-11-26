package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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

	gsMap := buildGroupSchemaMap(ctx, sp.Schema(), c.usecases)
	res := exporters.NewSchemaJSON(m.ID().String(), lo.ToPtr(m.Name()), lo.ToPtr(m.Description()), exporters.BuildProperties(ctx, sp.Schema().Fields(), gsMap))

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
