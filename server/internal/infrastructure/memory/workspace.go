package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Workspace struct {
	lock sync.Mutex
	data map[id.WorkspaceID]*user.Workspace
}

func NewWorkspace() repo.Workspace {
	return &Workspace{
		data: map[id.WorkspaceID]*user.Workspace{},
	}
}

func (r *Workspace) FindByUser(ctx context.Context, i id.UserID) (user.WorkspaceList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := user.WorkspaceList{}
	for _, d := range r.data {
		if d.Members().ContainsUser(i) {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *Workspace) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) (user.WorkspaceList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := user.WorkspaceList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			result = append(result, d)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *Workspace) FindByID(ctx context.Context, id id.WorkspaceID) (*user.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return d, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Workspace) Save(ctx context.Context, t *user.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[t.ID()] = t
	return nil
}

func (r *Workspace) SaveAll(ctx context.Context, workspaces []*user.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, t := range workspaces {
		r.data[t.ID()] = t
	}
	return nil
}

func (r *Workspace) Remove(ctx context.Context, id id.WorkspaceID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.data, id)
	return nil
}

func (r *Workspace) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		delete(r.data, id)
	}
	return nil
}
