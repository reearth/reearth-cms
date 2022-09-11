package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory/memorygit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
)

type Item struct {
	data *memorygit.VersionedSyncMap[item.ID, *item.Item]
	err  error
}

func NewItem() repo.Item {
	return &Item{
		data: memorygit.NewVersionedSyncMap[item.ID, *item.Item](),
	}
}

func (r *Item) FindByID(ctx context.Context, itemID id.ItemID) (*item.Item, error) {
	if r.err != nil {
		return nil, r.err
	}

	item, ok := r.data.Load(itemID, version.Latest.OrVersion())
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return item, nil
}

func (r *Item) FindByIDs(ctx context.Context, list id.ItemIDList) (item.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.data.LoadAll(list, version.Latest.OrVersion()), nil
}

func (r *Item) FindAllVersionsByID(ctx context.Context, id id.ItemID) ([]*version.Value[*item.Item], error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.data.LoadAllVersions(id).All(), nil
}

func (r *Item) Save(ctx context.Context, t *item.Item) error {
	if r.err != nil {
		return r.err
	}

	r.data.SaveOne(t.ID(), t, nil)
	return nil
}

func (r *Item) Remove(ctx context.Context, itemID id.ItemID) error {
	if r.err != nil {
		return r.err
	}

	r.data.Delete(itemID)
	return nil
}

func (r *Item) Archive(ctx context.Context, itemID id.ItemID, archived bool) error {
	if r.err != nil {
		return r.err
	}

	r.data.Archive(itemID, archived)
	return nil
}

func SetItemError(r repo.Item, err error) {
	r.(*Item).err = err
}
