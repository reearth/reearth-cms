package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	// TODO: the `publication.token` should be unique, this should be fixed in the future
	projectIndexes       = []string{"workspace"}
	projectUniqueIndexes = []string{"id"}
)

type ProjectRepo struct {
	client *mongox.Collection
	f      repo.WorkspaceFilter
}

func NewProject(client *mongox.Client) repo.Project {
	return &ProjectRepo{client: client.WithCollection("project")}
}

func (r *ProjectRepo) Init() error {
	idx := mongox.IndexFromKeys(projectIndexes, false)
	idx = append(idx, mongox.IndexFromKeys(projectUniqueIndexes, true)...)
	idx = append(idx, mongox.Index{
		Name:   "re_accessibility_keys_key",
		Key:    bson.D{{Key: "accessibility.keys.key", Value: 1}},
		Unique: true,
		Filter: bson.M{"accessibility.keys.key": bson.M{"$type": "string"}},
	})
	idx = append(idx, mongox.Index{
		Name:            "re_alias",
		Key:             bson.D{{Key: "alias", Value: 1}},
		Unique:          true,
		CaseInsensitive: true,
		Filter:          bson.M{"alias": bson.M{"$type": "string"}},
	})
	return createIndexes2(context.Background(), r.client, idx...)
}

func (r *ProjectRepo) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &ProjectRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *ProjectRepo) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *ProjectRepo) FindByIDs(ctx context.Context, ids id.ProjectIDList) (project.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func (r *ProjectRepo) FindByWorkspaces(ctx context.Context, ids accountdomain.WorkspaceIDList, f *interfaces.ProjectFilter) (project.List, *usecasex.PageInfo, error) {
	filter := bson.M{
		"workspace": bson.M{
			"$in": ids.Strings(),
		},
	}
	var s *usecasex.Sort
	var p *usecasex.Pagination
	if f != nil {
		s = f.Sort
		p = f.Pagination

		if f.Visibility != nil {
			filter["accessibility.visibility"] = f.Visibility.String()
		}
	}
	return r.paginate(ctx, filter, s, p)
}

func (r *ProjectRepo) FindByIDOrAlias(ctx context.Context, id project.IDOrAlias) (*project.Project, error) {
	pid := id.ID()
	alias := id.Alias()
	if pid.IsNil() && (alias == nil || *alias == "") {
		return nil, rerror.ErrNotFound
	}

	f := bson.M{}
	o := options.FindOne()
	if pid != nil {
		f["id"] = pid.String()
	}
	if alias != nil {
		f["alias"] = *alias
		o.SetCollation(&options.Collation{
			Locale:   "en",
			Strength: 2,
		})
	}

	return r.findOne(ctx, f, o)
}

func (r *ProjectRepo) IsAliasAvailable(ctx context.Context, alias string) (bool, error) {
	if alias == "" {
		return false, nil
	}

	// no need to filter by workspace, because alias is unique across all workspaces
	c, err := r.client.Count(ctx, bson.M{"alias": alias}, options.Count().SetCollation(&options.Collation{
		Locale:   "en",
		Strength: 2,
	}))

	return c == 0 && err == nil, err
}

func (r *ProjectRepo) FindByPublicAPIKey(ctx context.Context, key string) (*project.Project, error) {
	if key == "" {
		return nil, rerror.ErrNotFound
	}
	return r.findOne(ctx, bson.M{
		"accessibility.keys.key": key,
	})
}

func (r *ProjectRepo) CountByWorkspace(ctx context.Context, workspace accountdomain.WorkspaceID) (int, error) {
	count, err := r.client.Count(ctx, bson.M{
		"workspace": workspace.String(),
	})
	return int(count), err
}

func (r *ProjectRepo) Save(ctx context.Context, project *project.Project) error {
	if !r.f.CanWrite(project.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *ProjectRepo) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *ProjectRepo) find(ctx context.Context, filter any) (project.List, error) {
	c := mongodoc.NewProjectConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *ProjectRepo) findOne(ctx context.Context, filter any, options ...*options.FindOneOptions) (*project.Project, error) {
	c := mongodoc.NewProjectConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c, options...); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *ProjectRepo) paginate(ctx context.Context, filter bson.M, s *usecasex.Sort, p *usecasex.Pagination) (project.List, *usecasex.PageInfo, error) {
	c := mongodoc.NewProjectConsumer()
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), s, p, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Result, pageInfo, nil
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

func (r *ProjectRepo) readFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *ProjectRepo) writeFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
