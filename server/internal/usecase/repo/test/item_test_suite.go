// Package test provides interface-level test suites that both the mongo and
// memory repository implementations run via thin entry-point tests. Suites
// depend only on the repo interfaces; backend-specific behavior is tested in
// the respective infrastructure packages.
package test

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// itemFactory returns a fresh, empty, unfiltered repository for each call.
type itemFactory = func(t *testing.T) repo.Item

// TestItemRepo runs the interface contract tests for repo.Item against the
// implementation produced by newRepo.
func TestItemRepo(t *testing.T, newRepo itemFactory) {
	t.Run("FindByID", func(t *testing.T) { testItemFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testItemFindByIDs(t, newRepo) })
	t.Run("FindAllVersionsByID", func(t *testing.T) { testItemFindAllVersionsByID(t, newRepo) })
	t.Run("FindAllVersionsByIDs", func(t *testing.T) { testItemFindAllVersionsByIDs(t, newRepo) })
	t.Run("FindBySchema", func(t *testing.T) { testItemFindBySchema(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testItemSave(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testItemRemove(t, newRepo) })
	t.Run("BatchRemove", func(t *testing.T) { testItemBatchRemove(t, newRepo) })
	t.Run("Archive", func(t *testing.T) { testItemArchive(t, newRepo) })
	t.Run("Search", func(t *testing.T) { testItemSearch(t, newRepo) })
	t.Run("FindByModelAndValue", func(t *testing.T) { testItemFindByModelAndValue(t, newRepo) })
	t.Run("UpdateRef", func(t *testing.T) { testItemUpdateRef(t, newRepo) })
	t.Run("FindByAssets", func(t *testing.T) { testItemFindByAssets(t, newRepo) })
	t.Run("CountByModel", func(t *testing.T) { testItemCountByModel(t, newRepo) })
	t.Run("FindByModel", func(t *testing.T) { testItemFindByModel(t, newRepo) })
	t.Run("LastModifiedByModel", func(t *testing.T) { testItemLastModifiedByModel(t, newRepo) })
	t.Run("FindVersionByID", func(t *testing.T) { testItemFindVersionByID(t, newRepo) })
	t.Run("RemoveByModel", func(t *testing.T) { testItemRemoveByModel(t, newRepo) })
}

func newItem(pid id.ProjectID, sid id.SchemaID, mid id.ModelID, fields ...*item.Field) *item.Item {
	ts := time.Now().Truncate(time.Millisecond).UTC()
	return item.New().NewID().Fields(fields).Schema(sid).Model(mid).
		Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts).MustBuild()
}

func boolField() *item.Field {
	return item.NewField(schema.NewFieldID(), value.TypeBool.Value(true).AsMultiple(), nil)
}

func rwFilter(pids ...id.ProjectID) *repo.ProjectFilter {
	if pids == nil {
		pids = []id.ProjectID{}
	}
	return &repo.ProjectFilter{Readable: pids, Writable: pids}
}

var mockNowMu sync.Mutex

func saveAt(t *testing.T, r repo.Item, it *item.Item, now time.Time) {
	t.Helper()
	mockNowMu.Lock()
	defer mockNowMu.Unlock()
	defer util.MockNow(now)()
	require.NoError(t, r.Save(context.Background(), it))
}

func testItemFindByID(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	i1 := newItem(id.NewProjectID(), id.NewSchemaID(), id.NewModelID(), boolField())

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ItemID
		want    *item.Item
		wantErr error
	}{
		{
			name:  "must find a item",
			seeds: item.List{i1},
			args:  i1.ID(),
			want:  i1,
		},
		{
			name:    "must not find any item",
			seeds:   item.List{i1},
			args:    id.NewItemID(),
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

			got, err := r.FindByID(ctx, tc.args, nil)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got.Value())
		})
	}
}

func testItemFindByIDs(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, sid := id.NewProjectID(), id.NewSchemaID()
	i1 := newItem(pid, sid, id.NewModelID(), boolField())
	i2 := newItem(pid, sid, id.NewModelID(), boolField())
	seeds := item.List{i1, i2}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ItemIDList
		want    item.List
		wantErr error
	}{
		{
			name:  "must find two items",
			seeds: seeds,
			args:  id.ItemIDList{i1.ID(), i2.ID()},
			want:  item.List{i1, i2},
		},
		{
			name:  "must find one of two items",
			seeds: seeds,
			args:  id.ItemIDList{i1.ID()},
			want:  item.List{i1},
		},
		{
			name:  "must not find any item",
			seeds: seeds,
			args:  id.ItemIDList{id.NewItemID()},
			want:  item.List{},
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

			got, err := r.FindByIDs(ctx, tc.args, nil)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.Unwrap())
		})
	}
}

func testItemFindAllVersionsByID(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	nows := []time.Time{now1, now2}
	ts1 := now1.Truncate(time.Millisecond)
	ts2 := ts1.Add(time.Second)

	iid := id.NewItemID()
	fs := []*item.Field{boolField()}
	i1 := item.New().ID(iid).Fields(fs).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Timestamp(ts1).MustBuild()
	i2 := item.New().ID(iid).Fields(fs).Schema(i1.Schema()).Model(id.NewModelID()).Project(i1.Project()).Thread(id.NewThreadID().Ref()).Timestamp(ts2).MustBuild()

	// want takes the query result because version IDs are generated at save
	// time and cannot be precomputed in the table.
	tests := []struct {
		name    string
		seeds   item.List // saved one at a time as consecutive versions, at nows[i]
		filter  *repo.ProjectFilter
		args    id.ItemID
		want    func(t *testing.T, got item.VersionedList)
		wantErr error
	}{
		{
			name:  "must find one version tagged latest",
			seeds: item.List{i1},
			args:  iid,
			want: func(t *testing.T, got item.VersionedList) {
				require.Len(t, got, 1)
				assert.Equal(t, item.VersionedList{
					version.NewValue(got[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
				}, got)
			},
		},
		{
			name:  "must find two versions chained by parent with latest moved",
			seeds: item.List{i1, i2},
			args:  iid,
			want: func(t *testing.T, got item.VersionedList) {
				require.Len(t, got, 2)
				assert.Equal(t, item.VersionedList{
					version.NewValue(got[0].Version(), nil, nil, now1, i1),
					version.NewValue(got[1].Version(), version.NewVersions(got[0].Version()), version.NewRefs(version.Latest), now2, i2),
				}, got)
			},
		},
		{
			name:   "must not find versions of unreadable projects",
			seeds:  item.List{i1, i2},
			filter: rwFilter(id.NewProjectID()),
			args:   iid,
			want: func(t *testing.T, got item.VersionedList) {
				assert.Empty(t, got)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for i, s := range tc.seeds {
				saveAt(t, r, s, nows[i])
			}
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindAllVersionsByID(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			tc.want(t, got)
		})
	}
}

func testItemFindAllVersionsByIDs(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	nows := []time.Time{now1, now2}
	ts1 := now1.Truncate(time.Millisecond)
	ts2 := ts1.Add(time.Second)

	iid1 := id.NewItemID()
	iid2 := id.NewItemID()
	pid := id.NewProjectID()
	fs := []*item.Field{boolField()}
	i1 := item.New().ID(iid1).Fields(fs).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts1).MustBuild()
	i2 := item.New().ID(iid2).Fields(fs).Schema(i1.Schema()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts2).MustBuild()

	// want takes the query result because version IDs are generated at save
	// time and cannot be precomputed in the table.
	tests := []struct {
		name    string
		seeds   item.List // saved one at a time, at nows[i]
		filter  *repo.ProjectFilter
		args    id.ItemIDList
		want    func(t *testing.T, got item.VersionedList)
		wantErr error
	}{
		{
			name:  "must find all versions of one item",
			seeds: item.List{i1},
			args:  id.ItemIDList{iid1},
			want: func(t *testing.T, got item.VersionedList) {
				require.Len(t, got, 1)
				assert.Equal(t, item.VersionedList{
					version.NewValue(got[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
				}, got)
			},
		},
		{
			name:  "must find all versions of two items",
			seeds: item.List{i1, i2},
			args:  id.ItemIDList{iid1, iid2},
			want: func(t *testing.T, got item.VersionedList) {
				require.Len(t, got, 2)
				assert.Equal(t, item.VersionedList{
					version.NewValue(got[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
					version.NewValue(got[1].Version(), nil, version.NewRefs(version.Latest), now2, i2),
				}, got)
			},
		},
		{
			name:   "must not find versions of unreadable projects",
			seeds:  item.List{i1, i2},
			filter: rwFilter(id.NewProjectID()),
			args:   id.ItemIDList{iid1, iid2},
			want: func(t *testing.T, got item.VersionedList) {
				assert.Empty(t, got)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for i, s := range tc.seeds {
				saveAt(t, r, s, nows[i])
			}
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindAllVersionsByIDs(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			tc.want(t, got)
		})
	}
}

func testItemFindBySchema(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	i1 := newItem(pid, sid, id.NewModelID(), boolField())
	i2 := newItem(pid, sid, id.NewModelID(), boolField())
	i3 := newItem(id.NewProjectID(), sid, id.NewModelID(), boolField())
	i4 := newItem(pid, id.NewSchemaID(), id.NewModelID(), boolField())

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.SchemaID
		want    item.List
		wantErr error
	}{
		{
			name:   "must find two items (first 10)",
			seeds:  item.List{i1, i2, i3},
			filter: rwFilter(pid),
			args:   sid,
			want:   item.List{i1, i2},
		},
		{
			name:   "must not find any item",
			seeds:  item.List{i4},
			filter: rwFilter(pid),
			args:   sid,
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

			got, _, err := r.FindBySchema(ctx, tc.args, nil, nil, usecasex.CursorPagination{First: new(int64(10))}.Wrap())
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.Unwrap())
		})
	}
}

func testItemSave(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	i1 := newItem(id.NewProjectID(), id.NewSchemaID(), id.NewModelID())

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    *item.Item
		want    *item.Item
		wantErr error
	}{
		{
			name:   "must save an item in a writable project",
			filter: rwFilter(i1.Project()),
			args:   i1,
			want:   i1,
		},
		{
			name:    "must not save an item outside writable projects",
			filter:  rwFilter(id.NewProjectID()),
			args:    i1,
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

			err := r.Save(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				// the denied item must not be persisted
				got, err := base.FindByID(ctx, tc.args.ID(), nil)
				assert.Nil(t, got)
				assert.Equal(t, rerror.ErrNotFound, err)
				return
			}

			assert.NoError(t, err)
			got, err := r.FindByID(ctx, tc.args.ID(), nil)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got.Value())
		})
	}
}

func testItemRemove(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2, i3}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ItemID
		want    id.ItemIDList // items that must remain after the call
		wantErr error
		// a denied removal's return value is backend-defined
		// (memory: ErrOperationDenied, mongo: no-op), so the error is
		// not asserted when this is true
		errBackendDefined bool
	}{
		{
			name:   "must remove an item in a writable project",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   i1.ID(),
			want:   id.ItemIDList{i2.ID(), i3.ID()},
		},
		{
			name:              "must not remove an item outside writable projects",
			seeds:             seeds,
			filter:            rwFilter(pid),
			args:              i3.ID(),
			want:              id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
			errBackendDefined: true,
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

			err := r.Remove(ctx, tc.args)
			if !tc.errBackendDefined {
				if tc.wantErr != nil {
					assert.Equal(t, tc.wantErr, err)
					return
				}
				assert.NoError(t, err)
			}

			// remaining items are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			for _, keptID := range tc.want {
				got, err := base.FindByID(ctx, keptID, nil)
				assert.NoError(t, err)
				assert.Equal(t, keptID, got.Value().ID())
			}
			if !tc.want.Has(tc.args) {
				got, err := base.FindByID(ctx, tc.args, nil)
				assert.Nil(t, got)
				assert.Equal(t, rerror.ErrNotFound, err)
			}
		})
	}
}

func testItemBatchRemove(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2, i3, i4}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ItemIDList
		want    id.ItemIDList // items that must remain after the call
		wantErr error
		// a denied removal's return value is backend-defined
		// (memory: ErrOperationDenied, mongo: no-op), so the error is
		// not asserted when this is true
		errBackendDefined bool
	}{
		{
			name:   "must remove multiple items",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   id.ItemIDList{i1.ID(), i2.ID()},
			want:   id.ItemIDList{i3.ID(), i4.ID()},
		},
		{
			name:   "must remove all items in writable projects",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
			want:   id.ItemIDList{i4.ID()},
		},
		{
			name:   "must remove nothing for an empty list",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   id.ItemIDList{},
			want:   id.ItemIDList{i1.ID(), i2.ID(), i3.ID(), i4.ID()},
		},
		{
			name:   "must remove nothing for non-existent items",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   id.ItemIDList{id.NewItemID()},
			want:   id.ItemIDList{i1.ID(), i2.ID(), i3.ID(), i4.ID()},
		},
		{
			name:              "must not remove items outside writable projects",
			seeds:             seeds,
			filter:            rwFilter(pid),
			args:              id.ItemIDList{i4.ID()},
			want:              id.ItemIDList{i1.ID(), i2.ID(), i3.ID(), i4.ID()},
			errBackendDefined: true,
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

			err := r.BatchRemove(ctx, tc.args)
			if !tc.errBackendDefined {
				if tc.wantErr != nil {
					assert.Equal(t, tc.wantErr, err)
					return
				}
				assert.NoError(t, err)
			}

			// remaining items are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			for _, keptID := range tc.want {
				got, err := base.FindByID(ctx, keptID, nil)
				assert.NoError(t, err)
				assert.Equal(t, keptID, got.Value().ID())
			}
			for _, removedID := range tc.args {
				if !tc.want.Has(removedID) {
					got, err := base.FindByID(ctx, removedID, nil)
					assert.Nil(t, got)
					assert.Equal(t, rerror.ErrNotFound, err)
				}
			}
		})
	}
}

func testItemArchive(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()

	type args struct {
		project  id.ProjectID
		archived bool
	}

	tests := []struct {
		name     string
		seeds    item.List
		archived bool // archived state set before the call
		filter   *repo.ProjectFilter
		args     args
		want     bool // archived state after the call
		wantErr  error
	}{
		{
			name:   "must archive an item",
			seeds:  item.List{i1},
			filter: rwFilter(pid),
			args:   args{project: pid, archived: true},
			want:   true,
		},
		{
			name:    "must not archive with an unwritable project",
			seeds:   item.List{i1},
			filter:  rwFilter(pid),
			args:    args{project: pid2, archived: true},
			want:    false,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:     "must unarchive an item",
			seeds:    item.List{i1},
			archived: true,
			filter:   rwFilter(pid),
			args:     args{project: pid, archived: false},
			want:     false,
		},
		{
			name:     "must not unarchive with an unwritable project",
			seeds:    item.List{i1},
			archived: true,
			filter:   rwFilter(pid),
			args:     args{project: pid2, archived: false},
			want:     true,
			wantErr:  repo.ErrOperationDenied,
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

			if tc.archived {
				require.NoError(t, r.Archive(ctx, i1.ID(), pid, true))
			}

			// a fresh item is not archived; a pre-archived one is
			res, err := r.IsArchived(ctx, i1.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.archived, res)

			err = r.Archive(ctx, i1.ID(), tc.args.project, tc.args.archived)
			if tc.wantErr != nil {
				assert.Same(t, tc.wantErr, err)
			} else {
				assert.NoError(t, err)
			}

			res, err = r.IsArchived(ctx, i1.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.want, res)
		})
	}
}

func testItemSearch(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sf1 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().RandomKey().MustBuild()
	sf2 := schema.NewField(lo.Must1(schema.NewInteger(nil, nil)).TypeProperty()).NewID().RandomKey().MustBuild()
	s1 := schema.New().NewID().Project(pid).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).MustBuild()
	s2 := schema.New().NewID().Project(pid).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).MustBuild()
	f1 := item.NewField(sf1.ID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2.ID(), value.TypeInteger.Value(2).AsMultiple(), nil)
	i1 := item.New().NewID().Schema(s1.ID()).Model(mid).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(s1.ID()).Model(mid).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(s1.ID()).Model(mid).Fields([]*item.Field{f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Schema(s2.ID()).Model(mid).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	sp := schema.NewPackage(s1, nil, nil, nil)

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    *item.Query
		want    int
		wantErr error
	}{
		{
			name:  "must find two items (first 10)",
			seeds: item.List{i1, i2, i3},
			args:  item.NewQuery(pid, mid, nil, "foo", nil),
			want:  2,
		},
		{
			name:  "must find all items",
			seeds: item.List{i1, i2, i3},
			args:  item.NewQuery(pid, mid, nil, "", nil),
			want:  3,
		},
		{
			name:  "must find one item",
			seeds: item.List{i1, i2, i3, i4},
			args:  item.NewQuery(pid, mid, s2.ID().Ref(), "foo", nil),
			want:  1,
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

			got, _, err := r.Search(ctx, *sp, tc.args, usecasex.CursorPagination{First: new(int64(10))}.Wrap())
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func testItemFindByModelAndValue(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	f1 := item.NewField(sf1, value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeText.Value("hoge").AsMultiple(), nil)
	pid := id.NewProjectID()
	mid := id.NewModelID()
	i1 := item.New().NewID().Schema(sid).Model(mid).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    []repo.FieldAndValue
		want    int
		wantErr error
	}{
		{
			name:  "must not find any item",
			seeds: seeds,
			args:  []repo.FieldAndValue{{Field: f2.FieldID(), Value: f2.Value()}},
			want:  0,
		},
		{
			name:  "must find one item",
			seeds: seeds,
			args:  []repo.FieldAndValue{{Field: f1.FieldID(), Value: f1.Value()}},
			want:  1,
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

			got, err := r.FindByModelAndValue(ctx, mid, tc.args, nil)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func testItemUpdateRef(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	vx := version.Ref("xxx")
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    version.Ref // attached to the latest saved version
		want    version.Refs
		wantErr error
	}{
		{
			name:  "must attach the ref to the latest version",
			seeds: item.List{i1},
			args:  vx,
			want:  version.NewRefs(vx, version.Latest),
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

			v, err := r.FindByID(ctx, i1.ID(), nil)
			require.NoError(t, err)

			err = r.UpdateRef(ctx, i1.ID(), tc.args, v.Version().OrRef().Ref())
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			v2, err := r.FindByID(ctx, i1.ID(), nil)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, v2.Refs())
		})
	}
}

func testItemFindByAssets(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	pid := id.NewProjectID()
	aid1 := id.NewAssetID()
	aid2 := id.NewAssetID()
	f1 := item.NewField(sf1, value.TypeAsset.Value(aid1).AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeAsset.Value(aid2).AsMultiple(), nil)
	f3 := item.NewField(sf2, value.TypeText.Value("xxx").AsMultiple(), nil)
	i1 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f1, f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f3}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2, i3}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.AssetIDList
		want    int
		wantErr error
	}{
		{
			name:  "must find two items",
			seeds: seeds,
			args:  id.AssetIDList{aid1, aid2},
			want:  2,
		},
		{
			name:  "must find one item",
			seeds: seeds,
			args:  id.AssetIDList{aid2},
			want:  1,
		},
		{
			name:  "must not find any item",
			seeds: seeds,
			args:  id.AssetIDList{},
			want:  0,
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

			got, err := r.FindByAssets(ctx, tc.args, nil)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func testItemCountByModel(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	mid1 := id.NewModelID()
	mid2 := id.NewModelID()
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	sid := id.NewSchemaID()
	fs := []*item.Field{boolField()}

	i1 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Fields(fs).Schema(sid).Model(mid2).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    int
		wantErr error
	}{
		{
			name:   "count items for model with 2 items",
			seeds:  item.List{i1, i2, i3},
			filter: rwFilter(pid1),
			args:   mid1,
			want:   2,
		},
		{
			name:   "count items for model with 1 item",
			seeds:  item.List{i1, i2, i3},
			filter: rwFilter(pid1),
			args:   mid2,
			want:   1,
		},
		{
			name:   "count items for model with no items",
			seeds:  item.List{i1, i2, i3},
			filter: rwFilter(pid1),
			args:   id.NewModelID(),
			want:   0,
		},
		{
			name:   "count items with cross-project permission filtering",
			seeds:  item.List{i1, i2, i4},
			filter: rwFilter(pid1),
			args:   mid1,
			want:   2,
		},
		{
			name:   "count items with no accessible projects",
			seeds:  item.List{i1, i2},
			filter: rwFilter(),
			args:   mid1,
			want:   0,
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

			got, err := r.CountByModel(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testItemFindByModel(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	mid := id.NewModelID()
	pid := id.NewProjectID()
	i1 := newItem(pid, id.NewSchemaID(), mid, boolField())
	i2 := newItem(pid, id.NewSchemaID(), mid, boolField())
	i3 := newItem(id.NewProjectID(), id.NewSchemaID(), mid, boolField())
	i4 := newItem(pid, id.NewSchemaID(), id.NewModelID(), boolField())

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    item.List
		wantErr error
	}{
		{
			name:   "must find two items (first 10)",
			seeds:  item.List{i1, i2, i3},
			filter: rwFilter(pid),
			args:   mid,
			want:   item.List{i1, i2},
		},
		{
			name:   "must not find any item",
			seeds:  item.List{i4},
			filter: rwFilter(pid),
			args:   mid,
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

			got, _, err := r.FindByModel(ctx, tc.args, nil, nil, usecasex.CursorPagination{First: new(int64(10))}.Wrap())
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.Unwrap())
		})
	}
}

func testItemLastModifiedByModel(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	nows := []time.Time{now1, now2}
	mid := id.NewModelID()
	pid := id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(now1.Truncate(time.Millisecond)).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(now2.Truncate(time.Millisecond)).MustBuild()

	tests := []struct {
		name    string
		seeds   item.List // saved one at a time, at nows[i]
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    time.Time
		wantErr error
	}{
		{
			name:  "must find the timestamp of the last modified item",
			seeds: item.List{i1, i2},
			args:  mid,
			want:  now2,
		},
		{
			name:    "must not find any item for a different model",
			seeds:   item.List{i1},
			args:    id.NewModelID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for i, s := range tc.seeds {
				saveAt(t, r, s, nows[i])
			}
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.LastModifiedByModel(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.True(t, tc.want.Equal(got), "want %v, got %v", tc.want, got)
		})
	}
}

func testItemFindVersionByID(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	nows := []time.Time{now1, now2}

	iid := id.NewItemID()
	fs := []*item.Field{boolField()}
	ts1 := now1.Truncate(time.Millisecond)
	ts2 := ts1.Add(time.Second)
	i1 := item.New().ID(iid).Fields(fs).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Timestamp(ts1).MustBuild()
	i2 := item.New().ID(iid).Fields(fs).Schema(i1.Schema()).Model(i1.Model()).Project(i1.Project()).Thread(id.NewThreadID().Ref()).Timestamp(ts2).MustBuild()

	// args resolves the version to request once the seeds are saved and
	// their (unpredictable) generated version IDs are read back, since they
	// cannot be precomputed in the table; versions are returned oldest-first.
	tests := []struct {
		name    string
		seeds   item.List // saved one at a time, at nows[i]
		filter  *repo.ProjectFilter
		args    func(all item.VersionedList) version.VersionOrRef
		want    *item.Item
		wantErr error
	}{
		{
			name:  "must find the first version",
			seeds: item.List{i1, i2},
			args:  func(all item.VersionedList) version.VersionOrRef { return all[0].Version().OrRef() },
			want:  i1,
		},
		{
			name:  "must find the latest version",
			seeds: item.List{i1, i2},
			args:  func(all item.VersionedList) version.VersionOrRef { return all[1].Version().OrRef() },
			want:  i2,
		},
		{
			name:  "must find the latest ref",
			seeds: item.List{i1, i2},
			args:  func(item.VersionedList) version.VersionOrRef { return version.Latest.OrVersion() },
			want:  i2,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for i, s := range tc.seeds {
				saveAt(t, r, s, nows[i])
			}
			all, err := r.FindAllVersionsByID(ctx, iid)
			require.NoError(t, err)
			require.Len(t, all, len(tc.seeds))

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindVersionByID(ctx, iid, tc.args(all))
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got.Value())
		})
	}
}

func testItemRemoveByModel(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	mid, mid2 := id.NewModelID(), id.NewModelID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid2).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Schema(id.NewSchemaID()).Model(mid).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2, i3, i4}

	tests := []struct {
		name    string
		seeds   item.List
		filter  *repo.ProjectFilter
		args    id.ModelID
		want    id.ItemIDList // items that must remain after the call
		wantErr error
	}{
		{
			name:   "must remove all items of a model in writable projects",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   mid,
			want:   id.ItemIDList{i3.ID(), i4.ID()},
		},
		{
			name:   "must remove nothing for a model with no items",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   id.NewModelID(),
			want:   id.ItemIDList{i1.ID(), i2.ID(), i3.ID(), i4.ID()},
		},
		{
			name:   "must not remove items outside writable projects",
			seeds:  seeds,
			filter: rwFilter(pid),
			args:   mid,
			want:   id.ItemIDList{i3.ID(), i4.ID()},
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

			err := r.RemoveByModel(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			require.NoError(t, err)

			// remaining items are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			for _, keptID := range tc.want {
				got, err := base.FindByID(ctx, keptID, nil)
				assert.NoError(t, err)
				assert.Equal(t, keptID, got.Value().ID())
			}
			for _, s := range tc.seeds {
				got, err := base.FindByID(ctx, s.ID(), nil)
				if !tc.want.Has(s.ID()) {
					assert.Nil(t, got)
					assert.Equal(t, rerror.ErrNotFound, err)
				}
			}
		})
	}
}
