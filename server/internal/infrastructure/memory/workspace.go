package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/util"
)

type Workspace struct {
	data util.SyncMap[id.WorkspaceID, *user.Workspace]
}

func NewWorkspace() repo.Workspace {
	return &Workspace{
		data: util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
}

func (r *Workspace) FindByUser(ctx context.Context, i id.UserID) (user.WorkspaceList, error) {
	if res := r.data.FindAll(func(key id.WorkspaceID, value *user.Workspace) bool {
		return value.Members().ContainsUser(i)
	}); res != nil {
		return res, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Workspace) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) (user.WorkspaceList, error) {
	res := r.data.FindAll(func(key id.WorkspaceID, value *user.Workspace) bool {
		var res bool
		for _, wid := range ids {
			res = res || key == wid
		}
		return res
	})

	return res, nil
}

func (r *Workspace) FindByID(ctx context.Context, v id.WorkspaceID) (*user.Workspace, error) {
	if res := r.data.Find(func(key id.WorkspaceID, value *user.Workspace) bool {
		return key == v
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *Workspace) Save(ctx context.Context, t *user.Workspace) error {
	r.data.Store(t.ID(), t)
	return nil
}

func (r *Workspace) SaveAll(ctx context.Context, workspaces []*user.Workspace) error {
	for _, t := range workspaces {
		r.data.Store(t.ID(), t)
	}
	return nil
}

func (r *Workspace) Remove(ctx context.Context, wid id.WorkspaceID) error {
	r.data.Delete(wid)
	return nil
}

func (r *Workspace) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	for _, wid := range ids {
		r.data.Delete(wid)
	}
	return nil
}
