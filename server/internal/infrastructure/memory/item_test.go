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
	il := []*item.Item{i}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, il, out)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}
