package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type schemaRepo struct {
	client *mongodoc.ClientCollection
	f      *repo.WorkspaceFilter
}

func NewSchema(client *mongodoc.Client) repo.Schema {
	r := &schemaRepo{client: client.WithCollection("schema")}
	r.init()
	return r
}

func (r *schemaRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "schema", i)
	}
}

func (r *schemaRepo) Filtered(f repo.WorkspaceFilter) repo.Schema {
	return &schemaRepo{
		client: r.client,
		f:      lo.ToPtr(r.f.Merge(f)),
	}
}

func (r *schemaRepo) FindByID(ctx context.Context, schemaID id.SchemaID) (*schema.Schema, error) {
	return r.findOne(ctx, bson.M{
		"id": schemaID.String(),
	})
}

func (r *schemaRepo) FindByIDs(ctx context.Context, ids id.SchemaIDList) (schema.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make(schema.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}

	// prepare filters the results and sorts them according to original ids list
	return util.Map(ids, func(sId id.SchemaID) *schema.Schema {
		s, ok := lo.Find(res, func(s *schema.Schema) bool {
			return s.ID().Equal(sId)
		})
		if !ok {
			return nil
		}
		return s
	}), nil
}

func (r *schemaRepo) Save(ctx context.Context, schema *schema.Schema) error {
	// if !r.f.CanWrite(schema.) {
	// 	return repo.ErrOperationDenied
	// }
	doc, sId := mongodoc.NewSchema(schema)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *schemaRepo) Remove(ctx context.Context, schemaID id.SchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": schemaID.String()}))
}

func (r *schemaRepo) findOne(ctx context.Context, filter interface{}) (*schema.Schema, error) {
	dst := make(schema.List, 0, 1)
	c := mongodoc.SchemaConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *schemaRepo) find(ctx context.Context, dst schema.List, filter interface{}) (schema.List, error) {
	c := mongodoc.SchemaConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

// func (r *schemaRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) (schema.List, *usecase.PageInfo, error) {
// 	var c mongodoc.SchemaConsumer
// 	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), pagination, &c)
// 	if err != nil {
// 		return nil, nil, rerror.ErrInternalBy(err)
// 	}
// 	return c.Rows, pageInfo, nil
// }

func (r *schemaRepo) readFilter(filter interface{}) interface{} {
	if r.f == nil {
		return filter
	}
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *schemaRepo) writeFilter(filter interface{}) interface{} {
	if r.f == nil {
		return filter
	}
	return applyWorkspaceFilter(filter, r.f.Writable)
}
