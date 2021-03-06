package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/log"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
)

type projectRepo struct {
	client *mongodoc.ClientCollection
	f      repo.WorkspaceFilter
}

func NewProject(client *mongodoc.Client) repo.Project {
	r := &projectRepo{client: client.WithCollection("project")}
	r.init()
	return r
}

func (r *projectRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"alias", "workspace"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "project", i)
	}
}

func (r *projectRepo) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &projectRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *projectRepo) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *projectRepo) FindByIDs(ctx context.Context, ids id.ProjectIDList) (project.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make(project.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func (r *projectRepo) FindByWorkspace(ctx context.Context, id id.WorkspaceID, pagination *usecase.Pagination) (project.List, *usecase.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecase.EmptyPageInfo(), nil
	}
	return r.paginate(ctx, bson.M{
		"workspace": id.String(),
	}, pagination)
}

func (r *projectRepo) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return r.findOne(ctx, bson.M{
		"alias": name,
	})
}

func (r *projectRepo) CountByWorkspace(ctx context.Context, workspace id.WorkspaceID) (int, error) {
	count, err := r.client.Count(ctx, bson.M{
		"workspace": workspace.String(),
	})
	return int(count), err
}

func (r *projectRepo) Save(ctx context.Context, project *project.Project) error {
	if !r.f.CanWrite(project.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *projectRepo) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *projectRepo) find(ctx context.Context, dst project.List, filter interface{}) (project.List, error) {
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *projectRepo) findOne(ctx context.Context, filter interface{}) (*project.Project, error) {
	dst := make(project.List, 0, 1)
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *projectRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) (project.List, *usecase.PageInfo, error) {
	var c mongodoc.ProjectConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func filterProjects(ids []id.ProjectID, rows project.List) project.List {
	res := make(project.List, 0, len(ids))
	for _, id := range ids {
		for _, r := range rows {
			if r.ID() == id {
				res = append(res, r)
				break
			}
		}
	}
	return res
}

func (r *projectRepo) readFilter(filter interface{}) interface{} {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *projectRepo) writeFilter(filter interface{}) interface{} {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
