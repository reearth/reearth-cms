package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
)

type Item interface {
	FindByID(context.Context, id.ItemID) (*item.Item, error)
	Save(context.Context, *item.Item) error
	Remove(context.Context, id.ItemID) error
}
