package request

import (
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
)

type List []*Request

func (l List) Workspaces() accountdomain.WorkspaceIDList {
	return lo.Uniq(lo.FilterMap(l, func(r *Request, _ int) (accountdomain.WorkspaceID, bool) {
		if r == nil {
			return accountdomain.WorkspaceID{}, false
		}
		return r.Workspace(), true
	}))
}

func (l List) UpdateStatus(state State) {
	for _, request := range l {
		request.SetState(state)
	}
}
