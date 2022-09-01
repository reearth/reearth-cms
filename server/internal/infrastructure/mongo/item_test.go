package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func Test_itemRepo_FindByID(t *testing.T) {
	id1 := id.NewItemID()
	sid := schema.NewID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().ID(id1).Fields(fs).Schema(sid).Build()
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

//func Test_itemRepo_FindByIDs(t *testing.T) {
//	i1, _ := item.New().NewID().PublicVersion("hoge").Build()
//	i2, _ := item.New().NewID().PublicVersion("foo").Build()
//	i3, _ := item.New().NewID().PublicVersion("xxx").Build()
//
//	tests := []struct {
//		Name               string
//		Input              id.ItemIDList
//		RepoData, Expected item.List
//	}{
//		{
//			Name:     "must find items",
//			RepoData: item.List{i1, i2, i3},
//			Input:    id.ItemIDList{i1.ID(), i2.ID()},
//			Expected: item.List{i1, i2, i3},
//		},
//		{
//			Name:     "must not find any item",
//			Input:    id.ItemIDList{i3.ID()},
//			RepoData: item.List{i2, i1},
//		},
//	}
//
//	init := mongotest.Connect(t)
//
//	for _, tc := range tests {
//		tc := tc
//
//		t.Run(tc.Name, func(tt *testing.T) {
//			tt.Parallel()
//
//			client := mongodoc.NewClientWithDatabase(init(t))
//
//			repo := NewItem(client)
//			ctx := context.Background()
//			err := repo.SaveAll(ctx, tc.RepoData)
//			assert.NoError(tt, err)
//
//			got, err := repo.FindByIDs(ctx, tc.Input)
//			assert.NoError(tt, err)
//			for k, i := range got {
//				if i != nil {
//					assert.Equal(tt, tc.Expected[k].ID(), i.ID())
//					assert.Equal(tt, tc.Expected[k].PublicVersion(), i.PublicVersion())
//				}
//			}
//		})
//	}
//}

//func Test_itemRepo_Remove(t *testing.T) {
//	i, _ := item.New().NewID().Build()
//
//	init := mongotest.Connect(t)
//	client := mongodoc.NewClientWithDatabase(init(t))
//
//	repo := NewItem(client)
//	ctx := context.Background()
//	err := repo.Save(ctx, i)
//	assert.NoError(t, err)
//
//	err = repo.Remove(ctx, i.ID())
//	assert.NoError(t, err)
//}
//
//func Test_itemRepo_RemoveAll(t *testing.T) {
//	i1, _ := item.New().NewID().Build()
//	i2, _ := item.New().NewID().Build()
//
//	init := mongotest.Connect(t)
//	client := mongodoc.NewClientWithDatabase(init(t))
//
//	repo := NewItem(client)
//	ctx := context.Background()
//	err := repo.Save(ctx, i1)
//	assert.NoError(t, err)
//	err = repo.Save(ctx, i2)
//	assert.NoError(t, err)
//
//	err = repo.RemoveAll(ctx, id.ItemIDList{i1.ID(), i2.ID()})
//	assert.NoError(t, err)
//}
