package request

import (
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
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

func (l List) Clone() List {
	if l == nil {
		return nil
	}
	return lo.Map(l, func(r *Request, _ int) *Request { return r.Clone() })
}

func (l List) UpdateStatus(state State) {
	for _, request := range l {
		request.SetState(state)
	}
}

// Validate returns an error unless every request can be stored and belongs to the project.
func (l List) Validate(pid ProjectID) error {
	for _, r := range l {
		if err := r.Validate(); err != nil {
			return err
		}
		if r.Project() != pid {
			return rerror.ErrInvalidParams
		}
	}
	return nil
}
