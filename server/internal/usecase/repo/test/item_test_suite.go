// Package test provides interface-level test suites that both the mongo and
// memory repository implementations run via thin entry-point tests. Suites
// depend only on the repo interfaces; backend-specific behavior is tested in
// the respective infrastructure packages.
package test

import (
	"context"
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
// implementation produced by newRepo. Each interface method has its own
// test function below.
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
}

// seedItems saves the given items into r, failing the test on any error. It is
// the shared seeder for the table-driven cases across every method below.
func seedItems(t *testing.T, r repo.Item, seeds item.List) {
	t.Helper()
	require.NoError(t, r.SaveAll(context.Background(), seeds))
}

// newItem builds an item whose timestamp survives a persistence round-trip
// unchanged (millisecond-truncated UTC), so it can be compared by deep equality.
func newItem(pid id.ProjectID, sid id.SchemaID, mid id.ModelID, fields ...*item.Field) *item.Item {
	ts := time.Now().Truncate(time.Millisecond).UTC()
	return item.New().NewID().Fields(fields).Schema(sid).Model(mid).
		Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts).MustBuild()
}

func boolField() *item.Field {
	return item.NewField(schema.NewFieldID(), value.TypeBool.Value(true).AsMultiple(), nil)
}

func testItemFindByID(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	i1 := newItem(id.NewProjectID(), id.NewSchemaID(), id.NewModelID(), boolField())

	tests := []struct {
		name    string
		seeds   item.List
		arg     id.ItemID
		want    *item.Item
		wantErr error
	}{
		{
			name:  "must find a item",
			seeds: item.List{i1},
			arg:   i1.ID(),
			want:  i1,
		},
		{
			name:    "must not find any item",
			seeds:   item.List{i1},
			arg:     id.NewItemID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, err := r.FindByID(ctx, tc.arg, nil)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.want, got.Value())
			}
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
		name  string
		seeds item.List
		arg   id.ItemIDList
		want  item.List
	}{
		{
			name:  "must find two items",
			seeds: seeds,
			arg:   id.ItemIDList{i1.ID(), i2.ID()},
			want:  item.List{i1, i2},
		},
		{
			name:  "must find one of two items",
			seeds: seeds,
			arg:   id.ItemIDList{i1.ID()},
			want:  item.List{i1},
		},
		{
			name:  "must not find any item",
			seeds: seeds,
			arg:   id.ItemIDList{id.NewItemID()},
			want:  item.List{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, err := r.FindByIDs(ctx, tc.arg, nil)
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.Unwrap())
		})
	}
}

func testItemFindAllVersionsByID(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	ts1 := now1.Truncate(time.Millisecond)
	ts2 := ts1.Add(time.Second)

	iid := id.NewItemID()
	fs := []*item.Field{boolField()}
	i1 := item.New().ID(iid).Fields(fs).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Timestamp(ts1).MustBuild()
	i2 := item.New().ID(iid).Fields(fs).Schema(i1.Schema()).Model(id.NewModelID()).Project(i1.Project()).Thread(id.NewThreadID().Ref()).Timestamp(ts2).MustBuild()

	r := newRepo(t)
	// safe: no parallel subtests here, and sibling groups' parallel cases
	// have already finished (t.Run waits for them)
	defer util.MockNow(now1)()
	require.NoError(t, r.Save(ctx, i1))

	got1, err := r.FindAllVersionsByID(ctx, iid)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got1[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
	}, got1)

	defer util.MockNow(now2)()
	require.NoError(t, r.Save(ctx, i2))

	got2, err := r.FindAllVersionsByID(ctx, iid)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got2[0].Version(), nil, nil, now1, i1),
		version.NewValue(got2[1].Version(), version.NewVersions(got2[0].Version()), version.NewRefs(version.Latest), now2, i2),
	}, got2)

	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{id.NewProjectID()},
		Writable: []id.ProjectID{id.NewProjectID()},
	})
	got3, err := r.FindAllVersionsByID(ctx, iid)
	assert.NoError(t, err)
	assert.Empty(t, got3)
}

func testItemFindAllVersionsByIDs(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	now1 := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	now2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.UTC)
	ts1 := now1.Truncate(time.Millisecond)
	ts2 := ts1.Add(time.Second)

	iid1 := id.NewItemID()
	iid2 := id.NewItemID()
	pid := id.NewProjectID()
	fs := []*item.Field{boolField()}
	i1 := item.New().ID(iid1).Fields(fs).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts1).MustBuild()
	i2 := item.New().ID(iid2).Fields(fs).Schema(i1.Schema()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).Timestamp(ts2).MustBuild()

	r := newRepo(t)
	// safe: no parallel subtests here, and sibling groups' parallel cases
	// have already finished (t.Run waits for them)
	defer util.MockNow(now1)()
	require.NoError(t, r.Save(ctx, i1))

	got1, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{iid1})
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got1[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
	}, got1)

	defer util.MockNow(now2)()
	require.NoError(t, r.Save(ctx, i2))

	got2, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{iid1, iid2})
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got2[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
		version.NewValue(got2[1].Version(), nil, version.NewRefs(version.Latest), now2, i2),
	}, got2)

	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{id.NewProjectID()},
		Writable: []id.ProjectID{id.NewProjectID()},
	})
	got3, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{iid1, iid2})
	assert.NoError(t, err)
	assert.Empty(t, got3)
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
		name  string
		seeds item.List
		arg   id.SchemaID
		want  item.List
	}{
		{
			name:  "must find two items (first 10)",
			seeds: item.List{i1, i2, i3},
			arg:   sid,
			want:  item.List{i1, i2},
		},
		{
			name:  "must not find any item",
			seeds: item.List{i4},
			arg:   sid,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)
			r = r.Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})

			got, _, err := r.FindBySchema(ctx, tc.arg, nil, nil, usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap())
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.Unwrap())
		})
	}
}

func testItemSave(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	i1 := newItem(id.NewProjectID(), id.NewSchemaID(), id.NewModelID())
	i2 := newItem(id.NewProjectID(), id.NewSchemaID(), id.NewModelID())

	r := newRepo(t).Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{i1.Project()},
		Writable: []id.ProjectID{i1.Project()},
	})

	require.NoError(t, r.Save(ctx, i1))
	got, err := r.FindByID(ctx, i1.ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, i1, got.Value())

	assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, i2))
}

func testItemRemove(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	base := newRepo(t)
	seedItems(t, base, item.List{i1, i2, i3})
	r := base.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	assert.NoError(t, r.Remove(ctx, i1.ID()))
	got, err := r.FindByID(ctx, i1.ID(), nil)
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)

	got2, err := r.FindByID(ctx, i2.ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, i2.ID(), got2.Value().ID())

	// removing an item outside the writable projects must not remove it;
	// the call result is backend-defined (memory: ErrOperationDenied, mongo: no-op)
	_ = r.Remove(ctx, i3.ID())
	got3, err := base.FindByID(ctx, i3.ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, i3.ID(), got3.Value().ID())
}

func testItemBatchRemove(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid := id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	seeds := item.List{i1, i2, i3}

	tests := []struct {
		name     string
		seeds    item.List
		toRemove id.ItemIDList
		want     id.ItemIDList
	}{
		{
			name:     "remove multiple items",
			seeds:    seeds,
			toRemove: id.ItemIDList{i1.ID(), i2.ID()},
			want:     id.ItemIDList{i3.ID()},
		},
		{
			name:     "remove all items",
			seeds:    seeds,
			toRemove: id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
			want:     id.ItemIDList{},
		},
		{
			name:     "remove empty list",
			seeds:    seeds,
			toRemove: id.ItemIDList{},
			want:     id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
		},
		{
			name:     "remove non-existent items",
			seeds:    seeds,
			toRemove: id.ItemIDList{id.NewItemID()},
			want:     id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)
			r = r.Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})

			assert.NoError(t, r.BatchRemove(ctx, tc.toRemove))

			for _, wantID := range tc.want {
				got, err := r.FindByID(ctx, wantID, nil)
				assert.NoError(t, err)
				assert.Equal(t, wantID, got.Value().ID())
			}
			for _, removedID := range tc.toRemove {
				if !tc.want.Has(removedID) {
					got, err := r.FindByID(ctx, removedID, nil)
					assert.Nil(t, got)
					assert.Equal(t, rerror.ErrNotFound, err)
				}
			}
		})
	}

	t.Run("permission denied", func(t *testing.T) {
		t.Parallel()

		pid2 := id.NewProjectID()
		i4 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

		base := newRepo(t)
		seedItems(t, base, item.List{i1, i4})
		r := base.Filtered(repo.ProjectFilter{
			Readable: []id.ProjectID{pid},
			Writable: []id.ProjectID{pid},
		})

		// removing an item outside the writable projects must not remove it;
		// the call result is backend-defined (memory: ErrOperationDenied, mongo: no-op)
		_ = r.BatchRemove(ctx, id.ItemIDList{i4.ID()})
		got, err := base.FindByID(ctx, i4.ID(), nil)
		assert.NoError(t, err)
		assert.Equal(t, i4.ID(), got.Value().ID())
	})
}

func testItemArchive(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid := id.NewProjectID()
	pid2 := id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()

	base := newRepo(t)
	seedItems(t, base, item.List{i1})
	r := base.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	res, err := r.IsArchived(ctx, i1.ID())
	assert.NoError(t, err)
	assert.False(t, res)

	// failed to archive
	err = r.Archive(ctx, i1.ID(), pid2, true)
	assert.Same(t, repo.ErrOperationDenied, err)

	res, err = r.IsArchived(ctx, i1.ID())
	assert.NoError(t, err)
	assert.False(t, res)

	// successfully archive
	assert.NoError(t, r.Archive(ctx, i1.ID(), pid, true))

	res, err = r.IsArchived(ctx, i1.ID())
	assert.NoError(t, err)
	assert.True(t, res)

	// failed to unarchive
	err = r.Archive(ctx, i1.ID(), pid2, false)
	assert.Same(t, repo.ErrOperationDenied, err)

	res, err = r.IsArchived(ctx, i1.ID())
	assert.NoError(t, err)
	assert.True(t, res)

	// successfully unarchived
	assert.NoError(t, r.Archive(ctx, i1.ID(), pid, false))

	res, err = r.IsArchived(ctx, i1.ID())
	assert.NoError(t, err)
	assert.False(t, res)
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
		name  string
		seeds item.List
		arg   *item.Query
		want  int
	}{
		{
			name:  "must find two items (first 10)",
			seeds: item.List{i1, i2, i3},
			arg:   item.NewQuery(pid, mid, nil, "foo", nil),
			want:  2,
		},
		{
			name:  "must find all items",
			seeds: item.List{i1, i2, i3},
			arg:   item.NewQuery(pid, mid, nil, "", nil),
			want:  3,
		},
		{
			name:  "must find one item",
			seeds: item.List{i1, i2, i3, i4},
			arg:   item.NewQuery(pid, mid, s2.ID().Ref(), "foo", nil),
			want:  1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, _, err := r.Search(ctx, *sp, tc.arg, usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap())
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
		name   string
		seeds  item.List
		fields []repo.FieldAndValue
		want   int
	}{
		{
			name:   "must not find any item",
			seeds:  seeds,
			fields: []repo.FieldAndValue{{Field: f2.FieldID(), Value: f2.Value()}},
			want:   0,
		},
		{
			name:   "must find one item",
			seeds:  seeds,
			fields: []repo.FieldAndValue{{Field: f1.FieldID(), Value: f1.Value()}},
			want:   1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, err := r.FindByModelAndValue(ctx, mid, tc.fields, nil)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func testItemUpdateRef(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	vx := version.Ref("xxx")
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	r := newRepo(t)
	require.NoError(t, r.Save(ctx, i1))
	v, err := r.FindByID(ctx, i1.ID(), nil)
	require.NoError(t, err)

	assert.NoError(t, r.UpdateRef(ctx, i1.ID(), vx, v.Version().OrRef().Ref()))

	v2, err := r.FindByID(ctx, i1.ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, version.NewRefs(vx, version.Latest), v2.Refs())
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
		name  string
		seeds item.List
		arg   id.AssetIDList
		want  int
	}{
		{
			name:  "must find two items",
			seeds: seeds,
			arg:   id.AssetIDList{aid1, aid2},
			want:  2,
		},
		{
			name:  "must find one item",
			seeds: seeds,
			arg:   id.AssetIDList{aid2},
			want:  1,
		},
		{
			name:  "must not find any item",
			seeds: seeds,
			arg:   id.AssetIDList{},
			want:  0,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, err := r.FindByAssets(ctx, tc.arg, nil)
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

	rwPid1 := repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}}

	tests := []struct {
		name    string
		seeds   item.List
		modelID id.ModelID
		filter  repo.ProjectFilter
		want    int
	}{
		{
			name:    "count items for model with 2 items",
			seeds:   item.List{i1, i2, i3},
			modelID: mid1,
			filter:  rwPid1,
			want:    2,
		},
		{
			name:    "count items for model with 1 item",
			seeds:   item.List{i1, i2, i3},
			modelID: mid2,
			filter:  rwPid1,
			want:    1,
		},
		{
			name:    "count items for model with no items",
			seeds:   item.List{i1, i2, i3},
			modelID: id.NewModelID(),
			filter:  rwPid1,
			want:    0,
		},
		{
			name:    "count items with cross-project permission filtering",
			seeds:   item.List{i1, i2, i4},
			modelID: mid1,
			filter:  rwPid1,
			want:    2,
		},
		{
			name:    "count items with no accessible projects",
			seeds:   item.List{i1, i2},
			modelID: mid1,
			filter:  repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    0,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedItems(t, r, tc.seeds)

			got, err := r.Filtered(tc.filter).CountByModel(ctx, tc.modelID)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
