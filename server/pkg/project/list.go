package project

import (
	"slices"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

type List []*Project

func (l List) IDs() IDList {
	return util.Map(l, func(p *Project) ID { return p.ID() })
}

func (l List) Workspaces() accountdomain.WorkspaceIDList {
	return util.Map(l, func(p *Project) accountdomain.WorkspaceID { return p.Workspace() })
}

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Project) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(p *Project) *Project { return p.Clone() })
}
