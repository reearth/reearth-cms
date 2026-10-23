package test

import (
	"context"
	"slices"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type requestFactory = func(t *testing.T) repo.Request

func TestRequestRepo(t *testing.T, newRepo requestFactory) {
	t.Run("Filtered", func(t *testing.T) { testRequestFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testRequestFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testRequestFindByIDs(t, newRepo) })
	t.Run("FindByProject", func(t *testing.T) { testRequestFindByProject(t, newRepo) })
	t.Run("FindByProjectPagination", func(t *testing.T) { testRequestFindByProjectPagination(t, newRepo) })
	t.Run("FindByItems", func(t *testing.T) { testRequestFindByItems(t, newRepo) })
	t.Run("Fields", func(t *testing.T) { testRequestFields(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testRequestIsolation(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testRequestSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testRequestSaveAll(t, newRepo) })
}

func newRequest(pid id.ProjectID, iids ...id.ItemID) *request.Builder {
	if len(iids) == 0 {
		iids = id.ItemIDList{id.NewItemID()}
	}
	return request.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(pid).
		CreatedBy(accountdomain.NewUserID()).Title("request").
		Items(lo.Map(iids, func(iid id.ItemID, _ int) *request.Item {
			return newRequestItem(iid, version.New().OrRef())
		})).
		// mongo reads nil reviewers back as an empty list
		Reviewers(accountdomain.UserIDList{}).
		UpdatedAt(newRequestTime(0))
}

func newRequestItem(iid id.ItemID, vr version.VersionOrRef) *request.Item {
	return lo.Must(request.NewItemWithVersion(iid, vr))
}

func newRequestTime(d time.Duration) time.Time {
	return util.Now().Add(d).Truncate(time.Millisecond).UTC()
}

func newOrderedRequests(pid id.ProjectID, n int) []*request.Builder {
	ids := make(id.RequestIDList, n)
	for i := range ids {
		ids[i] = id.NewRequestID()
	}
	slices.SortFunc(ids, func(a, b id.RequestID) int { return a.Compare(b) })
	return lo.Map(ids, func(rid id.RequestID, _ int) *request.Builder { return newRequest(pid).ID(rid) })
}

// saveRequests seeds requests of any project one by one, as SaveAll takes
// requests of a single project
func saveRequests(t *testing.T, r repo.Request, l request.List) {
	t.Helper()
	for _, req := range l {
		require.NoError(t, r.Save(context.Background(), req))
	}
}

func requestIDs(l request.List) id.RequestIDList {
	return lo.Map(l, func(r *request.Request, _ int) id.RequestID { return r.ID() })
}

func requestCursor(r *request.Request) *usecasex.Cursor {
	return new(usecasex.Cursor(r.ID().String()))
}

func assertRequestPageInfo(t *testing.T, pi *usecasex.PageInfo, wantPage bool, wantTotal int64, want request.List, wantHasNext, wantHasPrev bool) {
	t.Helper()
	if !wantPage {
		assert.Nil(t, pi)
		return
	}
	var wantStart, wantEnd *usecasex.Cursor
	if len(want) > 0 {
		wantStart, wantEnd = requestCursor(want[0]), requestCursor(want[len(want)-1])
	}
	assert.Equal(t, usecasex.NewPageInfo(wantTotal, wantStart, wantEnd, wantHasNext, wantHasPrev), pi)
}

func testRequestFiltered(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2, p3 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	p1r1 := newRequest(p1).MustBuild()
	p2r1 := newRequest(p2).MustBuild()
	p3r1 := newRequest(p3).MustBuild()
	seeds := request.List{p1r1, p2r1, p3r1}

	tests := []struct {
		name      string
		filter    func(r repo.Request) repo.Request
		wantRead  request.List
		wantWrite id.ProjectIDList // projects Save must accept
		wantDeny  id.ProjectIDList // projects Save must reject
	}{
		{
			name: "must merge readable projects of chained filters",
			filter: func(r repo.Request) repo.Request {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, nil)).Filtered(pjFilter(id.ProjectIDList{p2}, nil))
			},
			wantRead: request.List{p1r1, p2r1},
			wantDeny: id.ProjectIDList{p1, p2, p3},
		},
		{
			name: "must merge writable projects of chained filters",
			filter: func(r repo.Request) repo.Request {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})).
					Filtered(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2}))
			},
			wantRead:  request.List{p1r1, p2r1},
			wantWrite: id.ProjectIDList{p1, p2},
			wantDeny:  id.ProjectIDList{p3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.Request) repo.Request {
				return r.Filtered(repo.ProjectFilter{}).Filtered(repo.ProjectFilter{})
			},
			wantRead:  seeds,
			wantWrite: id.ProjectIDList{p1, p2, p3},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveRequests(t, base, seeds)
			r := tc.filter(base)

			got, err := r.FindByIDs(ctx, requestIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, tc.wantRead, got)

			for _, p := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newRequest(p).MustBuild()))
			}
			for _, p := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newRequest(p).MustBuild()))
			}

			// filtering must not change the base repository
			all, err := base.FindByIDs(ctx, requestIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, seeds, all)
		})
	}
}

func testRequestFindByID(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1r1 := newRequest(p1).Description("description").Reviewers(accountdomain.UserIDList{accountdomain.NewUserID()}).
		State(request.StateApproved).ApprovedAt(new(newRequestTime(time.Hour))).Thread(id.NewThreadID().Ref()).MustBuild()
	p1r2 := newRequest(p1).MustBuild()
	p2r1 := newRequest(p2).MustBuild()
	seeds := request.List{p1r1, p1r2, p2r1}

	tests := []struct {
		name    string
		seeds   request.List
		filter  *repo.ProjectFilter
		args    id.RequestID
		want    *request.Request
		wantErr error
	}{
		{
			name:  "must find a request with all its fields",
			seeds: seeds,
			args:  p1r1.ID(),
			want:  p1r1,
		},
		{
			name:  "must find a request with default fields",
			seeds: seeds,
			args:  p1r2.ID(),
			want:  p1r2,
		},
		{
			name:   "must find a request of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2r1.ID(),
			want:   p2r1,
		},
		{
			name:    "must not find an unknown request",
			seeds:   seeds,
			args:    id.NewRequestID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any request in an empty repository",
			args:    p1r1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a request of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    p1r1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			// like ProjectFilter.CanRead, writable projects are readable
			name:   "must find a request of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1r1.ID(),
			want:   p1r1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveRequests(t, r, tc.seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testRequestFindByIDs(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1r1 := newRequest(p1).MustBuild()
	p1r2 := newRequest(p1).MustBuild()
	p2r1 := newRequest(p2).MustBuild()
	seeds := request.List{p1r1, p1r2, p2r1}

	tests := []struct {
		name   string
		seeds  request.List
		filter *repo.ProjectFilter
		args   id.RequestIDList
		want   request.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.RequestIDList{},
		},
		{
			name: "must find nothing for an unknown ID in an empty repository",
			args: id.RequestIDList{id.NewRequestID()},
			want: request.List{},
		},
		{
			name:  "must find requests across projects",
			seeds: seeds,
			args:  id.RequestIDList{p1r1.ID(), p1r2.ID(), p2r1.ID()},
			want:  request.List{p1r1, p1r2, p2r1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.RequestIDList{p2r1.ID(), p1r2.ID(), p1r1.ID()},
			want:  request.List{p2r1, p1r2, p1r1},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.RequestIDList{id.NewRequestID(), p1r2.ID()},
			want:  request.List{p1r2},
		},
		{
			name:   "must skip requests of unreadable projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})),
			args:   id.RequestIDList{p2r1.ID(), p1r1.ID()},
			want:   request.List{p1r1},
		},
		{
			// like ProjectFilter.CanRead, writable projects are readable
			name:   "must find requests of readable and writable-only projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p1})),
			args:   id.RequestIDList{p2r1.ID(), p1r1.ID()},
			want:   request.List{p2r1, p1r1},
		},
		{
			name:   "must find an empty list with no readable projects",
			seeds:  seeds,
			filter: new(pjFilter(nil, nil)),
			args:   id.RequestIDList{p1r1.ID(), p2r1.ID()},
			want:   request.List{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveRequests(t, r, tc.seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testRequestFindByProject(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	i1, i2, i3 := id.NewItemID(), id.NewItemID(), id.NewItemID()

	bs := newOrderedRequests(p1, 4)
	p1r1 := bs[0].Title("Alpha request").Description("the first one").CreatedBy(u1).
		Reviewers(accountdomain.UserIDList{u2}).State(request.StateWaiting).
		Items(request.ItemList{newRequestItem(i1, version.New().OrRef())}).MustBuild()
	p1r2 := bs[1].Title("beta (v1.0)").Description("mentions ALPHA").CreatedBy(u2).
		Reviewers(accountdomain.UserIDList{u1, u2}).State(request.StateApproved).
		Items(request.ItemList{newRequestItem(i1, version.New().OrRef()), newRequestItem(i2, version.Latest.OrVersion())}).MustBuild()
	p1r3 := bs[2].Title("gamma").CreatedBy(u1).State(request.StateDraft).
		Items(request.ItemList{newRequestItem(i3, version.New().OrRef())}).MustBuild()
	p1r4 := bs[3].Title("delta").CreatedBy(u2).Reviewers(accountdomain.UserIDList{u1}).State(request.StateClosed).
		Items(request.ItemList{newRequestItem(i2, version.New().OrRef())}).MustBuild()
	// a matching request of another project is excluded from the results and the count
	p2r1 := newRequest(p2, i1).Title("alpha").CreatedBy(u1).Reviewers(accountdomain.UserIDList{u1, u2}).MustBuild()
	seeds := request.List{p1r1, p1r2, p1r3, p1r4, p2r1}
	all := request.List{p1r1, p1r2, p1r3, p1r4}

	tests := []struct {
		name   string
		filter *repo.ProjectFilter
		pid    id.ProjectID
		args   repo.RequestFilter
		want   request.List // in ID order
	}{
		{
			name: "must find all requests of the project without a filter",
			pid:  p1,
			want: all,
		},
		{
			name: "must find nothing in an unknown project",
			pid:  id.NewProjectID(),
		},
		{
			name: "must find requests by state",
			pid:  p1,
			args: repo.RequestFilter{State: []request.State{request.StateWaiting}},
			want: request.List{p1r1},
		},
		{
			name: "must find requests by any of the states",
			pid:  p1,
			args: repo.RequestFilter{State: []request.State{request.StateApproved, request.StateClosed}},
			want: request.List{p1r2, p1r4},
		},
		{
			name: "must find requests by creator",
			pid:  p1,
			args: repo.RequestFilter{CreatedBy: &u1},
			want: request.List{p1r1, p1r3},
		},
		{
			name: "must find requests by reviewer",
			pid:  p1,
			args: repo.RequestFilter{Reviewer: &u1},
			want: request.List{p1r2, p1r4},
		},
		{
			name: "must find nothing for an unknown reviewer",
			pid:  p1,
			args: repo.RequestFilter{Reviewer: new(accountdomain.NewUserID())},
		},
		{
			name: "must find all requests with an empty keyword",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new("")},
			want: all,
		},
		{
			name: "must find requests by keyword in the title or the description case-insensitively",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new("alpha")},
			want: request.List{p1r1, p1r2},
		},
		{
			name: "must match regular expression characters in the keyword literally",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new("(v1.0)")},
			want: request.List{p1r2},
		},
		{
			name: "must not treat the keyword as a regular expression",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new("b.ta")},
		},
		{
			name: "must find a request by its ID as the keyword",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new(p1r3.ID().String())},
			want: request.List{p1r3},
		},
		{
			name: "must find requests by an item ID as the keyword",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new(i2.String())},
			want: request.List{p1r2, p1r4},
		},
		{
			name: "must not find requests by a part of an item ID",
			pid:  p1,
			args: repo.RequestFilter{Keyword: new(i2.String()[:20])},
		},
		{
			name: "must combine the state and the keyword",
			pid:  p1,
			args: repo.RequestFilter{State: []request.State{request.StateDraft}, Keyword: new("alpha")},
		},
		{
			name: "must combine the creator and the reviewer",
			pid:  p1,
			args: repo.RequestFilter{CreatedBy: &u2, Reviewer: &u2},
			want: request.List{p1r2},
		},
		{
			name: "must combine all filters",
			pid:  p1,
			args: repo.RequestFilter{
				State:     []request.State{request.StateWaiting, request.StateApproved},
				Keyword:   new("ALPHA"),
				CreatedBy: &u1,
				Reviewer:  &u2,
			},
			want: request.List{p1r1},
		},
		{
			name:   "must find requests of a readable project",
			filter: new(pjFilter(id.ProjectIDList{p1}, nil)),
			pid:    p1,
			args:   repo.RequestFilter{Keyword: new("alpha")},
			want:   request.List{p1r1, p1r2},
		},
		{
			// like ProjectFilter.CanRead, writable projects are readable
			name:   "must find requests of a writable-only project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			pid:    p1,
			args:   repo.RequestFilter{Keyword: new("alpha")},
			want:   request.List{p1r1, p1r2},
		},
		{
			name:   "must find nothing in an unreadable project",
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			pid:    p1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveRequests(t, r, seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, pi, err := r.FindByProject(ctx, tc.pid, tc.args, nil, first(10))
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
			assertRequestPageInfo(t, pi, true, int64(len(tc.want)), tc.want, false, false)
		})
	}
}

func testRequestFindByProjectPagination(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()

	// IDs ascend from p1r1 to p1r4; every other sortable field orders them differently
	bs := newOrderedRequests(p1, 4)
	p1r1 := bs[0].Title("c").UpdatedAt(newRequestTime(2 * time.Hour)).MustBuild()
	p1r2 := bs[1].Title("a").UpdatedAt(newRequestTime(4 * time.Hour)).ApprovedAt(new(newRequestTime(2 * time.Hour))).MustBuild()
	p1r3 := bs[2].Title("d").UpdatedAt(newRequestTime(1 * time.Hour)).MustBuild()
	p1r4 := bs[3].Title("b").UpdatedAt(newRequestTime(3 * time.Hour)).ApprovedAt(new(newRequestTime(time.Hour))).MustBuild()
	// a request of another project is excluded from the results and the count
	p2r1 := newRequest(p2).Title("0").MustBuild()

	type args struct {
		sort       *usecasex.Sort
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		args        args
		want        request.List // in order
		wantTotal   int64
		wantPage    bool // whether page info is returned
		wantHasNext bool
		wantHasPrev bool
		wantErr     bool
	}{
		{
			name:        "must find the first page in ID order",
			args:        args{pagination: first(2)},
			want:        request.List{p1r1, p1r2},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find all requests when the page is larger",
			args:      args{pagination: first(10)},
			want:      request.List{p1r1, p1r2, p1r3, p1r4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must find all requests with the default page size",
			args:      args{pagination: usecasex.CursorPagination{}.Wrap()},
			want:      request.List{p1r1, p1r2, p1r3, p1r4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:        "must find the last page",
			args:        args{pagination: usecasex.CursorPagination{Last: new(int64(2))}.Wrap()},
			want:        request.List{p1r3, p1r4},
			wantTotal:   4,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name:        "must find a page after a cursor",
			args:        args{pagination: usecasex.CursorPagination{After: requestCursor(p1r1), First: new(int64(2))}.Wrap()},
			want:        request.List{p1r2, p1r3},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find requests before a cursor",
			args:      args{pagination: usecasex.CursorPagination{Before: requestCursor(p1r3), Last: new(int64(10))}.Wrap()},
			want:      request.List{p1r1, p1r2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:        "must find a page by offset",
			args:        args{pagination: usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap()},
			want:        request.List{p1r2, p1r3},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find nothing beyond the last offset",
			args:      args{pagination: usecasex.OffsetPagination{Offset: 10, Limit: 2}.Wrap()},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by title",
			args:      args{sort: &usecasex.Sort{Key: "title"}, pagination: first(10)},
			want:      request.List{p1r2, p1r4, p1r1, p1r3},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by title in reverse",
			args:      args{sort: &usecasex.Sort{Key: "title", Reverted: true}, pagination: first(10)},
			want:      request.List{p1r3, p1r1, p1r4, p1r2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by update time",
			args:      args{sort: &usecasex.Sort{Key: "updatedat"}, pagination: first(10)},
			want:      request.List{p1r3, p1r1, p1r4, p1r2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by approval time with unapproved requests first",
			args:      args{sort: &usecasex.Sort{Key: "approvedat"}, pagination: first(10)},
			want:      request.List{p1r1, p1r3, p1r4, p1r2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by approval time in reverse with unapproved requests last",
			args:      args{sort: &usecasex.Sort{Key: "approvedat", Reverted: true}, pagination: first(10)},
			want:      request.List{p1r2, p1r4, p1r3, p1r1},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by update time with a camel case key",
			args:      args{sort: &usecasex.Sort{Key: "updatedAt"}, pagination: first(10)},
			want:      request.List{p1r3, p1r1, p1r4, p1r2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by ID for an unknown key",
			args:      args{sort: &usecasex.Sort{Key: "unknown", Reverted: true}, pagination: first(10)},
			want:      request.List{p1r4, p1r3, p1r2, p1r1},
			wantTotal: 4,
			wantPage:  true,
		},
		// TODO: a cursor on a sort by a nullable field (approvedat, closedat)
		// finds only the documents with a value: reearthx mongox pageFilter
		// compares the field with the cursor's null value ($gt: null), which
		// matches nothing. Such cases are left out until mongox is fixed.
		{
			// the creation time is the ID order
			name:      "must sort by creation time in reverse",
			args:      args{sort: &usecasex.Sort{Key: "createdAt", Reverted: true}, pagination: first(10)},
			want:      request.List{p1r4, p1r3, p1r2, p1r1},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name: "must find a page by offset sorted by creation time in reverse",
			args: args{
				sort:       &usecasex.Sort{Key: "createdAt", Reverted: true},
				pagination: usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap(),
			},
			want:        request.List{p1r3, p1r2},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name: "must find requests after a cursor sorted by creation time in reverse",
			args: args{
				sort:       &usecasex.Sort{Key: "createdAt", Reverted: true},
				pagination: usecasex.CursorPagination{After: requestCursor(p1r3), First: new(int64(10))}.Wrap(),
			},
			want:      request.List{p1r2, p1r1},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name: "must find requests after a cursor sorted by title",
			args: args{
				sort:       &usecasex.Sort{Key: "title"},
				pagination: usecasex.CursorPagination{After: requestCursor(p1r4), First: new(int64(10))}.Wrap(),
			},
			want:      request.List{p1r1, p1r3},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name: "must find the last page sorted by title in reverse",
			args: args{
				sort:       &usecasex.Sort{Key: "title", Reverted: true},
				pagination: usecasex.CursorPagination{Last: new(int64(2))}.Wrap(),
			},
			want:        request.List{p1r4, p1r2},
			wantTotal:   4,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name: "must find requests before a cursor sorted by update time",
			args: args{
				sort:       &usecasex.Sort{Key: "updatedat"},
				pagination: usecasex.CursorPagination{Before: requestCursor(p1r2), Last: new(int64(10))}.Wrap(),
			},
			want:      request.List{p1r3, p1r1, p1r4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name: "must find nothing without pagination",
		},
		{
			name:    "must fail with a negative offset",
			args:    args{pagination: usecasex.OffsetPagination{Offset: -1, Limit: 2}.Wrap()},
			wantErr: true,
		},
		{
			name:    "must fail with an unknown cursor",
			args:    args{pagination: usecasex.CursorPagination{After: new(usecasex.Cursor(id.NewRequestID().String())), First: new(int64(10))}.Wrap()},
			wantErr: true,
		},
		{
			name:    "must fail with a malformed cursor",
			args:    args{pagination: usecasex.CursorPagination{After: new(usecasex.Cursor("malformed")), First: new(int64(10))}.Wrap()},
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveRequests(t, r, request.List{p1r1, p1r2, p1r3, p1r4, p2r1})

			got, pi, err := r.FindByProject(ctx, p1, repo.RequestFilter{}, tc.args.sort, tc.args.pagination)
			if tc.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				assert.Nil(t, pi)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
			assertRequestPageInfo(t, pi, tc.wantPage, tc.wantTotal, tc.want, tc.wantHasNext, tc.wantHasPrev)
		})
	}
}

func testRequestFindByItems(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	i1, i2, i3 := id.NewItemID(), id.NewItemID(), id.NewItemID()
	p1r1 := newRequest(p1, i1).Title("Alpha").CreatedBy(u1).Reviewers(accountdomain.UserIDList{u2}).MustBuild()
	p1r2 := newRequest(p1, i1, i2).Title("beta").CreatedBy(u2).
		Reviewers(accountdomain.UserIDList{u1}).State(request.StateApproved).MustBuild()
	p1r3 := newRequest(p1, i3).Title("alpha beta").CreatedBy(u1).State(request.StateDraft).MustBuild()
	p2r1 := newRequest(p2, i2).Title("alpha").CreatedBy(u1).MustBuild()
	seeds := request.List{p1r1, p1r2, p1r3, p2r1}

	type args struct {
		items  id.ItemIDList
		filter *repo.RequestFilter
	}

	tests := []struct {
		name   string
		filter *repo.ProjectFilter
		args   args
		want   request.List // in any order, as mongo applies no sort
	}{
		{
			name: "must find requests including the item",
			args: args{items: id.ItemIDList{i1}},
			want: request.List{p1r1, p1r2},
		},
		{
			name: "must find requests including any of the items across projects",
			args: args{items: id.ItemIDList{i2, i3}},
			want: request.List{p1r2, p1r3, p2r1},
		},
		{
			name: "must find nothing for an unknown item",
			args: args{items: id.ItemIDList{id.NewItemID()}},
		},
		{
			name: "must find nothing for an empty list",
			args: args{items: id.ItemIDList{}},
		},
		{
			name: "must find nothing for a nil list",
			args: args{items: nil},
		},
		{
			name: "must find requests with an empty filter",
			args: args{items: id.ItemIDList{i1, i2}, filter: &repo.RequestFilter{}},
			want: request.List{p1r1, p1r2, p2r1},
		},
		{
			name: "must find requests by state",
			args: args{items: id.ItemIDList{i1, i3}, filter: &repo.RequestFilter{State: []request.State{request.StateApproved, request.StateDraft}}},
			want: request.List{p1r2, p1r3},
		},
		{
			name: "must find requests by creator",
			args: args{items: id.ItemIDList{i1, i2}, filter: &repo.RequestFilter{CreatedBy: &u1}},
			want: request.List{p1r1, p2r1},
		},
		{
			name: "must find requests by reviewer",
			args: args{items: id.ItemIDList{i1, i2}, filter: &repo.RequestFilter{Reviewer: &u1}},
			want: request.List{p1r2},
		},
		{
			name: "must find requests by keyword in the title case-insensitively",
			args: args{items: id.ItemIDList{i1, i3}, filter: &repo.RequestFilter{Keyword: new("ALPHA")}},
			want: request.List{p1r1, p1r3},
		},
		{
			name: "must not treat the keyword as a regular expression",
			args: args{items: id.ItemIDList{i1, i3}, filter: &repo.RequestFilter{Keyword: new("a.pha")}},
		},
		{
			name: "must combine all filters",
			args: args{items: id.ItemIDList{i1, i2, i3}, filter: &repo.RequestFilter{
				State:     []request.State{request.StateWaiting},
				Keyword:   new("alpha"),
				CreatedBy: &u1,
				Reviewer:  &u2,
			}},
			want: request.List{p1r1},
		},
		{
			name:   "must find requests of readable projects",
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   args{items: id.ItemIDList{i1, i2}},
			want:   request.List{p2r1},
		},
		{
			name:   "must find nothing in unreadable projects",
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:   args{items: id.ItemIDList{i1, i3}},
		},
		{
			// like ProjectFilter.CanRead, writable projects are readable
			name:   "must find requests of writable-only projects",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{items: id.ItemIDList{i1}},
			want:   request.List{p1r1, p1r2},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveRequests(t, r, seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByItems(ctx, tc.args.items, tc.args.filter)
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got)
		})
	}
}

func testRequestFields(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	pid := id.NewProjectID()

	tests := []struct {
		name string
		args *request.Request // saved, then found by ID unchanged
	}{
		{
			name: "must keep all fields",
			args: newRequest(pid).Description("description").
				Reviewers(accountdomain.UserIDList{accountdomain.NewUserID(), accountdomain.NewUserID()}).
				State(request.StateClosed).UpdatedAt(newRequestTime(3 * time.Hour)).
				ApprovedAt(new(newRequestTime(time.Hour))).ClosedAt(new(newRequestTime(2 * time.Hour))).
				Thread(id.NewThreadID().Ref()).MustBuild(),
		},
		{
			name: "must keep default fields",
			args: newRequest(pid).MustBuild(),
		},
		{
			name: "must keep items pointing to versions and refs in order",
			args: newRequest(pid).Items(request.ItemList{
				newRequestItem(id.NewItemID(), version.Latest.OrVersion()),
				newRequestItem(id.NewItemID(), version.New().OrRef()),
				newRequestItem(id.NewItemID(), version.Public.OrVersion()),
				newRequestItem(id.NewItemID(), version.Ref("custom").OrVersion()),
			}).MustBuild(),
		},
		{
			name: "must keep an item without a version or a ref",
			args: newRequest(pid).Items(request.ItemList{
				newRequestItem(id.NewItemID(), version.VersionOrRef{}),
				newRequestItem(id.NewItemID(), version.New().OrRef()),
			}).MustBuild(),
		},
		{
			name: "must keep a draft request",
			args: newRequest(pid).State(request.StateDraft).MustBuild(),
		},
		{
			name: "must keep a waiting request",
			args: newRequest(pid).State(request.StateWaiting).MustBuild(),
		},
		{
			name: "must keep an approved request",
			args: newRequest(pid).State(request.StateApproved).ApprovedAt(new(newRequestTime(time.Hour))).MustBuild(),
		},
		{
			name: "must keep multibyte text",
			args: newRequest(pid).Title("リクエスト 🚀").Description("説明\n改行").MustBuild(),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.Save(ctx, tc.args))

			got, err := r.FindByID(ctx, tc.args.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.args, got)
		})
	}
}

func testRequestIsolation(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	pid := id.NewProjectID()

	tests := []struct {
		name   string
		change func(t *testing.T, r repo.Request, saved *request.Request) // must not reach the store
	}{
		{
			name: "must not change the store through a saved request",
			change: func(t *testing.T, _ repo.Request, saved *request.Request) {
				require.NoError(t, saved.SetTitle("changed"))
				saved.SetState(request.StateApproved)
				saved.Items()[0].SetPointer(version.Latest.OrVersion())
			},
		},
		{
			name: "must not change the store through a found request",
			change: func(t *testing.T, r repo.Request, saved *request.Request) {
				found, err := r.FindByID(ctx, saved.ID())
				require.NoError(t, err)
				require.NoError(t, found.SetTitle("changed"))
				found.SetState(request.StateApproved)
				found.Items()[0].SetPointer(version.Latest.OrVersion())
			},
		},
		{
			name: "must not change the store through a request found by project",
			change: func(t *testing.T, r repo.Request, _ *request.Request) {
				found, _, err := r.FindByProject(ctx, pid, repo.RequestFilter{}, nil, first(10))
				require.NoError(t, err)
				found[0].SetReviewers(accountdomain.UserIDList{accountdomain.NewUserID()})
				found[0].Items()[0].SetPointer(version.Latest.OrVersion())
			},
		},
		{
			name: "must not change the store through a request found by items",
			change: func(t *testing.T, r repo.Request, saved *request.Request) {
				found, err := r.FindByItems(ctx, saved.Items().IDs(), nil)
				require.NoError(t, err)
				found[0].SetDescription("changed")
				found[0].Items()[0].SetPointer(version.Latest.OrVersion())
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			want := newRequest(pid).MustBuild()
			saved := want.Clone()
			r := newRepo(t)
			require.NoError(t, r.Save(ctx, saved))

			tc.change(t, r, saved)

			got, err := r.FindByID(ctx, want.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}

func testRequestSave(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1 := id.NewProjectID()
	p1r1 := newRequest(p1).Title("before").MustBuild()
	p1r1Updated := newRequest(p1).ID(p1r1.ID()).Workspace(p1r1.Workspace()).CreatedBy(p1r1.CreatedBy()).
		Title("after").Description("description").State(request.StateApproved).
		ApprovedAt(new(newRequestTime(time.Hour))).UpdatedAt(newRequestTime(time.Hour)).MustBuild()
	unknownState := newRequest(p1).MustBuild()
	unknownState.SetState("unknown")

	tests := []struct {
		name    string
		seeds   request.List
		filter  *repo.ProjectFilter
		args    *request.Request
		want    *request.Request // the stored request afterwards
		wantErr error
	}{
		{
			name: "must save a new request",
			args: p1r1,
			want: p1r1,
		},
		{
			name:  "must overwrite an existing request",
			seeds: request.List{p1r1},
			args:  p1r1Updated,
			want:  p1r1Updated,
		},
		{
			name:   "must save a request in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1r1,
			want:   p1r1,
		},
		{
			name:    "must not save a request in a readable-only project",
			filter:  new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:    p1r1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a request outside writable projects",
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1r1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a request outside writable projects",
			seeds:   request.List{p1r1},
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1r1Updated,
			want:    p1r1, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a request with an unknown state",
			args:    unknownState,
			wantErr: request.ErrInvalidState,
		},
		{
			name:    "must not save a nil request",
			wantErr: rerror.ErrInvalidParams,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveRequests(t, base, tc.seeds)
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Save(ctx, tc.args))
			if tc.args == nil {
				return
			}

			// the stored state is checked unfiltered
			got, err := base.FindByID(ctx, tc.args.ID())
			assert.Equal(t, tc.want, got)
			if tc.want == nil {
				assert.Equal(t, rerror.ErrNotFound, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func testRequestSaveAll(t *testing.T, newRepo requestFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1r1 := newRequest(p1).MustBuild()
	p1r2 := newRequest(p1).MustBuild()
	p1r1Updated := newRequest(p1).ID(p1r1.ID()).Workspace(p1r1.Workspace()).CreatedBy(p1r1.CreatedBy()).
		Title("after").State(request.StateClosed).ClosedAt(new(newRequestTime(time.Hour))).MustBuild()
	p2r1 := newRequest(p2).MustBuild()
	unknownState := newRequest(p1).MustBuild()
	unknownState.SetState("unknown")
	all := id.RequestIDList{p1r1.ID(), p1r2.ID(), p2r1.ID(), unknownState.ID()}

	type args struct {
		pid      id.ProjectID
		requests request.List
	}

	tests := []struct {
		name    string
		seeds   request.List
		filter  *repo.ProjectFilter
		args    args
		want    request.List // the stored requests afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: args{pid: p1, requests: request.List{}},
			want: request.List{},
		},
		{
			name:   "must save nothing for an empty list even in a project that is not writable",
			filter: new(pjFilter(nil, nil)),
			args:   args{pid: p1},
			want:   request.List{},
		},
		{
			name: "must save requests",
			args: args{pid: p1, requests: request.List{p1r1, p1r2}},
			want: request.List{p1r1, p1r2},
		},
		{
			name:    "must not save a list that includes a nil request",
			args:    args{pid: p1, requests: request.List{nil, p1r2}},
			want:    request.List{},
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:  "must overwrite existing requests",
			seeds: request.List{p1r1, p1r2},
			args:  args{pid: p1, requests: request.List{p1r1Updated}},
			want:  request.List{p1r1Updated, p1r2},
		},
		{
			name:   "must save requests in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{pid: p1, requests: request.List{p1r1, p1r2}},
			want:   request.List{p1r1, p1r2},
		},
		{
			name:    "must not save requests in a project that is not writable",
			filter:  new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:    args{pid: p1, requests: request.List{p1r1, p1r2}},
			want:    request.List{},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save requests of another project",
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    args{pid: p1, requests: request.List{p1r1, p2r1}},
			want:    request.List{},
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:    "must not save requests of another project without a filter",
			args:    args{pid: p1, requests: request.List{p2r1}},
			want:    request.List{},
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:    "must not save a request with an unknown state",
			args:    args{pid: p1, requests: request.List{p1r1, unknownState}},
			want:    request.List{},
			wantErr: request.ErrInvalidState,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveRequests(t, base, tc.seeds)
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.SaveAll(ctx, tc.args.pid, tc.args.requests))

			// the stored state is checked unfiltered
			got, err := base.FindByIDs(ctx, all)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
