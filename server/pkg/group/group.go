package group

import "github.com/reearth/reearth-cms/server/pkg/key"

type Group struct {
	id          ID
	schema      SchemaID
	project     ProjectID
	name        string
	description string
	key         key.Key
}

func (g *Group) ID() ID {
	return g.id
}

func (g *Group) Name() string {
	return g.name
}

func (g *Group) Schema() SchemaID {
	return g.schema
}

func (g *Group) Project() ProjectID {
	return g.project
}

func (g *Group) Description() string {
	return g.description
}

func (g *Group) Key() key.Key {
	return g.key
}

func (g *Group) Clone() *Group {
	return &Group{
		id:          g.id,
		schema:      g.schema,
		project:     g.project,
		name:        g.name,
		description: g.description,
		key:         g.key,
	}
}
