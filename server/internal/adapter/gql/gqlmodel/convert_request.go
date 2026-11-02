package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func ToRequest(req *request.Request) *Request {
	if req == nil {
		return nil
	}
	items := lo.Map(req.Items(), func(itm *request.Item, _ int) *RequestItem {
		iid := IDFrom(itm.Item())
		return version.MatchVersionOrRef(
			itm.Pointer(),
			func(v version.Version) *RequestItem {
				return &RequestItem{
					ItemID:  iid,
					Version: new(v.String()),
				}
			},
			func(r version.Ref) *RequestItem {
				return &RequestItem{
					ItemID: iid,
					Ref:    new(r.String()),
				}
			},
		)
	})

	return &Request{
		ID:          IDFrom(req.ID()),
		Items:       items,
		Title:       req.Title(),
		Description: new(req.Description()),
		CreatedByID: IDFrom(req.CreatedBy()),
		WorkspaceID: IDFrom(req.Workspace()),
		ProjectID:   IDFrom(req.Project()),
		ThreadID:    IDFromRef(req.Thread()),
		ReviewersID: lo.Map(req.Reviewers(), func(t accountdomain.UserID, _ int) ID { return IDFrom(t) }),
		State:       ToRequestState(req.State()),
		CreatedAt:   req.CreatedAt(),
		UpdatedAt:   req.UpdatedAt(),
		ApprovedAt:  req.ApprovedAt(),
		ClosedAt:    req.ClosedAt(),
	}
}
func ToRequestState(s request.State) RequestState {
	switch s {
	case request.StateApproved:
		return RequestStateApproved
	case request.StateClosed:
		return RequestStateClosed
	case request.StateDraft:
		return RequestStateDraft
	case request.StateWaiting:
		return RequestStateWaiting
	default:
		return ""
	}
}

// requestSortKeys maps the sort keys clients send to request document fields;
// other keys are passed as they are
var requestSortKeys = map[string]string{
	"createdAt": "id", // IDs follow the creation time
	"updatedAt": "updatedat",
}

func ToRequestSort(s *Sort) *usecasex.Sort {
	res := s.Into()
	if res == nil {
		return nil
	}
	if k, ok := requestSortKeys[res.Key]; ok {
		res.Key = k
	}
	return res
}
