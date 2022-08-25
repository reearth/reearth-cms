package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
)

type Item interface {
	FindByModel(context.Context, id.ModelID) ([]*item.Item, error)
	FindByIDs(context.Context, id.ItemIDList) ([]*item.Item, error)
	FindByID(context.Context, id.ItemID) (*item.Item, error)
	Save(context.Context, *item.Item) error
	SaveAll(context.Context, []*item.Item) error
	Remove(context.Context, id.ItemID) error
	RemoveAll(context.Context, id.ItemIDList) error
}
