package thread

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List []*Thread

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
