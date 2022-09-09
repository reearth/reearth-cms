package mongo

import (
	"context"
	"fmt"
	"regexp"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type assetRepo struct {
	client *mongox.ClientCollection
}

func NewAsset(client *mongox.Client) repo.Asset {
	r := &assetRepo{client: client.WithCollection("asset")}
	r.init()
	return r
}

func (r *assetRepo) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *assetRepo) FindByIDs(ctx context.Context, ids id.AssetIDList) ([]*asset.Asset, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}
	dst := make([]*asset.Asset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterAssets(ids, res), nil
}

func (r *assetRepo) FindByProject(ctx context.Context, id id.ProjectID, uFilter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
	var filter interface{} = bson.M{
		"project": id.String(),
	}

	if uFilter.Keyword != nil {
		filter = mongox.And(filter, "", bson.M{
			"filename": bson.M{
				"$regex": primitive.Regex{Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*uFilter.Keyword)), Options: "i"},
			},
		})
	}

	return r.paginate(ctx, filter, uFilter.Sort, uFilter.Pagination)
}

func (r *assetRepo) Save(ctx context.Context, asset *asset.Asset) error {
	doc, id := mongodoc.NewAsset(asset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *assetRepo) Update(ctx context.Context, a *asset.Asset) error {
	return r.client.UpdateMany(ctx, r.writeFilter(bson.M{
		"id": a.ID().String(),
	}), bson.M{
		"previewType": a.PreviewType().String(),
	})
}

func (r *assetRepo) Delete(ctx context.Context, id id.AssetID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{
		"id": id.String(),
	}))
}

func (r *assetRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"project"}, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "asset", i)
	}
}

func (r *assetRepo) paginate(ctx context.Context, filter interface{}, sort *asset.SortType, pagination *usecasex.Pagination) ([]*asset.Asset, *usecasex.PageInfo, error) {
	var sortstr *string
	if sort != nil {
		sortstr2 := string(*sort)
		sortstr = &sortstr2
	}

	var c mongodoc.AssetConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), sortstr, pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func (r *assetRepo) find(ctx context.Context, dst []*asset.Asset, filter interface{}) ([]*asset.Asset, error) {
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err2 := r.client.Find(ctx, r.readFilter(filter), &c); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, nil
}

func (r *assetRepo) findOne(ctx context.Context, filter interface{}) (*asset.Asset, error) {
	dst := make([]*asset.Asset, 0, 1)
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterAssets(ids []id.AssetID, rows []*asset.Asset) []*asset.Asset {
	res := make([]*asset.Asset, 0, len(ids))
	for _, id := range ids {
		var r2 *asset.Asset
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (r *assetRepo) readFilter(filter interface{}) interface{} {
	return filter
}

func (r *assetRepo) writeFilter(filter interface{}) interface{} {
	return filter
}
