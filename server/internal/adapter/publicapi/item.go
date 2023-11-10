package publicapi

import (
	"context"
	"errors"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/value"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (c *Controller) GetItem(ctx context.Context, prj, mkey, i string) (Item, error) {
	pr, err := c.checkProject(ctx, prj)
	if err != nil {
		return Item{}, err
	}

	if mkey == "" {
		return Item{}, rerror.ErrNotFound
	}

	iid, err := id.ItemIDFrom(i)
	if err != nil {
		return Item{}, rerror.ErrNotFound
	}

	it, err := c.usecases.Item.FindPublicByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Item{}, rerror.ErrNotFound
		}
		return Item{}, err
	}

	itv := it.Value()
	m, err := c.usecases.Model.FindByID(ctx, itv.Model(), nil)
	if err != nil {
		return Item{}, err
	}

	if m.Key().String() != mkey || !m.Public() {
		return Item{}, rerror.ErrNotFound
	}

	s, err := c.usecases.Schema.FindByID(ctx, m.Schema(), nil)
	if err != nil {
		return Item{}, err
	}

	var assets asset.List
	if pr.Publication().AssetPublic() {
		assets, err = c.usecases.Asset.FindByIDs(ctx, itv.AssetIDs(), nil)
		if err != nil {
			return Item{}, err
		}
	}
	sgl, err := getGroupSchemas(ctx, itv, s)

	if err != nil {
		return Item{}, err
	}
	return NewItem(itv, s, sgl, assets, c.assetUrlResolver), nil
}

func (c *Controller) GetItems(ctx context.Context, prj, model string, p ListParam) (ListResult[Item], *schema.Schema, error) {
	pr, err := c.checkProject(ctx, prj)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	m, err := c.usecases.Model.FindByKey(ctx, pr.ID(), model, nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}
	if !m.Public() {
		return ListResult[Item]{}, nil, rerror.ErrNotFound
	}

	s, err := c.usecases.Schema.FindByID(ctx, m.Schema(), nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	items, pi, err := c.usecases.Item.FindPublicByModel(ctx, m.ID(), p.Pagination, nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	var assets asset.List
	if pr.Publication().AssetPublic() {
		assetIDs := lo.FlatMap(items.Unwrap(), func(i *item.Item, _ int) []id.AssetID {
			return i.AssetIDs()
		})
		assets, err = c.usecases.Asset.FindByIDs(ctx, assetIDs, nil)
		if err != nil {
			return ListResult[Item]{}, nil, err
		}
	}

	itms, err := util.TryMap(items.Unwrap(), func(i *item.Item) (Item, error) {
		sgl, err := getGroupSchemas(ctx, i, s)

		if err != nil {
			return Item{}, err
		}
		return NewItem(i, s, sgl, assets, c.assetUrlResolver), nil
	})
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	res := NewListResult(itms, pi, p.Pagination)
	return res, s, nil
}

func getGroupSchemas(ctx context.Context, i *item.Item, ss *schema.Schema) (schema.List, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	gf := i.Fields().FieldsByType(value.TypeGroup)

	var gIds id.GroupIDList
	for _, field := range gf {
		gsf := ss.Field(field.FieldID())

		if gsf != nil {
			var gid id.GroupID
			gsf.TypeProperty().Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					gid = f.Group()
				},
			})
			gIds = gIds.Add(gid)

		}
	}
	gl, err := uc.Group.FindByIDs(ctx, gIds, op)
	if err != nil {
		return nil, err
	}

	sgIds := util.Map(gl, func(g *group.Group) id.SchemaID {
		return g.Schema()
	})

	return uc.Schema.FindByIDs(ctx, sgIds, op)
}
