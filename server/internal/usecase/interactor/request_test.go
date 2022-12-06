package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRequest_FindByID(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItemWithVersion(id.NewItemID(), version.New().OrRef())
	wid := id.NewWorkspaceID()

	req1 := request.New().
		NewID().
		Workspace(wid).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(wid).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("hoge").
		MustBuild()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: lo.ToPtr(u.ID()),
	}

	tests := []struct {
		name  string
		seeds []*request.Request
		args  struct {
			id       id.RequestID
			operator *usecase.Operator
		}
		want           *request.Request
		mockRequestErr bool
		wantErr        error
	}{
		{
			name:  "find 1 of 2",
			seeds: []*request.Request{req1, req2},
			args: struct {
				id       id.RequestID
				operator *usecase.Operator
			}{
				id:       req1.ID(),
				operator: op,
			},
			want:    req1,
			wantErr: nil,
		},
		{
			name:  "find 1 of 0",
			seeds: []*request.Request{},
			args: struct {
				id       id.RequestID
				operator *usecase.Operator
			}{
				id:       req1.ID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockRequestErr {
				memory.SetRequestError(db.Request, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Request.Save(ctx, p)
				assert.NoError(t, err)
			}
			requestUC := NewRequest(db, nil)

			got, err := requestUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestRequest_FindByIDs(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItemWithVersion(id.NewItemID(), version.New().OrRef())
	wid := id.NewWorkspaceID()

	req1 := request.New().
		NewID().
		Workspace(wid).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(wid).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("hoge").
		MustBuild()
	req3 := request.New().
		NewID().
		Workspace(wid).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("xxx").
		MustBuild()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: lo.ToPtr(u.ID()),
	}

	tests := []struct {
		name  string
		seeds []*request.Request
		args  struct {
			ids      id.RequestIDList
			operator *usecase.Operator
		}
		want           int
		mockRequestErr bool
		wantErr        error
	}{
		{
			name:  "find 2 of 3",
			seeds: []*request.Request{req1, req2, req3},
			args: struct {
				ids      id.RequestIDList
				operator *usecase.Operator
			}{
				ids:      id.RequestIDList{req1.ID(), req2.ID()},
				operator: op,
			},
			want: 2,
		},
		{
			name:  "find 0 of 3",
			seeds: []*request.Request{req1, req2, req3},
			args: struct {
				ids      id.RequestIDList
				operator *usecase.Operator
			}{
				ids:      id.RequestIDList{id.NewRequestID()},
				operator: op,
			},
			want: 0,
		},
		{
			name:           "mock error",
			mockRequestErr: true,
			wantErr:        errors.New("test"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockRequestErr {
				memory.SetRequestError(db.Request, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Request.Save(ctx, p)
				assert.NoError(t, err)
			}
			requestUC := NewRequest(db, nil)

			got, err := requestUC.FindByIDs(ctx, tc.args.ids, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestRequest_FindByProject(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItemWithVersion(id.NewItemID(), version.New().OrRef())
	wid := id.NewWorkspaceID()

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{item}).
		State(request.StateDraft).
		Title("hoge").
		MustBuild()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: lo.ToPtr(u.ID()),
	}

	tests := []struct {
		name  string
		seeds []*request.Request
		args  struct {
			pid      id.ProjectID
			filter   interfaces.RequestFilter
			operator *usecase.Operator
		}
		want           int
		mockRequestErr bool
		wantErr        error
	}{
		{
			name:  "must find 2",
			seeds: []*request.Request{req1, req2},
			args: struct {
				pid      id.ProjectID
				filter   interfaces.RequestFilter
				operator *usecase.Operator
			}{
				pid:      pid,
				operator: op,
			},
			want: 2,
		},
		{
			name:  "must find 1",
			seeds: []*request.Request{req1, req2},
			args: struct {
				pid      id.ProjectID
				filter   interfaces.RequestFilter
				operator *usecase.Operator
			}{
				pid: pid,
				filter: interfaces.RequestFilter{
					Keyword: lo.ToPtr("foo"),
				},
				operator: op,
			},
			want: 1,
		},
		{
			name:  "must find 1",
			seeds: []*request.Request{req1, req2},
			args: struct {
				pid      id.ProjectID
				filter   interfaces.RequestFilter
				operator *usecase.Operator
			}{
				pid: pid,
				filter: interfaces.RequestFilter{
					State: lo.ToPtr(request.StateDraft),
				},
				operator: op,
			},
			want: 1,
		},
		{
			name:           "mock error",
			mockRequestErr: true,
			wantErr:        errors.New("test"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockRequestErr {
				memory.SetRequestError(db.Request, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Request.Save(ctx, p)
				assert.NoError(t, err)
			}
			requestUC := NewRequest(db, nil)

			got, _, err := requestUC.FindByProject(ctx, tc.args.pid, tc.args.filter, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}
