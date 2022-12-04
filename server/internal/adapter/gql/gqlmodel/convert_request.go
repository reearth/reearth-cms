package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/samber/lo"
)

func ToRequest(i *request.Request) *Request {
	if i == nil {
		return nil
	}

	return &Request{
		ID:          IDFrom(i.ID()),
		Items:       nil,
		Title:       i.Title(),
		Description: lo.ToPtr(i.Description()),
		CreatedBy:   IDFrom(i.CreatedBy()),
		WorkspaceID: IDFrom(i.Workspace()),
		ProjectID:   IDFrom(i.Project()),
		ThreadID:    IDFrom(i.Thread()),
		ReviewersID: lo.Map(i.Reviewers(), func(t id.UserID, _ int) ID {
			return IDFrom(t)
		}),
		State:      ToRequestState(i.State()),
		CreatedAt:  i.CreatedAt(),
		UpdatedAt:  i.UpdatedAt(),
		ApprovedAt: i.ApprovedAt(),
		ClosedAt:   i.ClosedAt(),
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
