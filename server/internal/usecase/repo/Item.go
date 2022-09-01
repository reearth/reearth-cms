package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
)

type Item interface {
	//FindByIDs(context.Context, id.ItemIDList) (item.List, error)
	FindByID(context.Context, id.ItemID) (*item.Item, error)
	Save(context.Context, *item.Item) error
	//SaveAll(context.Context, item.List) error

}
