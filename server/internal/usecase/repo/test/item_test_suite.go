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
		input   id.ItemID
		wantErr error
	}{
		{
			name:  "must find a item",
			input: i1.ID(),
		},
		{
			name:    "must not find any item",
			input:   id.NewItemID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			assert.NoError(t, r.Save(ctx, i1))

			got, err := r.FindByID(ctx, tc.input, nil)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, i1, got.Value())
			}
		})
	}
}

func testItemFindByIDs(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	pid, sid := id.NewProjectID(), id.NewSchemaID()
	i1 := newItem(pid, sid, id.NewModelID(), boolField())
	i2 := newItem(pid, sid, id.NewModelID(), boolField())

	tests := []struct {
		name     string
		input    id.ItemIDList
		expected item.List
	}{
		{
			name:     "must find two items",
			input:    id.ItemIDList{i1.ID(), i2.ID()},
			expected: item.List{i1, i2},
		},
		{
			name:     "must find one of two items",
			input:    id.ItemIDList{i1.ID()},
			expected: item.List{i1},
		},
		{
			name:     "must not find any item",
			input:    id.ItemIDList{id.NewItemID()},
			expected: item.List{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for _, i := range []*item.Item{i1, i2} {
				assert.NoError(t, r.Save(ctx, i))
			}

			got, err := r.FindByIDs(ctx, tc.input, nil)
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.expected, got.Unwrap())
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
	assert.NoError(t, r.Save(ctx, i1))

	got1, err := r.FindAllVersionsByID(ctx, iid)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got1[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
	}, got1)

	defer util.MockNow(now2)()
	assert.NoError(t, r.Save(ctx, i2))

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
	defer util.MockNow(now1)()
	assert.NoError(t, r.Save(ctx, i1))

	got1, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{iid1})
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(got1[0].Version(), nil, version.NewRefs(version.Latest), now1, i1),
	}, got1)

	defer util.MockNow(now2)()
	assert.NoError(t, r.Save(ctx, i2))

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
		name     string
		input    id.SchemaID
		seeds    item.List
		expected item.List
	}{
		{
			name:     "must find two items (first 10)",
			input:    sid,
			seeds:    item.List{i1, i2, i3},
			expected: item.List{i1, i2},
		},
		{
			name:  "must not find any item",
			input: sid,
			seeds: item.List{i4},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for _, i := range tc.seeds {
				assert.NoError(t, r.Save(ctx, i))
			}
			r = r.Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})

			got, _, err := r.FindBySchema(ctx, tc.input, nil, nil, usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap())
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.expected, got.Unwrap())
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

	assert.NoError(t, r.Save(ctx, i1))
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
	for _, i := range []*item.Item{i1, i2, i3} {
		assert.NoError(t, base.Save(ctx, i))
	}
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

	tests := []struct {
		name     string
		toRemove id.ItemIDList
		expected id.ItemIDList
	}{
		{
			name:     "remove multiple items",
			toRemove: id.ItemIDList{i1.ID(), i2.ID()},
			expected: id.ItemIDList{i3.ID()},
		},
		{
			name:     "remove all items",
			toRemove: id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
			expected: id.ItemIDList{},
		},
		{
			name:     "remove empty list",
			toRemove: id.ItemIDList{},
			expected: id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
		},
		{
			name:     "remove non-existent items",
			toRemove: id.ItemIDList{id.NewItemID()},
			expected: id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t).Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})
			for _, i := range []*item.Item{i1, i2, i3} {
				assert.NoError(t, r.Save(ctx, i))
			}

			assert.NoError(t, r.BatchRemove(ctx, tc.toRemove))

			for _, expectedID := range tc.expected {
				got, err := r.FindByID(ctx, expectedID, nil)
				assert.NoError(t, err)
				assert.Equal(t, expectedID, got.Value().ID())
			}
			for _, removedID := range tc.toRemove {
				if !tc.expected.Has(removedID) {
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
		assert.NoError(t, base.Save(ctx, i1))
		assert.NoError(t, base.Save(ctx, i4))
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
	assert.NoError(t, base.Save(ctx, i1))
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
		name     string
		input    *item.Query
		seeds    item.List
		expected int
	}{
		{
			name:     "must find two items (first 10)",
			input:    item.NewQuery(pid, mid, nil, "foo", nil),
			seeds:    item.List{i1, i2, i3},
			expected: 2,
		},
		{
			name:     "must find all items",
			input:    item.NewQuery(pid, mid, nil, "", nil),
			seeds:    item.List{i1, i2, i3},
			expected: 3,
		},
		{
			name:     "must find one item",
			input:    item.NewQuery(pid, mid, s2.ID().Ref(), "foo", nil),
			seeds:    item.List{i1, i2, i3, i4},
			expected: 1,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for _, i := range tc.seeds {
				assert.NoError(t, r.Save(ctx, i))
			}

			got, _, err := r.Search(ctx, *sp, tc.input, usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap())
			assert.NoError(t, err)
			assert.Equal(t, tc.expected, len(got))
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

	tests := []struct {
		name     string
		fields   []repo.FieldAndValue
		expected int
	}{
		{
			name: "must not find any item",
			fields: []repo.FieldAndValue{
				{Field: f2.FieldID(), Value: f2.Value()},
			},
			expected: 0,
		},
		{
			name: "must find one item",
			fields: []repo.FieldAndValue{
				{Field: f1.FieldID(), Value: f1.Value()},
			},
			expected: 1,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for _, i := range []*item.Item{i1, i2} {
				assert.NoError(t, r.Save(ctx, i))
			}

			got, err := r.FindByModelAndValue(ctx, mid, tc.fields, nil)
			assert.NoError(t, err)
			assert.Equal(t, tc.expected, len(got))
		})
	}
}

func testItemUpdateRef(t *testing.T, newRepo itemFactory) {
	ctx := context.Background()
	vx := version.Ref("xxx")
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	r := newRepo(t)
	assert.NoError(t, r.Save(ctx, i1))
	v, err := r.FindByID(ctx, i1.ID(), nil)
	assert.NoError(t, err)

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

	tests := []struct {
		name     string
		input    id.AssetIDList
		expected int
	}{
		{
			name:     "must find two items",
			input:    id.AssetIDList{aid1, aid2},
			expected: 2,
		},
		{
			name:     "must find one item",
			input:    id.AssetIDList{aid2},
			expected: 1,
		},
		{
			name:     "must not find any item",
			input:    id.AssetIDList{},
			expected: 0,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			for _, i := range []*item.Item{i1, i2, i3} {
				assert.NoError(t, r.Save(ctx, i))
			}

			got, err := r.FindByAssets(ctx, tc.input, nil)
			assert.NoError(t, err)
			assert.Equal(t, tc.expected, len(got))
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
		name     string
		modelID  id.ModelID
		seeds    item.List
		filter   repo.ProjectFilter
		expected int
	}{
		{
			name:    "count items for model with 2 items",
			modelID: mid1,
			seeds:   item.List{i1, i2, i3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			expected: 2,
		},
		{
			name:    "count items for model with 1 item",
			modelID: mid2,
			seeds:   item.List{i1, i2, i3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			expected: 1,
		},
		{
			name:    "count items for model with no items",
			modelID: id.NewModelID(),
			seeds:   item.List{i1, i2, i3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			expected: 0,
		},
		{
			name:    "count items with cross-project permission filtering",
			modelID: mid1,
			seeds:   item.List{i1, i2, i4},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			expected: 2,
		},
		{
			name:    "count items with no accessible projects",
			modelID: mid1,
			seeds:   item.List{i1, i2},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{},
				Writable: []id.ProjectID{},
			},
			expected: 0,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			assert.NoError(t, r.SaveAll(ctx, tc.seeds))

			got, err := r.Filtered(tc.filter).CountByModel(ctx, tc.modelID)
			assert.NoError(t, err)
			assert.Equal(t, tc.expected, got)
		})
	}
}
