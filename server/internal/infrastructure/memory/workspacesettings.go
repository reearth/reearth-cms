package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type WorkspaceSettingsRepo struct {
	data *util.SyncMap[accountdomain.WorkspaceID, *workspacesettings.WorkspaceSettings]
	f    repo.WorkspaceFilter
	err  error
}

func NewWorkspaceSettings() repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		data: &util.SyncMap[accountdomain.WorkspaceID, *workspacesettings.WorkspaceSettings]{},
	}
}

func (r *WorkspaceSettingsRepo) Filtered(f repo.WorkspaceFilter) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *WorkspaceSettingsRepo) FindByID(_ context.Context, wid accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanRead(wid) {
		return nil, repo.ErrOperationDenied
	}

	if ws, ok := r.data.Load(wid); ok {
		return ws.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *WorkspaceSettingsRepo) FindByIDs(_ context.Context, ids accountdomain.WorkspaceIDList) (workspacesettings.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !lo.EveryBy(ids, r.f.CanRead) {
		return nil, repo.ErrOperationDenied
	}
	if len(ids) == 0 {
		return nil, nil
	}

	// keep the order of the given IDs and skip unknown ones, like mongo
	res := make(workspacesettings.List, 0, len(ids))
	for _, wid := range ids {
		if ws, ok := r.data.Load(wid); ok {
			res = append(res, ws.Clone())
		}
	}
	return res, nil
}

func (r *WorkspaceSettingsRepo) Save(_ context.Context, ws *workspacesettings.WorkspaceSettings) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(ws.ID()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(ws.ID(), ws.Clone())
	return nil
}

func (r *WorkspaceSettingsRepo) Remove(_ context.Context, wid accountdomain.WorkspaceID) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(wid) {
		return repo.ErrOperationDenied
	}

	if _, ok := r.data.Load(wid); !ok {
		return rerror.ErrNotFound
	}
	r.data.Delete(wid)
	return nil
}

func SetWorkspaceSettingsError(r repo.WorkspaceSettings, err error) {
	r.(*WorkspaceSettingsRepo).err = err
}
