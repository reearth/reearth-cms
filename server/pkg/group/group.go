package group

import (
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

type Group struct {
	id          ID
	schema      SchemaID
	project     ProjectID
	name        string
	description string
	key         id.Key
	order       int
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

func (g *Group) Key() id.Key {
	return g.key
}

func (g *Group) Order() int {
	return g.order
}

func (g *Group) SetOrder(order int) {
	g.order = order
}

func (g *Group) Clone() *Group {
	if g == nil {
		return nil
	}
	return &Group{
		id:          g.id,
		schema:      g.schema,
		project:     g.project,
		name:        g.name,
		description: g.description,
		key:         g.key,
		order:       g.order,
	}
}

func (g *Group) SetName(name string) {
	g.name = name
}

func (g *Group) SetDescription(des string) {
	g.description = des
}

func (g *Group) SetKey(key id.Key) error {
	if !validateGroupKey(key) {
		return &rerror.Error{
			Label: id.ErrInvalidKey,
			Err:   fmt.Errorf("%s", key.String()),
		}
	}
	g.key = key
	return nil
}

func validateGroupKey(key id.Key) bool {
	return key.IsValid() && len(key.String()) > 2
}
