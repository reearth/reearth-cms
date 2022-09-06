package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type schemaRepo struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
}

func NewSchema(client *mongox.Client) repo.Schema {
	r := &schemaRepo{client: client.WithCollection("schema")}
	r.init()
	return r
}

func (r *schemaRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"id"}, nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "schema", i)
	}
}

func (r *schemaRepo) Filtered(f repo.WorkspaceFilter) repo.Schema {
	return &schemaRepo{
		client: r.client,
		f:      r.f.Merge(f),
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

	res, err := r.find(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	})
	if err != nil {
		return nil, err
	}

	// prepare filters the results and sorts them according to original ids list
	return util.Map(ids, func(sid id.SchemaID) *schema.Schema {
		s, ok := lo.Find(res, func(s *schema.Schema) bool {
			return s.ID() == sid
		})
		if !ok {
			return nil
		}
		return s
	}), nil
}

func (r *schemaRepo) Save(ctx context.Context, schema *schema.Schema) error {
	if !r.f.CanWrite(schema.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, sId := mongodoc.NewSchema(schema)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *schemaRepo) Remove(ctx context.Context, schemaID id.SchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": schemaID.String()}))
}

func (r *schemaRepo) findOne(ctx context.Context, filter any) (*schema.Schema, error) {
	c := mongodoc.NewSchemaConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *schemaRepo) find(ctx context.Context, filter any) (schema.List, error) {
	c := mongodoc.NewSchemaConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *schemaRepo) paginate(ctx context.Context, filter bson.M, pagination *usecasex.Pagination) (schema.List, *usecasex.PageInfo, error) {
	c := mongodoc.NewSchemaConsumer()
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func (r *schemaRepo) readFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *schemaRepo) writeFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
