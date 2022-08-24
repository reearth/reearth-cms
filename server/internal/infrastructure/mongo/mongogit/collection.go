package mongogit

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Collection struct {
	client *mongodoc.ClientCollection
}

func NewCollection(client *mongodoc.ClientCollection) *Collection {
	return &Collection{client: client}
}

func (c *Collection) Client() *mongodoc.ClientCollection {
	return c.client
}

func (c *Collection) FindOne(ctx context.Context, filter any, version Query, consumer mongodoc.Consumer) error {
	return c.client.FindOne(ctx, applyQuery(version, filter), consumer)
}

func (c *Collection) Find(ctx context.Context, filter any, version Query, consumer mongodoc.Consumer) error {
	return c.client.Find(ctx, applyQuery(version, filter), consumer)
}

func (c *Collection) All(ctx context.Context, id string, consumer mongodoc.Consumer) error {
	return c.client.Find(ctx, bson.M{"id": id, metaKey: bson.M{"$exists": false}}, consumer)
}

func (c *Collection) Paginate(ctx context.Context, filter any, version Query, p *usecase.Pagination, consumer mongodoc.Consumer) (*usecase.PageInfo, error) {
	return c.client.Paginate(ctx, applyQuery(version, filter), p, consumer)
}

func (c *Collection) SaveOne(ctx context.Context, id string, replacement any, vr *version.VersionOrRef) error {
	if archived, err := c.IsArchived(ctx, id); err != nil {
		return err
	} else if archived {
		return version.ErrArchived
	}

	actualVr := lo.FromPtrOr(vr, version.Latest.OrVersion())

	meta, err := c.meta(ctx, id, actualVr.Ref())
	if err != nil {
		return err
	}

	var newmeta Meta
	var refs []version.Ref
	actualVr.Match(nil, func(r version.Ref) { refs = []version.Ref{r} })
	if meta == nil {
		if !actualVr.IsRef(version.Latest) {
			return rerror.ErrNotFound // invalid dest
		}
		newmeta = Meta{
			Version: version.New(),
			Refs:    refs,
		}
	} else {
		newmeta = Meta{
			Version: version.New(),
			Parents: []version.Version{meta.Version},
			Refs:    refs,
		}
	}

	if err := version.MatchVersionOrRef(actualVr, nil, func(r version.Ref) error {
		return c.UpdateRef(ctx, id, r, nil)
	}); err != nil {
		return err
	}

	newReplacement, err := newmeta.Apply(replacement)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	if _, err := c.client.Collection().InsertOne(ctx, newReplacement); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (c *Collection) UpdateRef(ctx context.Context, id string, ref version.Ref, dest *version.VersionOrRef) error {
	current, err := c.meta(ctx, id, ref.OrVersion().Ref())
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return err
	}

	if current != nil {
		if _, err := c.client.Collection().UpdateOne(ctx, bson.M{
			"id":       id,
			versionKey: current.Version,
		}, bson.M{
			"$pull": bson.M{refsKey: ref},
		}); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	if dest != nil {
		if _, err := c.client.Collection().UpdateOne(ctx, applyQuery(dest, bson.M{
			"id": id,
		}), bson.M{
			"$push": bson.M{refsKey: ref},
		}); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	return nil
}

func (c *Collection) IsArchived(ctx context.Context, id string) (bool, error) {
	cons := mongodoc.SliceConsumer[Metadata]{}
	if err := c.client.FindOne(ctx, bson.M{
		"id":    id,
		metaKey: true,
	}, &cons); err != nil {
		if errors.Is(rerror.ErrNotFound, err) {
			return false, nil
		}
		return false, err
	}
	return cons.Result[0].Archived, nil
}

func (c *Collection) ArchiveOne(ctx context.Context, id string, archived bool) error {
	if !archived {
		_, err := c.client.Collection().DeleteOne(ctx, bson.M{"id": id, metaKey: true})
		if err != nil {
			return rerror.ErrInternalBy(err)
		}
		return nil
	}

	_, err := c.client.Collection().ReplaceOne(ctx, bson.M{"id": id, metaKey: true}, Metadata{
		ID:       id,
		Meta:     true,
		Archived: archived,
	}, options.Replace().SetUpsert(true))
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Collection) RemoveOne(ctx context.Context, id string) error {
	return c.client.RemoveAll(ctx, bson.M{"id": id})
}

func (c *Collection) Empty(ctx context.Context) error {
	return c.client.Collection().Drop(ctx)
}

func (c *Collection) CreateIndexes(ctx context.Context, keys, uniqueKeys []string) error {
	indexes := append(
		[]mongo.IndexModel{
			{Keys: []string{"id", versionKey}, Options: options.Index().SetUnique(true)},
			{Keys: []string{"id", metaKey}, Options: options.Index().SetUnique(true)},
			{Keys: []string{refsKey}},
			{Keys: []string{parentsKey}},
		},
		append(
			util.Map(keys, func(k string) mongo.IndexModel {
				return mongo.IndexModel{Keys: []string{k}}
			}),
			util.Map(uniqueKeys, func(k string) mongo.IndexModel {
				return mongo.IndexModel{Keys: []string{k}, Options: options.Index().SetUnique(true)}
			})...,
		)...,
	)

	if _, err := c.client.Collection().Indexes().CreateMany(ctx, indexes); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Collection) meta(ctx context.Context, id string, vq Query) (*Meta, error) {
	consumer := mongodoc.SliceConsumer[Meta]{}
	if err := c.client.FindOne(ctx, applyQuery(vq, bson.M{
		"id": id,
	}), &consumer); err != nil {
		if errors.Is(rerror.ErrNotFound, err) && (vq == nil || vq.IsRef(version.Latest)) {
			return nil, nil
		}
		return nil, err
	}
	return &consumer.Result[0], nil
}
