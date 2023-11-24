package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettingsRepo struct {
	client *mongox.Collection
	f      repo.WorkspaceFilter
}

func NewWorkspaceSettings(client *mongox.Client) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{client: client.WithCollection("workspacesettings")}
}

func (r *WorkspaceSettingsRepo) Init() error {
	return createIndexes(context.Background(), r.client, projectIndexes, projectUniqueIndexes)
}

func (r *WorkspaceSettingsRepo) FindByID(ctx context.Context, id id.WorkspaceSettingsID) (*workspacesettings.WorkspaceSettings, error) {
	filter := bson.M{
		"id": id.String(),
	}
	res, err := r.findOne(ctx, filter)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *WorkspaceSettingsRepo) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error) {
	filter := bson.M{
		"workspaceid": id.String(),
	}
	res, err := r.findOne(ctx, filter)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *WorkspaceSettingsRepo) FindByIDs(ctx context.Context, ids id.WorkspaceSettingsIDList) ([]*workspacesettings.WorkspaceSettings, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": util.Map(ids, func(id id.WorkspaceSettingsID) string {
				return id.String()
			}),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterWorkspaceSettings(ids, res), nil
}

func (r *WorkspaceSettingsRepo) Save(ctx context.Context, ws *workspacesettings.WorkspaceSettings) error {
	if !r.f.CanWrite(ws.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewWorkspaceSettings(ws)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *WorkspaceSettingsRepo) Remove(ctx context.Context, id accountdomain.WorkspaceID) error {
	if !r.f.CanWrite(id) {
		return repo.ErrOperationDenied
	}
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"workspaceid": id.String()}))
}

func (r *WorkspaceSettingsRepo) find(ctx context.Context, filter any) ([]*workspacesettings.WorkspaceSettings, error) {
	c := mongodoc.NewWorkspaceSettingsConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *WorkspaceSettingsRepo) findOne(ctx context.Context, filter any) (*workspacesettings.WorkspaceSettings, error) {
	c := mongodoc.NewWorkspaceSettingsConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterWorkspaceSettings(ids id.WorkspaceSettingsIDList, rows []*workspacesettings.WorkspaceSettings) []*workspacesettings.WorkspaceSettings {
	res := make([]*workspacesettings.WorkspaceSettings, 0, len(ids))
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

func (r *WorkspaceSettingsRepo) readFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *WorkspaceSettingsRepo) writeFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
