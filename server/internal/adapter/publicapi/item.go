package publicapi

import (
	"context"
	"errors"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
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
	sMap, err := getGroupSchemas(ctx, item.List{itv}, s)
	if err != nil {
		return Item{}, err
	}

	return NewItem(itv, s, sMap[itv.ID()], assets, c.assetUrlResolver, getReferencedItems(ctx, itv)), nil
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
	sMap, err := getGroupSchemas(ctx, items.Unwrap(), s)

	itms, err := util.TryMap(items.Unwrap(), func(i *item.Item) (Item, error) {

		if err != nil {
			return Item{}, err
		}
		return NewItem(i, s, sMap[i.ID()], assets, c.assetUrlResolver, getReferencedItems(ctx, i)), nil
	})
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	res := NewListResult(itms, pi, p.Pagination)
	return res, s, nil
}

func getGroupSchemas(ctx context.Context, il item.List, ss *schema.Schema) (map[id.ItemID]schema.List, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	igMap := map[id.ItemID]id.GroupIDList{}
	var gIds id.GroupIDList

	for _, i := range il {
		gf := i.Fields().FieldsByType(value.TypeGroup)
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
				igMap[i.ID()] = igMap[i.ID()].Add(gid)
			}
		}
	}

	gl, err := uc.Group.FindByIDs(ctx, gIds, op)
	if err != nil {
		return nil, err
	}

	sgIds := util.Map(gl, func(g *group.Group) id.SchemaID {
		return g.Schema()
	})
	sl, err := uc.Schema.FindByIDs(ctx, sgIds, op)
	if err != nil {
		return nil, err
	}

	res := map[id.ItemID]schema.List{}
	for itm, gIDList := range igMap {
		for _, gid := range gIDList {
			g, ok := lo.Find(gl, func(grp *group.Group) bool {
				return grp.ID() == gid
			})
			if !ok {
				continue
			}
			s := sl.Schema(g.Schema().Ref())
			res[itm] = append(res[itm], s)
		}
	}
	return res, nil
}

func getReferencedItems(ctx context.Context, i *item.Item) []Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	var vi []Item
	for _, f := range i.Fields() {
		if f.Type() != value.TypeReference {
			continue
		}
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := uc.Item.FindByID(ctx, iid, op)
			if err != nil || ii == nil {
				continue
			}
			s, err := uc.Schema.FindByID(ctx, ii.Value().Schema(), op)
			if err != nil {
				continue
			}
			vi = append(vi, NewItem(ii.Value(), s, nil, nil, nil, nil))
		}
	}

	return vi
}
