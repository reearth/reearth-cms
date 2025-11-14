package memory

import (
	"context"
	"encoding/json"
	"errors"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItem_FindByID(t *testing.T) {
	ctx := context.Background()
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	r := NewItem()
	_ = r.Save(ctx, i)

	out, err := r.FindByID(ctx, i.ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, i, out.Value())

	out2, err := r.FindByID(ctx, id.ItemID{}, nil)
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestItem_Remove(t *testing.T) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	err := r.Remove(ctx, i1.ID())
	assert.NoError(t, err)
	data, _ := r.FindByIDs(ctx, id.ItemIDList{i1.ID(), i2.ID()}, nil)
	assert.Equal(t, item.List{i2}, data.Unwrap())

	err = r.Remove(ctx, i1.ID())
	assert.Equal(t, rerror.ErrNotFound, err)

	err = r.Remove(ctx, i3.ID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i1.ID()))
}

func TestItem_BatchRemove(t *testing.T) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	tests := []struct {
		Name     string
		ToRemove id.ItemIDList
		Seeds    item.List
		Expected item.List
		WantErr  error
	}{
		{
			Name:     "remove multiple items",
			ToRemove: id.ItemIDList{i1.ID(), i2.ID()},
			Seeds:    item.List{i1, i2, i3},
			Expected: item.List{i3},
		},
		{
			Name:     "remove all items",
			ToRemove: id.ItemIDList{i1.ID(), i2.ID(), i3.ID()},
			Seeds:    item.List{i1, i2, i3},
			Expected: item.List{},
		},
		{
			Name:     "remove empty list",
			ToRemove: id.ItemIDList{},
			Seeds:    item.List{i1, i2, i3},
			Expected: item.List{i1, i2, i3},
		},
		{
			Name:     "remove non-existent items",
			ToRemove: id.ItemIDList{id.NewItemID()},
			Seeds:    item.List{i1, i2, i3},
			Expected: item.List{i1, i2, i3},
		},
		{
			Name:     "permission denied",
			ToRemove: id.ItemIDList{i4.ID()},
			Seeds:    item.List{i1, i4},
			Expected: item.List{i1, i4},
			WantErr:  repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			r := NewItem()
			// Save items without filter first
			for _, i := range tc.Seeds {
				_ = r.Save(ctx, i)
			}

			// Apply filter for removal operations
			r = r.Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})

			err := r.BatchRemove(ctx, tc.ToRemove)
			if tc.WantErr != nil {
				assert.Equal(tt, tc.WantErr, err)
			} else {
				assert.NoError(tt, err)
			}

			// Verify remaining items
			allIDs := make(id.ItemIDList, len(tc.Seeds))
			for i, item := range tc.Seeds {
				allIDs[i] = item.ID()
			}
			data, _ := r.FindByIDs(ctx, allIDs, nil)
			actual := data.Unwrap()

			// Handle nil slice vs empty slice difference
			if len(tc.Expected) == 0 && actual == nil {
				actual = item.List{}
			}

			// Sort both slices by ID to avoid order mismatch issues
			if len(actual) > 1 {
				slices.SortStableFunc(actual, func(a, b *item.Item) int {
					return strings.Compare(a.ID().String(), b.ID().String())
				})
			}
			if len(tc.Expected) > 1 {
				expectedCopy := make(item.List, len(tc.Expected))
				copy(expectedCopy, tc.Expected)
				slices.SortStableFunc(expectedCopy, func(a, b *item.Item) int {
					return strings.Compare(a.ID().String(), b.ID().String())
				})
				assert.Equal(tt, expectedCopy, actual)
			} else {
				assert.Equal(tt, tc.Expected, actual)
			}
		})
	}

	// Test error case
	t.Run("batch remove with error", func(t *testing.T) {
		r := NewItem()
		wantErr := errors.New("test error")
		SetItemError(r, wantErr)

		err := r.BatchRemove(ctx, id.ItemIDList{i1.ID()})
		assert.Same(t, wantErr, err)
	})
}

func TestItem_Save(t *testing.T) {
	ctx := context.Background()
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).Project(id.NewProjectID()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).Project(id.NewProjectID()).MustBuild()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{i.Project()},
		Writable: []id.ProjectID{i.Project()},
	}
	r := NewItem().Filtered(pf)

	_ = r.Save(ctx, i)
	got, _ := r.FindByID(ctx, i.ID(), nil)
	assert.Equal(t, i, got.Value())

	err := r.Save(ctx, i2)
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByIDs(t *testing.T) {
	ctx := context.Background()
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).Project(id.NewProjectID()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).Project(id.NewProjectID()).MustBuild()
	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)

	ids := id.ItemIDList{i.ID()}
	il := item.List{i}
	out, err := r.FindByIDs(ctx, ids, nil)
	assert.NoError(t, err)
	assert.Equal(t, il, out.Unwrap())
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()
	ctx := context.Background()
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	r := NewItem()
	_ = r.Save(ctx, i)

	v, err := r.FindAllVersionsByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.MustBeValue(v[0].Version(), nil, version.NewRefs(version.Latest), now, i),
	}, v)

	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{},
		Writable: []id.ProjectID{},
	})
	res, err := r.FindAllVersionsByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Empty(t, res)
}

func TestItem_FindAllVersionsByIDs(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()
	ctx := context.Background()
	iid1, iid2 := item.NewID(), item.NewID()
	i1 := item.New().ID(iid1).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Timestamp(util.Now()).MustBuild()
	i2 := item.New().ID(iid2).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Timestamp(util.Now().Add(time.Second)).MustBuild()
	r := NewItem()
	_ = r.Save(ctx, i1)

	v, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{i1.ID()})
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.MustBeValue(v[0].Version(), nil, version.NewRefs(version.Latest), now, i1),
	}, v)

	_ = r.Save(ctx, i2)
	v, err = r.FindAllVersionsByIDs(ctx, id.ItemIDList{i1.ID(), i2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.MustBeValue(v[0].Version(), nil, version.NewRefs(version.Latest), now, i1),
		version.MustBeValue(v[1].Version(), nil, version.NewRefs(version.Latest), now, i2),
	}, v)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{},
		Writable: []id.ProjectID{},
	})
	res, err := r.FindAllVersionsByIDs(ctx, id.ItemIDList{i1.ID(), i2.ID()})
	assert.NoError(t, err)
	assert.Empty(t, res)
}

func TestItem_FindBySchema(t *testing.T) {
	ctx := context.Background()
	sid1, sid2 := id.NewSchemaID(), id.NewSchemaID()
	pid1, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(sid1).Project(pid1).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid2).Project(pid2).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem().Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid1},
		Writable: []id.ProjectID{pid1},
	})
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)

	got, _, err := r.FindBySchema(ctx, sid1, nil, nil, nil)
	assert.NoError(t, err)
	assert.Equal(t, item.List{i1}, got.Unwrap())

	got, _, err = r.FindBySchema(ctx, sid2, nil, nil, nil)
	assert.NoError(t, err)
	assert.Nil(t, got)
}

func TestItem_FindByFieldValue(t *testing.T) {
	ctx := context.Background()
	mID := id.NewModelID()
	sid := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	pid := id.NewProjectID()
	f1 := item.NewField(sf1, value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeText.Value("hoge").AsMultiple(), nil)
	i := item.New().NewID().Schema(sid).Model(mID).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid).Model(mID).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(sid).Model(mID).Fields([]*item.Field{f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	q := item.NewQuery(pid, mID, sid.Ref(), "foo", nil)
	got, _, _ := r.Search(ctx, schema.Package{}, q, nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByModelAndValue(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	pid := id.NewProjectID()
	f1 := item.NewField(sf1, value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeText.Value("hoge").AsMultiple(), nil)
	mid := id.NewModelID()
	i := item.New().NewID().Schema(sid).Model(mid).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid).Model(mid).Fields([]*item.Field{f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	got, _ := r.FindByModelAndValue(ctx, mid, []repo.FieldAndValue{{
		Field: f1.FieldID(),
		Value: f1.Value(),
	}}, nil)
	assert.Equal(t, 1, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_UpdateRef(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	vx := version.Ref("xxx")
	ctx := context.Background()
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	r := NewItem()
	_ = r.Save(ctx, i)
	v, _ := r.FindByID(ctx, i.ID(), nil)
	_ = r.UpdateRef(ctx, i.ID(), vx, v.Version().OrRef().Ref())
	v2, _ := r.FindByID(ctx, i.ID(), nil)
	assert.Equal(t, version.MustBeValue(v.Version(), nil, version.NewRefs(vx, version.Latest), now, i), v2)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.UpdateRef(ctx, i.ID(), vx, v.Version().OrRef().Ref()))
}

func TestItem_FindByAssets(t *testing.T) {
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
	i := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f1, f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Schema(sid).Model(id.NewModelID()).Fields([]*item.Field{f3}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	got, _ := r.FindByAssets(ctx, id.AssetIDList{aid1, aid2}, nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}
func TestItem_Copy(t *testing.T) {
	ctx := context.Background()
	r := NewItem()

	s1 := id.NewSchemaID()
	s2 := id.NewSchemaID()
	m2 := id.NewModelID()
	timestamp := time.Now()
	uid := accountdomain.NewUserID().Ref().StringRef()
	params := repo.CopyParams{
		OldSchema:   s1,
		NewSchema:   s2,
		NewModel:    m2,
		Timestamp:   timestamp,
		User:        uid,
		Integration: nil,
	}

	filter, changes, err := r.Copy(ctx, params)
	assert.NoError(t, err)

	wantFilter, err := json.Marshal(map[string]any{"schema": params.OldSchema.String()})
	assert.NoError(t, err)
	assert.Equal(t, filter, lo.ToPtr(string(wantFilter)))

	wantChanges, err := json.Marshal(task.Changes{
		"id":                   {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"schema":               {Type: task.ChangeTypeSet, Value: params.NewSchema.String()},
		"modelid":              {Type: task.ChangeTypeSet, Value: params.NewModel.String()},
		"timestamp":            {Type: task.ChangeTypeSet, Value: params.Timestamp.UTC().Format("2006-01-02T15:04:05.000+00:00")},
		"updatedbyuser":        {Type: task.ChangeTypeSet, Value: nil},
		"updatedbyintegration": {Type: task.ChangeTypeSet, Value: nil},
		"originalitem":         {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"metadataitem":         {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"thread":               {Type: task.ChangeTypeSet, Value: nil},
		"__r":                  {Type: task.ChangeTypeSet, Value: []string{"latest"}},
		"__w":                  {Type: task.ChangeTypeSet, Value: nil},
		"__v":                  {Type: task.ChangeTypeNew, Value: "version"},
		"user":                 {Type: task.ChangeTypeSet, Value: *params.User},
	})
	assert.NoError(t, err)
	assert.Equal(t, changes, lo.ToPtr(string(wantChanges)))
}

func TestItem_CountByModel(t *testing.T) {
	ctx := context.Background()
	mid1 := id.NewModelID()
	mid2 := id.NewModelID()
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	sid := id.NewSchemaID()
	sfid := id.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, value.TypeBool.Value(true).AsMultiple(), nil)}

	i1 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().Fields(fs).Schema(sid).Model(mid2).Project(pid1).Thread(id.NewThreadID().Ref()).MustBuild()
	i4 := item.New().NewID().Fields(fs).Schema(sid).Model(mid1).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	tests := []struct {
		Name        string
		ModelID     id.ModelID
		Seeds       item.List
		Filter      repo.ProjectFilter
		Expected    int
		ExpectedErr error
	}{
		{
			Name:    "count items for model with 2 items",
			ModelID: mid1,
			Seeds:   item.List{i1, i2, i3},
			Filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			Expected: 2,
		},
		{
			Name:    "count items for model with 1 item",
			ModelID: mid2,
			Seeds:   item.List{i1, i2, i3},
			Filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			Expected: 1,
		},
		{
			Name:    "count items for model with no items",
			ModelID: id.NewModelID(),
			Seeds:   item.List{i1, i2, i3},
			Filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			Expected: 0,
		},
		{
			Name:    "count items with permission filter (no access)",
			ModelID: mid1,
			Seeds:   item.List{i1, i2, i4},
			Filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			Expected: 2, // only items from pid1, i4 from pid2 is filtered out
		},
		{
			Name:    "count items with no readable projects",
			ModelID: mid1,
			Seeds:   item.List{i1, i2},
			Filter: repo.ProjectFilter{
				Readable: []id.ProjectID{},
				Writable: []id.ProjectID{},
			},
			Expected: 0,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			r := NewItem()

			for _, i := range tc.Seeds {
				err := r.Save(ctx, i)
				assert.NoError(tt, err)
			}

			filteredRepo := r.Filtered(tc.Filter)
			got, err := filteredRepo.CountByModel(ctx, tc.ModelID)
			assert.Equal(tt, tc.ExpectedErr, err)
			assert.Equal(tt, tc.Expected, got)
		})
	}

	// Test error case
	t.Run("count items with error", func(t *testing.T) {
		r := NewItem()
		wantErr := errors.New("test error")
		SetItemError(r, wantErr)

		got, err := r.CountByModel(ctx, mid1)
		assert.Equal(t, 0, got)
		assert.Same(t, wantErr, err)
	})
}
