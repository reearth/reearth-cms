package test

import (
	"context"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type groupFactory = func(t *testing.T) repo.Group

func TestGroupRepo(t *testing.T, newRepo groupFactory) {
	t.Run("Filtered", func(t *testing.T) { testGroupFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testGroupFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testGroupFindByIDs(t, newRepo) })
	t.Run("Filter", func(t *testing.T) { testGroupFilter(t, newRepo) })
	t.Run("FindByProject", func(t *testing.T) { testGroupFindByProject(t, newRepo) })
	t.Run("FindByKey", func(t *testing.T) { testGroupFindByKey(t, newRepo) })
	t.Run("FindByIDOrKey", func(t *testing.T) { testGroupFindByIDOrKey(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testGroupSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testGroupSaveAll(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testGroupRemove(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testGroupIsolation(t, newRepo) })
}

func newGroup(pid id.ProjectID) *group.Builder {
	return group.New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.RandomKey())
}

// newOrderedGroups builds n groups of the project whose IDs ascend with
// their index.
func newOrderedGroups(pid id.ProjectID, n int) []*group.Builder {
	ids := make(id.GroupIDList, n)
	for i := range ids {
		ids[i] = id.NewGroupID()
		time.Sleep(10 * time.Millisecond) // ensure IDs are unique and ascending
	}
	slices.SortFunc(ids, func(a, b id.GroupID) int { return a.Compare(b) })
	return lo.Map(ids, func(gid id.GroupID, _ int) *group.Builder { return newGroup(pid).ID(gid) })
}

func groupIDs(l group.List) id.GroupIDList {
	return lo.Map(l, func(g *group.Group, _ int) id.GroupID { return g.ID() })
}

func groupCursor(g *group.Group) *usecasex.Cursor {
	return new(usecasex.Cursor(g.ID().String()))
}

func testGroupFiltered(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2, p3 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	p3g1 := newGroup(p3).MustBuild()
	seeds := group.List{p1g1, p2g1, p3g1}

	tests := []struct {
		name      string
		filter    func(r repo.Group) repo.Group
		wantRead  group.List
		wantWrite id.ProjectIDList // projects Save must accept
		wantDeny  id.ProjectIDList // projects Save must reject
	}{
		{
			name: "must merge readable projects of chained filters",
			filter: func(r repo.Group) repo.Group {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, nil)).Filtered(pjFilter(id.ProjectIDList{p2}, nil))
			},
			wantRead: group.List{p1g1, p2g1},
			wantDeny: id.ProjectIDList{p1, p2, p3},
		},
		{
			name: "must merge writable projects of chained filters",
			filter: func(r repo.Group) repo.Group {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})).
					Filtered(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2}))
			},
			wantRead:  group.List{p1g1, p2g1},
			wantWrite: id.ProjectIDList{p1, p2},
			wantDeny:  id.ProjectIDList{p3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.Group) repo.Group {
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
			require.NoError(t, base.SaveAll(ctx, seeds))
			r := tc.filter(base)

			got, err := r.FindByIDs(ctx, groupIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, groupIDs(tc.wantRead), groupIDs(got))

			for _, p := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newGroup(p).MustBuild()))
			}
			for _, p := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newGroup(p).MustBuild()))
			}

			// filtering must not change the base repository
			all, err := base.FindByIDs(ctx, groupIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, seeds, all)
		})
	}
}

func testGroupFindByID(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).Name("name").Description("description").Key(id.NewKey("full-group")).Order(3).MustBuild()
	p1g2 := newGroup(p1).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	seeds := group.List{p1g1, p1g2, p2g1}

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    id.GroupID
		want    *group.Group
		wantErr error
	}{
		{
			name:  "must find a group with all its fields",
			seeds: seeds,
			args:  p1g1.ID(),
			want:  p1g1,
		},
		{
			name:  "must find a group with default fields",
			seeds: seeds,
			args:  p1g2.ID(),
			want:  p1g2,
		},
		{
			name:   "must find a group of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2g1.ID(),
			want:   p2g1,
		},
		{
			name:    "must not find an unknown group",
			seeds:   seeds,
			args:    id.NewGroupID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any group in an empty repository",
			args:    p1g1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a group of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    p1g1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			// reads are scoped by the readable list alone, even though
			// ProjectFilter.CanRead treats writable projects as readable
			name:    "must not find a group of a writable-only project",
			seeds:   seeds,
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    p1g1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testGroupFindByIDs(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).MustBuild()
	p1g2 := newGroup(p1).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	seeds := group.List{p1g1, p1g2, p2g1}

	tests := []struct {
		name   string
		seeds  group.List
		filter *repo.ProjectFilter
		args   id.GroupIDList
		want   group.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.GroupIDList{},
		},
		{
			name: "must find nothing for an unknown ID in an empty repository",
			args: id.GroupIDList{id.NewGroupID()},
			want: group.List{},
		},
		{
			name:  "must find groups across projects",
			seeds: seeds,
			args:  id.GroupIDList{p1g1.ID(), p1g2.ID(), p2g1.ID()},
			want:  group.List{p1g1, p1g2, p2g1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.GroupIDList{p2g1.ID(), p1g2.ID(), p1g1.ID()},
			want:  group.List{p2g1, p1g2, p1g1},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.GroupIDList{id.NewGroupID(), p1g2.ID()},
			want:  group.List{p1g2},
		},
		{
			name:   "must skip groups of unreadable projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})),
			args:   id.GroupIDList{p2g1.ID(), p1g1.ID()},
			want:   group.List{p1g1},
		},
		{
			// reads are scoped by the readable list alone
			name:   "must skip groups of writable-only projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p1})),
			args:   id.GroupIDList{p1g1.ID(), p2g1.ID()},
			want:   group.List{p2g1},
		},
		{
			name:   "must find an empty list with no readable projects",
			seeds:  seeds,
			filter: new(pjFilter(nil, nil)),
			args:   id.GroupIDList{p1g1.ID(), p2g1.ID()},
			want:   group.List{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testGroupFilter(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	// IDs ascend from p1g1 to p1g5 while their orders do not; p1g4 and p1g5
	// share an order, so ties are proven to be broken by ID
	bs := newOrderedGroups(p1, 5)
	p1g1 := bs[0].Order(2).MustBuild()
	p1g2 := bs[1].Order(0).MustBuild()
	p1g3 := bs[2].Order(3).MustBuild()
	p1g4 := bs[3].Order(1).MustBuild()
	p1g5 := bs[4].Order(1).MustBuild()
	// a group of another project is excluded from the results and the count
	seeds := group.List{newGroup(p2).MustBuild(), p1g1, p1g2, p1g3, p1g4, p1g5}

	byOrder := group.List{p1g2, p1g4, p1g5, p1g1, p1g3}
	byOrderDesc := group.List{p1g3, p1g1, p1g5, p1g4, p1g2}
	byID := group.List{p1g1, p1g2, p1g3, p1g4, p1g5}
	byIDDesc := group.List{p1g5, p1g4, p1g3, p1g2, p1g1}

	type args struct {
		sort       *group.Sort
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		filter      *repo.ProjectFilter
		args        args
		want        group.List // in order
		wantTotal   int64
		wantPage    bool // whether page info is returned
		wantHasNext bool
		wantHasPrev bool
		wantErr     bool
	}{
		{
			name:      "must sort by order by default",
			args:      args{pagination: first(10)},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by order with an empty sort",
			args:      args{sort: &group.Sort{}, pagination: first(10)},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by order",
			args:      args{sort: &group.Sort{Column: group.ColumnOrder, Direction: group.DirectionAsc}, pagination: first(10)},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by order in reverse",
			args:      args{sort: &group.Sort{Column: group.ColumnOrder, Direction: group.DirectionDesc}, pagination: first(10)},
			want:      byOrderDesc,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by creation time",
			args:      args{sort: &group.Sort{Column: group.ColumnCreatedAt, Direction: group.DirectionAsc}, pagination: first(10)},
			want:      byID,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by creation time in reverse",
			args:      args{sort: &group.Sort{Column: group.ColumnCreatedAt, Direction: group.DirectionDesc}, pagination: first(10)},
			want:      byIDDesc,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must sort by order for an unknown column keeping the direction",
			args:      args{sort: &group.Sort{Column: "unknown", Direction: group.DirectionDesc}, pagination: first(10)},
			want:      byOrderDesc,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must find all groups with the default page size",
			args:      args{pagination: usecasex.CursorPagination{}.Wrap()},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:        "must find the first page",
			args:        args{pagination: first(2)},
			want:        group.List{p1g2, p1g4},
			wantTotal:   5,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:        "must find the last page",
			args:        args{pagination: usecasex.CursorPagination{Last: new(int64(2))}.Wrap()},
			want:        group.List{p1g1, p1g3},
			wantTotal:   5,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name: "must find the last page sorted in reverse",
			args: args{
				sort:       &group.Sort{Column: group.ColumnCreatedAt, Direction: group.DirectionDesc},
				pagination: usecasex.CursorPagination{Last: new(int64(2))}.Wrap(),
			},
			want:        group.List{p1g2, p1g1},
			wantTotal:   5,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name:      "must find groups after a cursor breaking order ties by ID",
			args:      args{pagination: usecasex.CursorPagination{After: groupCursor(p1g4), First: new(int64(10))}.Wrap()},
			want:      group.List{p1g5, p1g1, p1g3},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:        "must find a page after a cursor",
			args:        args{pagination: usecasex.CursorPagination{After: groupCursor(p1g2), First: new(int64(2))}.Wrap()},
			want:        group.List{p1g4, p1g5},
			wantTotal:   5,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name: "must find groups after a cursor sorted in reverse",
			args: args{
				sort:       &group.Sort{Column: group.ColumnOrder, Direction: group.DirectionDesc},
				pagination: usecasex.CursorPagination{After: groupCursor(p1g5), First: new(int64(10))}.Wrap(),
			},
			want:      group.List{p1g4, p1g2},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must find groups before a cursor",
			args:      args{pagination: usecasex.CursorPagination{Before: groupCursor(p1g5), Last: new(int64(10))}.Wrap()},
			want:      group.List{p1g2, p1g4},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name: "must find groups before a cursor sorted by creation time in reverse",
			args: args{
				sort:       &group.Sort{Column: group.ColumnCreatedAt, Direction: group.DirectionDesc},
				pagination: usecasex.CursorPagination{Before: groupCursor(p1g3), Last: new(int64(10))}.Wrap(),
			},
			want:      group.List{p1g5, p1g4},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:        "must find a page by offset",
			args:        args{pagination: usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap()},
			want:        group.List{p1g4, p1g5},
			wantTotal:   5,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name: "must find the final page by offset sorted in reverse",
			args: args{
				sort:       &group.Sort{Column: group.ColumnOrder, Direction: group.DirectionDesc},
				pagination: usecasex.OffsetPagination{Offset: 3, Limit: 2}.Wrap(),
			},
			want:      group.List{p1g4, p1g2},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must find nothing beyond the last offset",
			args:      args{pagination: usecasex.OffsetPagination{Offset: 10, Limit: 2}.Wrap()},
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:      "must find groups of a readable project",
			filter:    new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:      args{pagination: first(10)},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:      "must find groups of a writable-only project",
			filter:    new(pjFilter(nil, id.ProjectIDList{p1})),
			args:      args{pagination: first(10)},
			want:      byOrder,
			wantTotal: 5,
			wantPage:  true,
		},
		{
			name:     "must find nothing in an unreadable project",
			filter:   new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:     args{pagination: first(10)},
			wantPage: true,
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
			args:    args{pagination: usecasex.CursorPagination{After: new(usecasex.Cursor(id.NewGroupID().String())), First: new(int64(10))}.Wrap()},
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
			require.NoError(t, r.SaveAll(ctx, seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, pi, err := r.Filter(ctx, p1, tc.args.sort, tc.args.pagination)
			if tc.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				assert.Nil(t, pi)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
			assertGroupPageInfo(t, pi, tc.wantPage, tc.wantTotal, tc.want, tc.wantHasNext, tc.wantHasPrev)
		})
	}
}

func assertGroupPageInfo(t *testing.T, pi *usecasex.PageInfo, wantPage bool, wantTotal int64, want group.List, wantHasNext, wantHasPrev bool) {
	t.Helper()
	if !wantPage {
		assert.Nil(t, pi)
		return
	}
	var wantStart, wantEnd *usecasex.Cursor
	if len(want) > 0 {
		wantStart, wantEnd = groupCursor(want[0]), groupCursor(want[len(want)-1])
	}
	assert.Equal(t, usecasex.NewPageInfo(wantTotal, wantStart, wantEnd, wantHasNext, wantHasPrev), pi)
}

func testGroupFindByProject(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).Order(1).MustBuild()
	p1g2 := newGroup(p1).Order(0).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	seeds := group.List{p1g1, p2g1, p1g2}

	tests := []struct {
		name   string
		seeds  group.List
		filter *repo.ProjectFilter
		args   id.ProjectID
		want   group.List
	}{
		{
			name:  "must find only groups of the project",
			seeds: seeds,
			args:  p1,
			want:  group.List{p1g1, p1g2},
		},
		{
			name:  "must find nothing for an unknown project",
			seeds: seeds,
			args:  id.NewProjectID(),
		},
		{
			name: "must find nothing in an empty repository",
			args: p1,
		},
		{
			name:   "must find groups of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2,
			want:   group.List{p2g1},
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:   "must find groups of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1,
			want:   group.List{p1g1, p1g2},
		},
		{
			name:   "must find nothing in an unreadable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:   p1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByProject(ctx, tc.args)
			assert.NoError(t, err)
			// the order of the result is not specified: mongo does not sort it
			// and callers sort it by order themselves
			assert.Equal(t, tc.want.SortByID(), got.SortByID())
		})
	}
}

func testGroupFindByKey(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).Key(id.NewKey("key-one")).MustBuild()
	p2g1 := newGroup(p2).Key(id.NewKey("key-one")).MustBuild()
	p1g2 := newGroup(p1).Key(id.NewKey("key-two")).MustBuild()
	seeds := group.List{p1g1, p2g1, p1g2}

	type args struct {
		project id.ProjectID
		key     string
	}

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    args
		want    *group.Group
		wantErr error
	}{
		{
			name:  "must find a group by key",
			seeds: seeds,
			args:  args{p1, p1g2.Key().String()},
			want:  p1g2,
		},
		{
			name:  "must find the group of the given project by a shared key",
			seeds: seeds,
			args:  args{p2, p2g1.Key().String()},
			want:  p2g1,
		},
		{
			name:   "must find a group of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:   args{p1, p1g1.Key().String()},
			want:   p1g1,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:   "must find a group of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{p1, p1g1.Key().String()},
			want:   p1g1,
		},
		{
			name:    "must not find a group by key case-insensitively",
			seeds:   seeds,
			args:    args{p1, strings.ToUpper(p1g1.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a group of another project",
			seeds:   seeds,
			args:    args{p2, p1g2.Key().String()},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown key",
			seeds:   seeds,
			args:    args{p1, "key-unknown"},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an invalid key",
			seeds:   seeds,
			args:    args{p1, "invalid key!"},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty key",
			seeds:   seeds,
			args:    args{p1, ""},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must deny finding a group of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, p1g1.Key().String()},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not find anything for an empty key in an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, ""},
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByKey(ctx, tc.args.project, tc.args.key)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testGroupFindByIDOrKey(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).Key(id.NewKey("key-one")).MustBuild()
	p2g1 := newGroup(p2).Key(id.NewKey("key-one")).MustBuild()
	p1g2 := newGroup(p1).Key(id.NewKey("key-two")).MustBuild()
	seeds := group.List{p1g1, p2g1, p1g2}

	type args struct {
		project id.ProjectID
		idOrKey group.IDOrKey
	}

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    args
		want    *group.Group
		wantErr error
	}{
		{
			name:  "must find a group by ID",
			seeds: seeds,
			args:  args{p1, group.IDOrKey(p1g2.ID().String())},
			want:  p1g2,
		},
		{
			name:  "must find a group by key",
			seeds: seeds,
			args:  args{p1, group.IDOrKey(p1g2.Key().String())},
			want:  p1g2,
		},
		{
			name:  "must find the group of the given project by a shared key",
			seeds: seeds,
			args:  args{p2, group.IDOrKey(p2g1.Key().String())},
			want:  p2g1,
		},
		{
			name:   "must find a group of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:   args{p1, group.IDOrKey(p1g1.Key().String())},
			want:   p1g1,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:   "must find a group of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{p1, group.IDOrKey(p1g1.ID().String())},
			want:   p1g1,
		},
		{
			name:    "must not find a group of an unreadable project by ID",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, group.IDOrKey(p1g1.ID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a group of an unreadable project by key",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, group.IDOrKey(p1g1.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a group of another project by ID",
			seeds:   seeds,
			args:    args{p2, group.IDOrKey(p1g1.ID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a group of another project by key",
			seeds:   seeds,
			args:    args{p2, group.IDOrKey(p1g2.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown ID",
			seeds:   seeds,
			args:    args{p1, group.IDOrKey(id.NewGroupID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown key",
			seeds:   seeds,
			args:    args{p1, group.IDOrKey("key-unknown")},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an invalid key",
			seeds:   seeds,
			args:    args{p1, group.IDOrKey("invalid key!")},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty ID or key",
			seeds:   seeds,
			args:    args{p1, group.IDOrKey("")},
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDOrKey(ctx, tc.args.project, tc.args.idOrKey)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testGroupSave(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1 := id.NewProjectID()
	p1g1 := newGroup(p1).Name("before").MustBuild()
	p1g1Updated := group.New().ID(p1g1.ID()).Project(p1).Schema(id.NewSchemaID()).Key(id.NewKey("updated-key")).
		Name("after").Description("description").Order(1).MustBuild()

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    *group.Group
		want    *group.Group // the stored group afterwards
		wantErr error
	}{
		{
			name: "must save a new group",
			args: p1g1,
			want: p1g1,
		},
		{
			name:  "must overwrite an existing group with all its fields",
			seeds: group.List{p1g1},
			args:  p1g1Updated,
			want:  p1g1Updated,
		},
		{
			name:   "must save a group in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1g1,
			want:   p1g1,
		},
		{
			name:    "must not save a group in a readable-only project",
			filter:  new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:    p1g1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a group outside writable projects",
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1g1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a group outside writable projects",
			seeds:   group.List{p1g1},
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1g1Updated,
			want:    p1g1, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a nil group",
			wantErr: rerror.ErrInvalidParams,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
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

func testGroupSaveAll(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).MustBuild()
	p1g2 := newGroup(p1).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	p1g1Updated := group.New().ID(p1g1.ID()).Project(p1).Schema(p1g1.Schema()).Key(p1g1.Key()).
		Name("after").Order(1).MustBuild()
	all := id.GroupIDList{p1g1.ID(), p1g2.ID(), p2g1.ID()}

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    group.List
		want    group.List // the stored groups afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: group.List{},
			want: group.List{},
		},
		{
			name: "must save nothing for a nil list",
			want: group.List{},
		},
		{
			name: "must save groups across projects",
			args: group.List{p1g1, p1g2, p2g1},
			want: group.List{p1g1, p1g2, p2g1},
		},
		{
			name:  "must overwrite existing groups",
			seeds: group.List{p1g1, p1g2},
			args:  group.List{p1g1Updated},
			want:  group.List{p1g1Updated, p1g2},
		},
		{
			name:   "must save groups in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   group.List{p1g1, p1g2},
			want:   group.List{p1g1, p1g2},
		},
		{
			name:    "must not save groups in readable-only projects",
			filter:  new(pjFilter(id.ProjectIDList{p1, p2}, nil)),
			args:    group.List{p1g1, p2g1},
			want:    group.List{},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a list that includes an unwritable project",
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    group.List{p1g1, p2g1},
			want:    group.List{},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a list that includes a nil group",
			args:    group.List{p1g1, nil},
			want:    group.List{},
			wantErr: rerror.ErrInvalidParams,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.SaveAll(ctx, tc.args))

			// the stored state is checked unfiltered
			got, err := base.FindByIDs(ctx, all)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testGroupRemove(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1g1 := newGroup(p1).MustBuild()
	p1g2 := newGroup(p1).MustBuild()
	p2g1 := newGroup(p2).MustBuild()
	seeds := group.List{p1g1, p1g2, p2g1}

	tests := []struct {
		name    string
		seeds   group.List
		filter  *repo.ProjectFilter
		args    id.GroupID
		want    id.GroupIDList // groups that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove a group",
			seeds: seeds,
			args:  p1g1.ID(),
			want:  id.GroupIDList{p1g2.ID(), p2g1.ID()},
		},
		{
			name:    "must not remove an unknown group",
			seeds:   seeds,
			args:    id.NewGroupID(),
			want:    id.GroupIDList{p1g1.ID(), p1g2.ID(), p2g1.ID()},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    p1g1.ID(),
			want:    id.GroupIDList{},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove a group in a writable project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p2})),
			args:   p2g1.ID(),
			want:   id.GroupIDList{p1g1.ID(), p1g2.ID()},
		},
		{
			name:    "must not remove a group in a readable-only project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:    p1g1.ID(),
			want:    id.GroupIDList{p1g1.ID(), p1g2.ID(), p2g1.ID()},
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Remove(ctx, tc.args))

			// remaining groups are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			got, err := base.FindByIDs(ctx, groupIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, tc.want, groupIDs(got))
		})
	}
}

func testGroupIsolation(t *testing.T, newRepo groupFactory) {
	ctx := context.Background()

	tests := []struct {
		name   string
		mutate func(saved, found *group.Group)
	}{
		{
			name:   "must not keep changes made to a saved group",
			mutate: func(saved, _ *group.Group) { saved.SetName("changed") },
		},
		{
			name:   "must not keep changes made to a found group",
			mutate: func(_, found *group.Group) { found.SetOrder(10) },
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saved := newGroup(id.NewProjectID()).Name("original").MustBuild()
			want := saved.Clone()
			require.NoError(t, r.Save(ctx, saved))
			found, err := r.FindByID(ctx, saved.ID())
			require.NoError(t, err)
			assert.Equal(t, want, found)
			assert.NotSame(t, saved, found)

			tc.mutate(saved, found)

			got, err := r.FindByID(ctx, saved.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}
