package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List []*Model

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Model) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Projects() id.ProjectIDList {
	return lo.Uniq(lo.FilterMap(l, func(m *Model, _ int) (id.ProjectID, bool) {
		if m == nil {
			return id.ProjectID{}, false
		}
		return m.Project(), true
	}))
}
func (l List) Clone() List {
	return util.Map(l, func(m *Model) *Model { return m.Clone() })
}

func (l List) OrderByIDs(ids id.ModelIDList) List {
	var res List
	for i, mid := range ids {
		for _, model := range l {
			if model.ID() == mid {
				model.SetOrder(i + 1)
				res = append(res, model)
				break
			}
		}
	}
	return res
}
