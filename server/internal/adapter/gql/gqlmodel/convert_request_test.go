package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestToRequest(t *testing.T) {
	ver := version.New().String()
	itm, _ := request.NewItem(id.NewItemID(), new(ver))
	req := request.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Items(request.ItemList{itm}).
		Title("foo").
		Description("xxx").
		State(request.StateClosed).
		Thread(id.NewThreadID().Ref()).
		Reviewers(accountdomain.UserIDList{accountdomain.NewUserID()}).
		CreatedBy(accountdomain.NewUserID()).
		ClosedAt(new(util.Now())).
		ApprovedAt(new(util.Now())).
		UpdatedAt(util.Now()).
		MustBuild()
	assert.Equal(t, &Request{
		ID: IDFrom(req.ID()),
		Items: []*RequestItem{{
			ItemID:  IDFrom(itm.Item()),
			Version: new(ver),
		}},
		Title:       "foo",
		Description: new("xxx"),
		CreatedByID: IDFrom(req.CreatedBy()),
		WorkspaceID: IDFrom(req.Workspace()),
		ProjectID:   IDFrom(req.Project()),
		ThreadID:    IDFromRef(req.Thread()),
		ReviewersID: []ID{IDFrom(req.Reviewers()[0])},
		State:       RequestStateClosed,
		CreatedAt:   req.CreatedAt(),
		UpdatedAt:   req.UpdatedAt(),
		ApprovedAt:  req.ApprovedAt(),
		ClosedAt:    req.ClosedAt(),
	}, ToRequest(req))
}

func TestToRequestState(t *testing.T) {
	assert.Equal(t, RequestStateClosed, ToRequestState(request.StateClosed))
	assert.Equal(t, RequestStateWaiting, ToRequestState(request.StateWaiting))
	assert.Equal(t, RequestStateApproved, ToRequestState(request.StateApproved))
	assert.Equal(t, RequestStateDraft, ToRequestState(request.StateDraft))
	assert.Equal(t, RequestState(""), ToRequestState("xxx"))
}

func TestToRequestSort(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		args *Sort
		want *usecasex.Sort
	}{
		{
			name: "nil",
		},
		{
			name: "creation time is sorted by ID",
			args: &Sort{Key: "createdAt", Reverted: new(true)},
			want: &usecasex.Sort{Key: "id", Reverted: true},
		},
		{
			name: "update time",
			args: &Sort{Key: "updatedAt"},
			want: &usecasex.Sort{Key: "updatedat"},
		},
		{
			name: "other keys are passed as they are",
			args: &Sort{Key: "title", Reverted: new(false)},
			want: &usecasex.Sort{Key: "title"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, ToRequestSort(tc.args))
		})
	}
}
