package view

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*View

func (l List) Projects() id.ProjectIDList {
	return util.Map(l, func(v *View) id.ProjectID {
		return v.Project()
	})
}

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *View) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) OrderByIDs(ids id.ViewIDList) List {
	var res List
	for i, vid := range ids {
		for _, view := range l {
			if view.ID() == vid {
				view.SetOrder(i)
				res = append(res, view)
				break
			}
		}
	}
	return res
}
