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

func Test_ItemRepo_FindByID(t *testing.T) {
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

func Test_itemRepo_Remove(t *testing.T) {
	id1 := id.NewItemID()
	sid := schema.NewID()
	sfid := schema.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i1, _ := item.New().ID(id1).Fields(fs).Schema(sid).Build()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))
	repo := NewItem(client)
	ctx := context.Background()
	_ = repo.Save(ctx, i1)
	err := repo.Remove(ctx, i1.ID())
	assert.NoError(t, err)
	got, err := repo.FindByID(ctx, i1.ID())
	assert.Nil(t, got)
	assert.Error(t, err)
}
