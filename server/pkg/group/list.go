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

func (l List) Projects() id.ProjectIDList {
	return util.Map(l, func(g *Group) id.ProjectID {
		return g.Project()
	})
}

func (l List) AreGroupsInTheSameProject() bool {
	if len(l) == 0 {
		return true
	}

	firstProjectID := l[0].Project().String()
	for _, g := range l[1:] {
		if g.Project().String() != firstProjectID {
			return false
		}
	}
	return true
}

func (l List) Clone() List {
	return util.Map(l, func(g *Group) *Group { return g.Clone() })
}

func (l List) OrderByIDs(ids id.GroupIDList) List {
	var res List
	for i, gid := range ids {
		for _, group := range l {
			if group.ID() == gid {
				group.SetOrder(i)
				res = append(res, group)
				break
			}
		}
	}
	return res
}

func (l List) Ordered() List {
	res := slices.Clone(l)
	slices.SortFunc(res, func(a, b *Group) int {
		return a.Order() - b.Order()
	})
	return res
}

func (l List) SchemaIDs() id.SchemaIDList {
	var schemaIds id.SchemaIDList
	for _, group := range l {
		schemaIds = schemaIds.AddUniq(group.schema)
	}
	return schemaIds
}
