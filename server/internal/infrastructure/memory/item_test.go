package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestItem_FindByID(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Build()
	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	r.data.Store(i.ID(), i)
	out, err := r.FindByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Equal(t, i, out)

	out2, err := r.FindByID(ctx, id.ItemID{})
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByIDs(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Build()
	i2, _ := item.New().NewID().Build()
	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	r.data.Store(i.ID(), i)
	r.data.Store(i2.ID(), i2)

	ids := id.ItemIDList{i.ID()}
	il := item.List{i}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, il, out)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByModel(t *testing.T) {
	ctx := context.Background()
	mid := id.NewModelID()
	i, _ := item.New().NewID().ModelID(mid).Build()
	i2, _ := item.New().NewID().ModelID(mid).Build()

	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	r.data.Store(i.ID(), i)
	r.data.Store(i2.ID(), i2)
	list := item.List{i, i2}
	out, err := r.FindByModel(ctx, mid)
	assert.NoError(t, err)
	assert.Equal(t, list, out)

	out2, err := r.FindByModel(ctx, id.ModelID{})
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, out2)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_Remove(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Build()
	i2, _ := item.New().NewID().Build()
	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	r.data.Store(i.ID(), i)
	r.data.Store(i2.ID(), i2)

	_ = r.Remove(ctx, i2.ID())
	assert.Equal(t, 1, r.data.Len())

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i.ID()))
}

func TestItem_RemoveAll(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Build()
	i2, _ := item.New().NewID().Build()
	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	r.data.Store(i.ID(), i)
	r.data.Store(i2.ID(), i2)

	ids := id.ItemIDList{i.ID(), i2.ID()}
	_ = r.RemoveAll(ctx, ids)
	assert.Equal(t, 0, r.data.Len())

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.RemoveAll(ctx, ids))
}

func TestItem_Save(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Build()

	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	_ = r.Save(ctx, i)
	assert.Equal(t, 1, r.data.Len())

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_SaveAll(t *testing.T) {
	ctx := context.Background()
	i1, _ := item.New().NewID().Build()
	i2, _ := item.New().NewID().Build()

	r := &Item{
		data: &util.SyncMap[id.ItemID, *item.Item]{},
	}
	_ = r.SaveAll(ctx, item.List{i1, i2})
	assert.Equal(t, 2, r.data.Len())

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i1.ID()))
}
