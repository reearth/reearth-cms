package mongo

import (
	"context"
	"testing"

	repo "github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_ItemRepo_FindByID(t *testing.T) {
	id1 := id.NewItemID()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().ID(id1).Fields(fs).Schema(sid).Project(pid).Project(pid).Build()
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

func Test_itemRepo_Remove(t *testing.T) {
	id1 := id.NewItemID()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().ID(id1).Fields(fs).Schema(sid).Project(pid).Project(pid).Build()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewItem(client).Filtered(pf)
	ctx := context.Background()
	_ = r.Save(ctx, i1)
	err := r.Remove(ctx, i1.ID(), id.NewProjectID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	err = r.Remove(ctx, i1.ID(), pid)
	assert.NoError(t, err)
	got, err := r.FindByID(ctx, i1.ID())
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func Test_itemRepo_FindAllVersionsByID(t *testing.T) {
	id1 := id.NewItemID()
	sfid := schema.NewFieldID()
	pid := id.NewProjectID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().ID(id1).Fields(fs).Schema(id.NewSchemaID()).Project(pid).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}

	init := mongotest.Connect(t)

	client := mongox.NewClientWithDatabase(init(t))

	r := NewItem(client).Filtered(pf)
	ctx := context.Background()
	err := r.Save(ctx, i1)
	assert.NoError(t, err)

	_, err = r.FindAllVersionsByID(ctx, i1.ID(), id.NewProjectID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	got, err := r.FindAllVersionsByID(ctx, i1.ID(), pid)
	assert.NoError(t, err)
	assert.Equal(t, 1, len(got))

	err = r.Save(ctx, i1)
	assert.NoError(t, err)
	got2, err := r.FindAllVersionsByID(ctx, i1.ID(), pid)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(got2))
}

func Test_itemRepo_FindByIDs(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().NewID().Fields(fs).Schema(sid).Project(pid).Build()
	i2, _ := item.New().NewID().Fields(fs).Schema(sid).Project(pid).Build()
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

func Test_itemRepo_FindBySchema(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().NewID().Fields(fs).Schema(sid).Project(pid).Build()
	i2, _ := item.New().NewID().Fields(fs).Schema(sid).Project(pid).Build()
	tests := []struct {
		Name  string
		Input struct {
			sid id.SchemaID
			pid id.ProjectID
		}
		RepoData, Expected item.List
	}{
		{
			Name: "must find two items (first 10)",
			Input: struct {
				sid id.SchemaID
				pid id.ProjectID
			}{sid: sid, pid: pid},
			RepoData: item.List{i1, i2},
			Expected: item.List{i1, i2},
		},
		{
			Name: "must not find any item",
			Input: struct {
				sid id.SchemaID
				pid id.ProjectID
			}{sid: sid, pid: id.NewProjectID()},
			RepoData: item.List{i1, i2},
		},
	}

	init := mongotest.Connect(t)
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			repo := NewItem(client).Filtered(pf)
			ctx := context.Background()
			for _, i := range tc.RepoData {
				err := repo.Save(ctx, i)
				assert.NoError(tt, err)
			}

			got, _, _ := repo.FindBySchema(ctx, tc.Input.sid, tc.Input.pid, usecasex.NewPagination(lo.ToPtr(10), nil, nil, nil))
			assert.Equal(tt, tc.Expected, got)
		})
	}
}

func Test_itemRepo_FindByProject(t *testing.T) {
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	i1, _ := item.New().NewID().Schema(sid).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(sid).Project(pid).Build()
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
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			repo := NewItem(client).Filtered(pf)
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
