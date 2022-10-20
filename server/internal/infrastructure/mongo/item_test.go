package mongo

import (
	"context"
	"testing"

	repo "github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestItem_FindByID(t *testing.T) {
	id1 := id.NewItemID()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1 := item.New().ID(id1).Fields(fs).Schema(sid).Project(pid).Project(pid).MustBuild()
	tests := []struct {
		Name               string
		Input              id.ItemID
		RepoData, Expected *item.Item
		WantErr            bool
	}{
		{
			Name:     "must find a item",
			Input:    i1.ID(),
			RepoData: i1,
			Expected: i1,
		},
		{
			Name:     "must not find any item",
			Input:    id.NewItemID(),
			RepoData: i1,
			WantErr:  true,
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))
			repo := NewItem(client)

			ctx := context.Background()
			err := repo.Save(ctx, tc.RepoData)
			assert.NoError(tt, err)

			got, err := repo.FindByID(ctx, tc.Input)
			if tc.WantErr {
				assert.Equal(tt, err, rerror.ErrNotFound)
			} else {
				assert.Equal(tt, tc.Expected.ID(), got.ID())
			}
		})
	}
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	id1 := id.NewItemID()
	sfid := schema.NewFieldID()
	pid := id.NewProjectID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1 := item.New().ID(id1).Fields(fs).Schema(id.NewSchemaID()).Project(pid).MustBuild()

	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))

	r := NewItem(client)
	ctx := context.Background()
	err := r.Save(ctx, i1)
	assert.NoError(t, err)

	got, err := r.FindAllVersionsByID(ctx, i1.ID())
	assert.NoError(t, err)
	assert.Equal(t, []*version.Value[*item.Item]{
		version.NewValue(got[0].Version(), nil, version.NewRefs(version.Latest), i1),
	}, got)

	assert.NoError(t, r.Save(ctx, i1))

	got2, err := r.FindAllVersionsByID(ctx, i1.ID())
	assert.NoError(t, err)
	assert.Equal(t, []*version.Value[*item.Item]{
		version.NewValue(got2[0].Version(), nil, nil, i1),
		version.NewValue(got2[1].Version(), version.NewVersions(got2[0].Version()), version.NewRefs(version.Latest), i1),
	}, got2)

	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{id.NewProjectID()},
	})
	got3, err := r.FindAllVersionsByID(ctx, i1.ID())
	assert.Nil(t, got3)
	assert.NoError(t, err)
}

func TestItem_FindByIDs(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1 := item.New().NewID().Fields(fs).Schema(sid).Project(pid).MustBuild()
	i2 := item.New().NewID().Fields(fs).Schema(sid).Project(pid).MustBuild()
	tests := []struct {
		Name               string
		Input              id.ItemIDList
		RepoData, Expected item.List
	}{
		{
			Name:     "must find two items",
			Input:    id.ItemIDList{i1.ID(), i2.ID()},
			RepoData: item.List{i1, i2},
			Expected: item.List{i1, i2},
		},
		{
			Name:     "must not find any item",
			Input:    id.ItemIDList{id.NewItemID()},
			RepoData: item.List{i1, i2},
			Expected: item.List{},
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			repo := NewItem(client)
			ctx := context.Background()
			// @TODO create SaveAll func
			for _, i := range tc.RepoData {
				err := repo.Save(ctx, i)
				assert.NoError(tt, err)
			}

			got, _ := repo.FindByIDs(ctx, tc.Input)
			assert.Equal(tt, tc.Expected, got)
		})
	}
}

func TestItem_FindBySchema(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1 := item.New().NewID().Fields(fs).Schema(sid).Project(pid).MustBuild()
	i2 := item.New().NewID().Fields(fs).Schema(sid).Project(pid).MustBuild()
	i3 := item.New().NewID().Fields(fs).Schema(sid).Project(id.NewProjectID()).MustBuild()
	i4 := item.New().NewID().Fields(fs).Schema(id.NewSchemaID()).Project(pid).MustBuild()

	tests := []struct {
		Name        string
		Input       id.SchemaID
		Seeds       item.List
		Expected    item.List
		ExpectedErr error
	}{
		{
			Name:     "must find two items (first 10)",
			Input:    sid,
			Seeds:    item.List{i1, i2, i3},
			Expected: item.List{i1, i2},
		},
		{
			Name:  "must not find any item",
			Input: sid,
			Seeds: item.List{i4},
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))
			r := NewItem(client)
			ctx := context.Background()

			for _, i := range tc.Seeds {
				err := r.Save(ctx, i)
				assert.NoError(tt, err)
			}
			r = r.Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})

			got, _, err := r.FindBySchema(ctx, tc.Input, usecasex.NewPagination(lo.ToPtr(10), nil, nil, nil))
			assert.Equal(tt, tc.Expected, got)
			assert.Equal(tt, tc.ExpectedErr, err)
		})
	}
}

func TestItem_FindByProject(t *testing.T) {
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	i1 := item.New().NewID().Schema(sid).Project(pid).MustBuild()
	i2 := item.New().NewID().Schema(sid).Project(pid).MustBuild()
	tests := []struct {
		Name               string
		Input              id.ProjectID
		RepoData, Expected item.List
	}{
		{
			Name:     "must find two items (first 10)",
			Input:    pid,
			RepoData: item.List{i1, i2},
			Expected: item.List{i1, i2},
		},
		{
			Name:     "must not find any item",
			Input:    id.NewProjectID(),
			RepoData: item.List{i1, i2},
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			repo := NewItem(client).Filtered(repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			})
			ctx := context.Background()
			for _, i := range tc.RepoData {
				err := repo.Save(ctx, i)
				assert.NoError(tt, err)
			}

			got, _, _ := repo.FindByProject(ctx, tc.Input, usecasex.NewPagination(lo.ToPtr(10), nil, nil, nil))
			assert.Equal(tt, tc.Expected, got)
		})
	}
}

func TestItem_Remove(t *testing.T) {
	id1 := id.NewItemID()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1 := item.New().ID(id1).Fields(fs).Schema(sid).Project(pid).Project(pid).MustBuild()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))

	r := NewItem(client).Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})
	ctx := context.Background()
	_ = r.Save(ctx, i1)

	err := r.Remove(ctx, i1.ID())
	assert.NoError(t, err)

	got, err := r.FindByID(ctx, i1.ID())
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestItem_Archive(t *testing.T) {
	iid := id.NewItemID()
	pid := id.NewProjectID()
	pid2 := id.NewProjectID()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))
	ctx := context.Background()

	r := NewItem(client).Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	res, err := r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.False(t, res)

	// failed to archive
	err = r.Archive(ctx, iid, pid2, true)
	assert.Same(t, repo.ErrOperationDenied, err)

	res, err = r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.False(t, res)

	// successfully archive
	err = r.Archive(ctx, iid, pid, true)
	assert.NoError(t, err)

	var d bson.M
	err = client.Client.Collection("item").FindOne(ctx, bson.M{
		"__": true,
		"id": iid.String(),
	}).Decode(&d)
	assert.NoError(t, err)
	assert.Equal(t, bson.M{
		"_id":      d["_id"],
		"__":       true,
		"id":       iid.String(),
		"project":  pid.String(),
		"archived": true,
	}, d)

	res, err = r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.True(t, res)

	// failed to unarchive
	err = r.Archive(ctx, iid, pid2, false)
	assert.Same(t, repo.ErrOperationDenied, err)

	res, err = r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.True(t, res)

	// successfully unarchived
	err = r.Archive(ctx, iid, pid, false)
	assert.NoError(t, err)

	res, err = r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.False(t, res)
}
