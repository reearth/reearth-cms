package mongogit

import (
	"context"
	"errors"
	"io"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Collection[T, MT any] struct {
	dataColl *mongox.Collection
	metaColl *mongox.Collection
}

func New[T, MT any](dataCollection, metaCollection *mongox.Collection) *Collection[T, MT] {
	return &Collection[T, MT]{dataColl: dataCollection, metaColl: metaCollection}
}

func NewCollection[T, MT any](client *mongox.Collection) *Collection[T, MT] {
	return &Collection[T, MT]{dataColl: client}
}

func (c *Collection[T, MT]) Client() *mongox.Collection {
	return c.dataColl
}

func (c *Collection[T, MT]) MetaDataClient() *mongox.Collection {
	return c.metaColl
}

func (c *Collection[T, MT]) FindOne(ctx context.Context, filter any, q version.Query, consumer mongox.Consumer) error {
	return c.dataColl.FindOne(ctx, apply(q, filter), consumer)
}

func (c *Collection[T, MT]) Find(ctx context.Context, filter any, q version.Query, consumer mongox.Consumer) error {
	return c.dataColl.Find(ctx, apply(q, filter), consumer)
}

func (c *Collection[T, MT]) Paginate(ctx context.Context, filter any, q version.Query, s *usecasex.Sort, p *usecasex.Pagination, consumer mongox.Consumer) (*usecasex.PageInfo, error) {
	return c.dataColl.Paginate(ctx, apply(q, filter), s, p, consumer)
}

func (c *Collection[T, MT]) Count(ctx context.Context, filter any, q version.Query) (int64, error) {
	return c.dataColl.Count(ctx, apply(q, filter))
}

func (c *Collection[T, MT]) PaginateAggregation(ctx context.Context, pipeline []any, q version.Query, s *usecasex.Sort, p *usecasex.Pagination, consumer mongox.Consumer) (*usecasex.PageInfo, error) {
	return c.dataColl.PaginateAggregation(ctx, applyToPipeline(q, pipeline), s, p, consumer)
}

func (c *Collection[T, MT]) CountAggregation(ctx context.Context, pipeline []any, q version.Query) (int64, error) {
	return c.dataColl.CountAggregation(ctx, applyToPipeline(q, pipeline))
}

func (c *Collection[T, MT]) SaveOne(ctx context.Context, id string, d T, parent *version.VersionOrRef) error {
	metadata, err := c.metadata(ctx, id)
	if err != nil {
		return err
	}
	if metadata != nil && metadata.Archived {
		return version.ErrArchived
	}

	doc := Document[T]{
		ObjectID: primitive.NewObjectIDFromTimestamp(util.Now()),
		Version:  version.New(),
		Data:     d,
	}

	parentVr := lo.FromPtrOr(parent, version.Latest.OrVersion())
	parentVr.Match(nil, func(r version.Ref) { doc.Refs = []version.Ref{r} })

	parentMeta, err := c.meta(ctx, id, parentVr.Ref())
	if err != nil {
		return err
	}
	if parentMeta == nil && !parentVr.IsRef(version.Latest) {
		return rerror.ErrNotFound
	}
	if parentMeta != nil {
		doc.Parents = []version.Version{parentMeta.Version}
	}

	if err := version.MatchVersionOrRef(parentVr, nil, func(r version.Ref) error {
		return c.UpdateRef(ctx, id, r, nil)
	}); err != nil {
		return err
	}

	if _, err := c.dataColl.Client().InsertOne(ctx, doc); err != nil {
		return rerror.ErrInternalBy(err)
	}

	if metadata != nil {
		if _, err := c.metaColl.Client().UpdateOne(ctx, bson.M{idKey: id}, bson.M{"$set": bson.M{updatedUtKey: doc.Timestamp()}}); err != nil {
			return rerror.ErrInternalBy(err)
		}
	} else {
		if _, err := c.metaColl.Client().InsertOne(ctx, &MetadataDocument[MT]{
			ID:        id,
			Archived:  false,
			CreatedAt: doc.Timestamp(),
			UpdatedAt: nil,
		}); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	return nil
}

func (c *Collection[T, MT]) UpdateMeta(ctx context.Context, id string, d MT) error {
	metadata, err := c.metadata(ctx, id)
	if err != nil {
		return err
	}
	if metadata == nil {
		return rerror.ErrNotFound
	}
	if metadata.Archived {
		return version.ErrArchived
	}

	if _, err := c.metaColl.Client().UpdateOne(ctx, bson.M{idKey: id}, bson.M{"$set": MetadataDocument[MT]{
		Metadata: d,
	}}); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (c *Collection[T, MT]) UpdateRef(ctx context.Context, id string, ref version.Ref, dest *version.VersionOrRef) error {
	if _, err := c.dataColl.Client().UpdateMany(ctx, bson.M{
		idKey:   id,
		refsKey: bson.M{"$in": []string{ref.String()}},
	}, bson.M{
		"$pull": bson.M{refsKey: ref},
	}); err != nil {
		return rerror.ErrInternalBy(err)
	}

	if dest != nil {
		if _, err := c.dataColl.Client().UpdateOne(ctx, apply(version.Eq(*dest), bson.M{
			idKey: id,
		}), bson.M{
			"$push": bson.M{refsKey: ref},
		}); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	return nil
}

func (c *Collection[T, MT]) IsArchived(ctx context.Context, filter any) (bool, error) {
	cons := mongox.SliceConsumer[MetadataDocument[MT]]{}
	q := mongox.And(filter, "", bson.M{
		archivedKey: true,
	})

	if err := c.metaColl.FindOne(ctx, q, &cons); err != nil {
		if errors.Is(rerror.ErrNotFound, err) || err == io.EOF {
			return false, nil
		}
		return false, err
	}
	return cons.Result[0].Archived, nil
}

func (c *Collection[T, MT]) ArchiveOne(ctx context.Context, filter bson.M, archived bool) error {
	d := bson.M{"$set": bson.M{archivedKey: archived}}
	_, err := c.metaColl.Client().UpdateOne(ctx, filter, d)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Collection[T, MT]) Timestamp(ctx context.Context, filter any, q version.Query) (time.Time, error) {
	consumer := mongox.SliceConsumer[Document[T]]{}
	f := apply(q, filter)
	if err := c.dataColl.Find(ctx, f, &consumer, options.Find().SetLimit(1).SetSort(bson.D{{Key: objectIDKey, Value: -1}})); err != nil {
		return time.Time{}, err
	}
	if len(consumer.Result) == 0 {
		return time.Time{}, rerror.ErrNotFound
	}
	return consumer.Result[0].Timestamp(), nil
}

func (c *Collection[T, MT]) RemoveOne(ctx context.Context, filter any) error {
	err := c.dataColl.RemoveAll(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return c.metaColl.RemoveOne(ctx, filter)
}

func (c *Collection[T, MT]) Empty(ctx context.Context) error {
	if err := c.dataColl.Client().Drop(ctx); err != nil {
		return err
	}
	return c.metaColl.Client().Drop(ctx)
}

func (c *Collection[T, MT]) Indexes() []mongox.Index {
	return []mongox.Index{
		{
			Name:   "mongogit_id",
			Key:    bson.D{{Key: idKey, Value: 1}, {Key: versionKey, Value: 1}},
			Unique: true,
		},
		{
			Name:   "mongogit_id_meta",
			Key:    bson.D{{Key: idKey, Value: 1}, {Key: metaKey, Value: 1}},
			Unique: true,
			Filter: bson.M{metaKey: true},
		},
		{
			Name: "mongogit_id_refs",
			Key:  bson.D{{Key: idKey, Value: 1}, {Key: refsKey, Value: 1}},
		},
		{
			Name: "mongogit_refs",
			Key:  bson.D{{Key: refsKey, Value: 1}},
		},
		{
			Name: "mongogit_parents",
			Key:  bson.D{{Key: parentsKey, Value: 1}},
		},
	}
}

func (c *Collection[T, MT]) meta(ctx context.Context, id string, v *version.VersionOrRef) (*Document[T], error) {
	consumer := mongox.SliceConsumer[Document[T]]{}
	q := apply(version.Eq(lo.FromPtrOr(v, version.Latest.OrVersion())), bson.M{
		idKey: id,
	})
	if err := c.dataColl.FindOne(ctx, q, &consumer); err != nil {
		if errors.Is(rerror.ErrNotFound, err) && (v == nil || v.IsRef(version.Latest)) {
			return nil, nil
		}
		return nil, err
	}
	return &consumer.Result[0], nil
}

func (c *Collection[T, MT]) metadata(ctx context.Context, id string) (*MetadataDocument[MT], error) {
	consumer := mongox.SliceConsumer[MetadataDocument[MT]]{}

	if err := c.metaColl.FindOne(ctx, bson.M{idKey: id}, &consumer); err != nil {
		if errors.Is(rerror.ErrNotFound, err) {
			return nil, nil
		}
		return nil, err
	}
	return &consumer.Result[0], nil
}
