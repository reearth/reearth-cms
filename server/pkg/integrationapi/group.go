package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func NewGroup(g *group.Group, s *schema.Schema) Group {
	return Group{
		Id:          g.ID(),
		Key:         g.Key().String(),
		Name:        g.Name(),
		Description: g.Description(),
		ProjectId:   g.Project(),
		SchemaId:    g.Schema(),
		Schema:      NewSchema(s),
	}
}
