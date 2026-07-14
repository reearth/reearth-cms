package thread

import (
	"slices"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type List []*Thread

func (l List) Workspaces() accountdomain.WorkspaceIDList {
	return lo.Uniq(lo.FilterMap(l, func(th *Thread, _ int) (accountdomain.WorkspaceID, bool) {
		if th == nil {
			return accountdomain.WorkspaceID{}, false
		}
		return th.Workspace(), true
	}))
}

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Thread) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(th *Thread) *Thread { return th.Clone() })
}

func (l List) IDs() []ID {
	return util.Map(l, func(th *Thread) ID { return th.ID() })
}

func (l List) ToMap() map[ID]*Thread {
	return lo.SliceToMap(l, func(th *Thread) (ID, *Thread) { return th.ID(), th })
}
