package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type Item struct {
	data *util.SyncMap[item.ID, *item.Item]
	err  error
}

func NewItem() repo.Item {
	return &Item{
		data: &util.SyncMap[item.ID, *item.Item]{},
	}
}

func (r *Item) FindByID(ctx context.Context, itemID id.ItemID) (*item.Item, error) {
	if r.err != nil {
		return nil, r.err
	}

	return rerror.ErrIfNil(r.data.Find(func(key id.ItemID, value *item.Item) bool {
		return key == itemID
	}), rerror.ErrNotFound)
}

func (r *Item) FindByIDs(ctx context.Context, list id.ItemIDList) (item.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := r.data.FindAll(func(key id.ItemID, value *item.Item) bool {
		return list.Has(key)
	})
	slices.SortFunc(res, func(a, b *item.Item) bool { return a.ID().Compare(b.ID()) < 0 })
	return res, nil
}

func (r *Item) Save(ctx context.Context, t *item.Item) error {
	if r.err != nil {
		return r.err
	}

	r.data.Store(t.ID(), t)
	return nil
}

func (r *Item) Remove(ctx context.Context, itemID id.ItemID) error {
	if r.err != nil {
		return r.err
	}

	r.data.Delete(itemID)
	return nil
}

func (r *Item) Archive(ctx context.Context, itemID id.ItemID) error {
	return r.Remove(ctx, itemID)
}

func SetItemError(r repo.Item, err error) {
	r.(*Item).err = err
}
