package test

import (
	"context"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type modelFactory = func(t *testing.T) repo.Model

func TestModelRepo(t *testing.T, newRepo modelFactory) {
	t.Run("Filtered", func(t *testing.T) { testModelFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testModelFindByID(t, newRepo) })
	t.Run("FindBySchema", func(t *testing.T) { testModelFindBySchema(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testModelFindByIDs(t, newRepo) })
	t.Run("FindByProject", func(t *testing.T) { testModelFindByProject(t, newRepo) })
	t.Run("FindByProjectAndKeyword", func(t *testing.T) { testModelFindByProjectAndKeyword(t, newRepo) })
	t.Run("FindByKey", func(t *testing.T) { testModelFindByKey(t, newRepo) })
	t.Run("FindByIDOrKey", func(t *testing.T) { testModelFindByIDOrKey(t, newRepo) })
	t.Run("CountByProject", func(t *testing.T) { testModelCountByProject(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testModelSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testModelSaveAll(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testModelRemove(t, newRepo) })
}

func newModel(pid id.ProjectID) *model.Builder {
	return model.New().NewID().Project(pid).Schema(id.NewSchemaID()).RandomKey().
		UpdatedAt(util.Now().Truncate(time.Millisecond).UTC())
}

// newOrderedModels builds n models of the project whose IDs ascend with
// their index.
func newOrderedModels(pid id.ProjectID, n int) []*model.Builder {
	ids := make(id.ModelIDList, n)
	for i := range ids {
		ids[i] = id.NewModelID()
		time.Sleep(10 * time.Millisecond) // ensure IDs are unique and ascending
	}
	slices.SortFunc(ids, func(a, b id.ModelID) int { return a.Compare(b) })
	return lo.Map(ids, func(mid id.ModelID, _ int) *model.Builder { return newModel(pid).ID(mid) })
}

func modelIDs(l model.List) id.ModelIDList {
	return lo.Map(l, func(m *model.Model, _ int) id.ModelID { return m.ID() })
}

func modelCursor(m *model.Model) *usecasex.Cursor {
	return new(usecasex.Cursor(m.ID().String()))
}

func testModelFiltered(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2, p3 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	p3m1 := newModel(p3).MustBuild()
	seeds := model.List{p1m1, p2m1, p3m1}

	tests := []struct {
		name      string
		filter    func(r repo.Model) repo.Model
		wantRead  model.List
		wantWrite id.ProjectIDList // projects Save must accept
		wantDeny  id.ProjectIDList // projects Save must reject
	}{
		{
			name: "must merge readable projects of chained filters",
			filter: func(r repo.Model) repo.Model {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, nil)).Filtered(pjFilter(id.ProjectIDList{p2}, nil))
			},
			wantRead: model.List{p1m1, p2m1},
			wantDeny: id.ProjectIDList{p1, p2, p3},
		},
		{
			name: "must merge writable projects of chained filters",
			filter: func(r repo.Model) repo.Model {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})).
					Filtered(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2}))
			},
			wantRead:  model.List{p1m1, p2m1},
			wantWrite: id.ProjectIDList{p1, p2},
			wantDeny:  id.ProjectIDList{p3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.Model) repo.Model {
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

			got, err := r.FindByIDs(ctx, modelIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, modelIDs(tc.wantRead), modelIDs(got))

			for _, p := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newModel(p).MustBuild()))
			}
			for _, p := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newModel(p).MustBuild()))
			}

			// filtering must not change the base repository
			all, err := base.FindByIDs(ctx, modelIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, seeds, all)
		})
	}
}

func testModelFindByID(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).Name("name").Description("description").Key(id.NewKey("full-model")).
		Metadata(id.NewSchemaID().Ref()).Order(3).PostingEnabled(true).MustBuild()
	p1m2 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	seeds := model.List{p1m1, p1m2, p2m1}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    *model.Model
		wantErr error
	}{
		{
			name:  "must find a model with all its fields",
			seeds: seeds,
			args:  p1m1.ID(),
			want:  p1m1,
		},
		{
			name:  "must find a model with default fields",
			seeds: seeds,
			args:  p1m2.ID(),
			want:  p1m2,
		},
		{
			name:   "must find a model of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2m1.ID(),
			want:   p2m1,
		},
		{
			name:    "must not find an unknown model",
			seeds:   seeds,
			args:    id.NewModelID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any model in an empty repository",
			args:    p1m1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    p1m1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			// reads are scoped by the readable list alone, even though
			// ProjectFilter.CanRead treats writable projects as readable
			name:    "must not find a model of a writable-only project",
			seeds:   seeds,
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    p1m1.ID(),
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

func testModelFindBySchema(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).Metadata(id.NewSchemaID().Ref()).MustBuild()
	p1m2 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	seeds := model.List{p1m1, p1m2, p2m1}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    id.SchemaID
		want    *model.Model
		wantErr error
	}{
		{
			name:  "must find a model by its schema",
			seeds: seeds,
			args:  p1m2.Schema(),
			want:  p1m2,
		},
		{
			name:  "must find a model by its metadata schema",
			seeds: seeds,
			args:  *p1m1.Metadata(),
			want:  p1m1,
		},
		{
			name:   "must find a model of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2m1.Schema(),
			want:   p2m1,
		},
		{
			name:    "must not find a model for an unknown schema",
			seeds:   seeds,
			args:    id.NewSchemaID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any model in an empty repository",
			args:    p1m1.Schema(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    *p1m1.Metadata(),
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

			got, err := r.FindBySchema(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testModelFindByIDs(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).MustBuild()
	p1m2 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	seeds := model.List{p1m1, p1m2, p2m1}

	tests := []struct {
		name   string
		seeds  model.List
		filter *repo.ProjectFilter
		args   id.ModelIDList
		want   model.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.ModelIDList{},
		},
		{
			name: "must find nothing for an unknown ID in an empty repository",
			args: id.ModelIDList{id.NewModelID()},
			want: model.List{},
		},
		{
			name:  "must find models across projects",
			seeds: seeds,
			args:  id.ModelIDList{p1m1.ID(), p1m2.ID(), p2m1.ID()},
			want:  model.List{p1m1, p1m2, p2m1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.ModelIDList{p2m1.ID(), p1m2.ID(), p1m1.ID()},
			want:  model.List{p2m1, p1m2, p1m1},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.ModelIDList{id.NewModelID(), p1m2.ID()},
			want:  model.List{p1m2},
		},
		{
			name:   "must skip models of unreadable projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})),
			args:   id.ModelIDList{p2m1.ID(), p1m1.ID()},
			want:   model.List{p1m1},
		},
		{
			name:   "must find an empty list with no readable projects",
			seeds:  seeds,
			filter: new(pjFilter(nil, nil)),
			args:   id.ModelIDList{p1m1.ID(), p2m1.ID()},
			want:   model.List{},
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

func testModelFindByProject(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	// IDs ascend from p1m1 to p1m4 while orders descend, so the result is
	// proven to be sorted by ID
	bs := newOrderedModels(p1, 4)
	ms := lo.Map(bs, func(b *model.Builder, i int) *model.Model { return b.Order(len(bs) - i).MustBuild() })
	p1m1, p1m2, p1m3, p1m4 := ms[0], ms[1], ms[2], ms[3]
	// a model of another project is excluded from the results and the count
	seeds := append(model.List{newModel(p2).MustBuild()}, ms...)

	tests := []struct {
		name        string
		filter      *repo.ProjectFilter
		args        *usecasex.Pagination
		want        model.List // in order
		wantTotal   int64
		wantPage    bool // whether page info is returned
		wantHasNext bool
		wantHasPrev bool
		wantErr     bool
	}{
		{
			name:        "must find the first page in ID order",
			args:        first(2),
			want:        model.List{p1m1, p1m2},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find all models when the page is larger",
			args:      first(10),
			want:      model.List{p1m1, p1m2, p1m3, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must find all models with the default page size",
			args:      usecasex.CursorPagination{}.Wrap(),
			want:      model.List{p1m1, p1m2, p1m3, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:        "must find the last page",
			args:        usecasex.CursorPagination{Last: new(int64(2))}.Wrap(),
			want:        model.List{p1m3, p1m4},
			wantTotal:   4,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name:        "must find a page after a cursor",
			args:        usecasex.CursorPagination{After: modelCursor(p1m1), First: new(int64(2))}.Wrap(),
			want:        model.List{p1m2, p1m3},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find models before a cursor",
			args:      usecasex.CursorPagination{Before: modelCursor(p1m3), Last: new(int64(10))}.Wrap(),
			want:      model.List{p1m1, p1m2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:        "must find a page by offset",
			args:        usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap(),
			want:        model.List{p1m2, p1m3},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find nothing beyond the last offset",
			args:      usecasex.OffsetPagination{Offset: 10, Limit: 2}.Wrap(),
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must find models of a readable project",
			filter:    new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:      first(10),
			want:      model.List{p1m1, p1m2, p1m3, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:      "must find models of a writable-only project",
			filter:    new(pjFilter(nil, id.ProjectIDList{p1})),
			args:      first(10),
			want:      model.List{p1m1, p1m2, p1m3, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:     "must find nothing in an unreadable project",
			filter:   new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:     first(10),
			wantPage: true,
		},
		{
			name: "must find nothing without pagination",
		},
		{
			name:    "must fail with a negative offset",
			args:    usecasex.OffsetPagination{Offset: -1, Limit: 2}.Wrap(),
			wantErr: true,
		},
		{
			name:    "must fail with an unknown cursor",
			args:    usecasex.CursorPagination{After: new(usecasex.Cursor(id.NewModelID().String())), First: new(int64(10))}.Wrap(),
			wantErr: true,
		},
		{
			name:    "must fail with a malformed cursor",
			args:    usecasex.CursorPagination{After: new(usecasex.Cursor("malformed")), First: new(int64(10))}.Wrap(),
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

			got, pi, err := r.FindByProject(ctx, p1, tc.args)
			if tc.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				assert.Nil(t, pi)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
			assertModelPageInfo(t, pi, tc.wantPage, tc.wantTotal, tc.want, tc.wantHasNext, tc.wantHasPrev)
		})
	}
}

func testModelFindByProjectAndKeyword(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	now := time.Now().Truncate(time.Millisecond).UTC()

	// IDs ascend from p1m1 to p1m4; every other sortable field orders them differently
	bs := newOrderedModels(p1, 4)
	p1m1 := bs[0].Name("Alpha").Key(id.NewKey("key-c")).Order(2).UpdatedAt(now.Add(1 * time.Hour)).MustBuild()
	p1m2 := bs[1].Name("beta (v1.0)").Key(id.NewKey("key-a")).Order(0).UpdatedAt(now.Add(3 * time.Hour)).MustBuild()
	p1m3 := bs[2].Name("Gamma alpha").Key(id.NewKey("key-d")).Order(3).UpdatedAt(now.Add(2 * time.Hour)).MustBuild()
	p1m4 := bs[3].Name("delta").Key(id.NewKey("key-b")).Order(1).UpdatedAt(now.Add(4 * time.Hour)).MustBuild()
	// a model of another project is excluded from the results and the count
	p2m1 := newModel(p2).Name("alpha").MustBuild()
	seeds := model.List{p1m1, p1m2, p1m3, p1m4, p2m1}

	type args struct {
		keyword    *string
		sort       *usecasex.Sort
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		filter      *repo.ProjectFilter
		args        args
		want        model.List // in order
		wantTotal   int64
		wantPage    bool // whether page info is returned
		wantHasNext bool
		wantHasPrev bool
	}{
		{
			name:      "must sort by order in reverse by default",
			args:      args{pagination: first(10)},
			want:      model.List{p1m3, p1m1, p1m4, p1m2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by creation time",
			args:      args{sort: &usecasex.Sort{Key: "CREATED_AT"}, pagination: first(10)},
			want:      model.List{p1m1, p1m2, p1m3, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by creation time in reverse",
			args:      args{sort: &usecasex.Sort{Key: "createdAt", Reverted: true}, pagination: first(10)},
			want:      model.List{p1m4, p1m3, p1m2, p1m1},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by update time",
			args:      args{sort: &usecasex.Sort{Key: "UPDATED_AT"}, pagination: first(10)},
			want:      model.List{p1m1, p1m3, p1m2, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by name case-sensitively",
			args:      args{sort: &usecasex.Sort{Key: " Name "}, pagination: first(10)},
			want:      model.List{p1m1, p1m3, p1m2, p1m4},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must sort by key",
			args:      args{sort: &usecasex.Sort{Key: "key"}, pagination: first(10)},
			want:      model.List{p1m2, p1m4, p1m1, p1m3},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			// unlike the default sort, the direction of the given sort is kept
			name:      "must sort by order for an unknown key",
			args:      args{sort: &usecasex.Sort{Key: "unknown"}, pagination: first(10)},
			want:      model.List{p1m2, p1m4, p1m1, p1m3},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must find all models with an empty keyword",
			args:      args{keyword: new(""), pagination: first(10)},
			want:      model.List{p1m3, p1m1, p1m4, p1m2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:      "must find models by keyword in the name case-insensitively",
			args:      args{keyword: new("ALPHA"), pagination: first(10)},
			want:      model.List{p1m3, p1m1},
			wantTotal: 2,
			wantPage:  true,
		},
		{
			name:      "must match regular expression characters in the keyword literally",
			args:      args{keyword: new("(v1.0)"), pagination: first(10)},
			want:      model.List{p1m2},
			wantTotal: 1,
			wantPage:  true,
		},
		{
			name:     "must not treat the keyword as a regular expression",
			args:     args{keyword: new("b.ta"), pagination: first(10)},
			wantPage: true,
		},
		{
			name:     "must not find models by keyword in the key",
			args:     args{keyword: new("key-a"), pagination: first(10)},
			wantPage: true,
		},
		{
			name:        "must find the first page sorted by order in reverse",
			args:        args{pagination: first(2)},
			want:        model.List{p1m3, p1m1},
			wantTotal:   4,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find models after a cursor sorted by order in reverse",
			args:      args{pagination: usecasex.CursorPagination{After: modelCursor(p1m1), First: new(int64(10))}.Wrap()},
			want:      model.List{p1m4, p1m2},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name:        "must find the last page sorted by order in reverse",
			args:        args{pagination: usecasex.CursorPagination{Last: new(int64(1))}.Wrap()},
			want:        model.List{p1m2},
			wantTotal:   4,
			wantPage:    true,
			wantHasPrev: true,
		},
		{
			name: "must find models before a cursor sorted by update time",
			args: args{
				sort:       &usecasex.Sort{Key: "updatedAt"},
				pagination: usecasex.CursorPagination{Before: modelCursor(p1m2), Last: new(int64(10))}.Wrap(),
			},
			want:      model.List{p1m1, p1m3},
			wantTotal: 4,
			wantPage:  true,
		},
		{
			name: "must find a page by offset matching a keyword",
			args: args{
				keyword:    new("l"),
				pagination: usecasex.OffsetPagination{Offset: 1, Limit: 1}.Wrap(),
			},
			want:        model.List{p1m1},
			wantTotal:   3,
			wantPage:    true,
			wantHasNext: true,
		},
		{
			name:      "must find models of a readable project",
			filter:    new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:      args{keyword: new("alpha"), pagination: first(10)},
			want:      model.List{p1m3, p1m1},
			wantTotal: 2,
			wantPage:  true,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:      "must find models of a writable-only project",
			filter:    new(pjFilter(nil, id.ProjectIDList{p1})),
			args:      args{keyword: new("alpha"), pagination: first(10)},
			want:      model.List{p1m3, p1m1},
			wantTotal: 2,
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
			args: args{keyword: new("alpha")},
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

			got, pi, err := r.FindByProjectAndKeyword(ctx, p1, tc.args.keyword, tc.args.sort, tc.args.pagination)
			assert.NoError(t, err)
			assert.Equal(t, modelIDs(tc.want), modelIDs(got))
			assertModelPageInfo(t, pi, tc.wantPage, tc.wantTotal, tc.want, tc.wantHasNext, tc.wantHasPrev)
		})
	}
}

func assertModelPageInfo(t *testing.T, pi *usecasex.PageInfo, wantPage bool, wantTotal int64, want model.List, wantHasNext, wantHasPrev bool) {
	t.Helper()
	if !wantPage {
		assert.Nil(t, pi)
		return
	}
	if !assert.NotNil(t, pi) {
		return
	}
	var wantStart, wantEnd *usecasex.Cursor
	if len(want) > 0 {
		wantStart, wantEnd = modelCursor(want[0]), modelCursor(want[len(want)-1])
	}
	assert.Equal(t, usecasex.NewPageInfo(wantTotal, wantStart, wantEnd, wantHasNext, wantHasPrev), pi)
}

func testModelFindByKey(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).Key(id.NewKey("key-one")).MustBuild()
	p2m1 := newModel(p2).Key(id.NewKey("key-one")).MustBuild()
	p1m2 := newModel(p1).Key(id.NewKey("key-two")).MustBuild()
	seeds := model.List{p1m1, p2m1, p1m2}

	type args struct {
		project id.ProjectID
		key     string
	}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    args
		want    *model.Model
		wantErr error
	}{
		{
			name:  "must find a model by key",
			seeds: seeds,
			args:  args{p1, p1m2.Key().String()},
			want:  p1m2,
		},
		{
			name:  "must find the model of the given project by a shared key",
			seeds: seeds,
			args:  args{p2, p2m1.Key().String()},
			want:  p2m1,
		},
		{
			name:   "must find a model of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:   args{p1, p1m1.Key().String()},
			want:   p1m1,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:   "must find a model of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{p1, p1m1.Key().String()},
			want:   p1m1,
		},
		{
			name:    "must not find a model by key case-insensitively",
			seeds:   seeds,
			args:    args{p1, strings.ToUpper(p1m1.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of another project",
			seeds:   seeds,
			args:    args{p2, p1m2.Key().String()},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown key",
			seeds:   seeds,
			args:    args{p1, "key-unknown"},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty key",
			seeds:   seeds,
			args:    args{p1, ""},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must deny finding a model of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, p1m1.Key().String()},
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

func testModelFindByIDOrKey(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).Key(id.NewKey("key-one")).MustBuild()
	p2m1 := newModel(p2).Key(id.NewKey("key-one")).MustBuild()
	p1m2 := newModel(p1).Key(id.NewKey("key-two")).MustBuild()
	seeds := model.List{p1m1, p2m1, p1m2}

	type args struct {
		project id.ProjectID
		idOrKey model.IDOrKey
	}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    args
		want    *model.Model
		wantErr error
	}{
		{
			name:  "must find a model by ID",
			seeds: seeds,
			args:  args{p1, model.IDOrKey(p1m2.ID().String())},
			want:  p1m2,
		},
		{
			name:  "must find a model by key",
			seeds: seeds,
			args:  args{p1, model.IDOrKey(p1m2.Key().String())},
			want:  p1m2,
		},
		{
			name:  "must find the model of the given project by a shared key",
			seeds: seeds,
			args:  args{p2, model.IDOrKey(p2m1.Key().String())},
			want:  p2m1,
		},
		{
			name:   "must find a model of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:   args{p1, model.IDOrKey(p1m1.Key().String())},
			want:   p1m1,
		},
		{
			// unlike the ID-keyed reads, reads by project are gated by
			// ProjectFilter.CanRead alone, which treats writable projects as readable
			name:   "must find a model of a writable-only project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   args{p1, model.IDOrKey(p1m1.ID().String())},
			want:   p1m1,
		},
		{
			name:    "must not find a model of an unreadable project by ID",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, model.IDOrKey(p1m1.ID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of an unreadable project by key",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:    args{p1, model.IDOrKey(p1m1.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of another project by ID",
			seeds:   seeds,
			args:    args{p2, model.IDOrKey(p1m1.ID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a model of another project by key",
			seeds:   seeds,
			args:    args{p2, model.IDOrKey(p1m2.Key().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown ID",
			seeds:   seeds,
			args:    args{p1, model.IDOrKey(id.NewModelID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown key",
			seeds:   seeds,
			args:    args{p1, model.IDOrKey("key-unknown")},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty ID or key",
			seeds:   seeds,
			args:    args{p1, model.IDOrKey("")},
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

func testModelCountByProject(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	seeds := model.List{newModel(p1).MustBuild(), newModel(p1).MustBuild(), newModel(p2).MustBuild()}

	tests := []struct {
		name   string
		seeds  model.List
		filter *repo.ProjectFilter
		args   id.ProjectID
		want   int
	}{
		{
			name: "must count nothing in an empty repository",
			args: p1,
			want: 0,
		},
		{
			name:  "must count only models of the project",
			seeds: seeds,
			args:  p1,
			want:  2,
		},
		{
			name:  "must count nothing for an unknown project",
			seeds: seeds,
			args:  id.NewProjectID(),
			want:  0,
		},
		{
			name:   "must count models of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2})),
			args:   p2,
			want:   1,
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

			got, err := r.CountByProject(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testModelSave(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1 := id.NewProjectID()
	p1m1 := newModel(p1).Name("before").MustBuild()
	p1m1Updated := model.New().ID(p1m1.ID()).Project(p1).Schema(p1m1.Schema()).Key(p1m1.Key()).
		Name("after").Metadata(id.NewSchemaID().Ref()).Order(1).
		UpdatedAt(p1m1.UpdatedAt().Add(time.Hour)).MustBuild()

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    *model.Model
		want    *model.Model // the stored model afterwards
		wantErr error
	}{
		{
			name: "must save a new model",
			args: p1m1,
			want: p1m1,
		},
		{
			name:  "must overwrite an existing model",
			seeds: model.List{p1m1},
			args:  p1m1Updated,
			want:  p1m1Updated,
		},
		{
			name:   "must save a model in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1m1,
			want:   p1m1,
		},
		{
			name:    "must not save a model in a readable-only project",
			filter:  new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:    p1m1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a model outside writable projects",
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1m1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a model outside writable projects",
			seeds:   model.List{p1m1},
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1m1Updated,
			want:    p1m1, // unchanged
			wantErr: repo.ErrOperationDenied,
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

func testModelSaveAll(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).MustBuild()
	p1m2 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	p1m1Updated := model.New().ID(p1m1.ID()).Project(p1).Schema(p1m1.Schema()).Key(p1m1.Key()).
		Name("after").Order(1).UpdatedAt(p1m1.UpdatedAt()).MustBuild()
	all := id.ModelIDList{p1m1.ID(), p1m2.ID(), p2m1.ID()}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    model.List
		want    model.List // the stored models afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: model.List{},
			want: model.List{},
		},
		{
			name: "must save models across projects",
			args: model.List{p1m1, p1m2, p2m1},
			want: model.List{p1m1, p1m2, p2m1},
		},
		{
			name:  "must overwrite existing models",
			seeds: model.List{p1m1, p1m2},
			args:  model.List{p1m1Updated},
			want:  model.List{p1m1Updated, p1m2},
		},
		{
			name:   "must save models in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   model.List{p1m1, p1m2},
			want:   model.List{p1m1, p1m2},
		},
		{
			name:    "must not save models outside writable projects",
			filter:  new(pjFilter(id.ProjectIDList{p1, p2}, nil)),
			args:    model.List{p1m1, p2m1},
			want:    model.List{},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a list that includes an unwritable project",
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    model.List{p1m1, p2m1},
			want:    model.List{},
			wantErr: repo.ErrOperationDenied,
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

func testModelRemove(t *testing.T, newRepo modelFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	p1m1 := newModel(p1).MustBuild()
	p1m2 := newModel(p1).MustBuild()
	p2m1 := newModel(p2).MustBuild()
	seeds := model.List{p1m1, p1m2, p2m1}

	tests := []struct {
		name    string
		seeds   model.List
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    id.ModelIDList // models that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove a model",
			seeds: seeds,
			args:  p1m1.ID(),
			want:  id.ModelIDList{p1m2.ID(), p2m1.ID()},
		},
		{
			name:    "must not remove an unknown model",
			seeds:   seeds,
			args:    id.NewModelID(),
			want:    id.ModelIDList{p1m1.ID(), p1m2.ID(), p2m1.ID()},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    p1m1.ID(),
			want:    id.ModelIDList{},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove a model in a writable project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p2})),
			args:   p2m1.ID(),
			want:   id.ModelIDList{p1m1.ID(), p1m2.ID()},
		},
		{
			name:    "must not remove a model in a readable-only project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p2})),
			args:    p1m1.ID(),
			want:    id.ModelIDList{p1m1.ID(), p1m2.ID(), p2m1.ID()},
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

			// remaining models are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			got, err := base.FindByIDs(ctx, modelIDs(seeds))
			assert.NoError(t, err)
			assert.Equal(t, tc.want, modelIDs(got))
		})
	}
}
