package group

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*Group

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Group) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(g *Group) *Group { return g.Clone() })
}

func (l List) SchemaIDs() id.SchemaIDList {
	return util.Map(l, func(g *Group) id.SchemaID { return g.Schema() })
}
