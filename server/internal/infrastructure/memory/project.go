package memory

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/util"
	"github.com/samber/lo"
)

var Now = time.Now

func MockNow(t time.Time) func() {
	Now = func() time.Time { return t }
	return func() { Now = time.Now }
}

type Project struct {
	data util.SyncMap[id.ProjectID, *project.Project]
	f    repo.WorkspaceFilter
}

func NewProject() repo.Project {
	return &Project{
		data: util.SyncMap[id.ProjectID, *project.Project]{},
	}
}

func (r *Project) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &Project{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Project) FindByWorkspace(_ context.Context, wid id.WorkspaceID, _ *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	// TODO: implement pagination

	if !r.f.CanRead(wid) {
		return nil, nil, nil
	}

	result := r.data.FindAll(func(_ id.ProjectID, v *project.Project) bool {
		return v.Workspace() == wid
	})

	var startCursor, endCursor *usecase.Cursor
	if len(result) > 0 {
		startCursor = lo.ToPtr(usecase.Cursor(result[0].ID().String()))
		endCursor = lo.ToPtr(usecase.Cursor(result[len(result)-1].ID().String()))
	}

	return result, usecase.NewPageInfo(
		len(result),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Project) FindByIDs(_ context.Context, ids id.ProjectIDList) ([]*project.Project, error) {
	return r.data.FindAll(func(k id.ProjectID, v *project.Project) bool {
		return ids.Has(k) && r.f.CanRead(v.Workspace())
	}), nil
}

func (r *Project) FindByID(_ context.Context, pid id.ProjectID) (*project.Project, error) {
	p := r.data.Find(func(k id.ProjectID, v *project.Project) bool {
		return k == pid && r.f.CanRead(v.Workspace())
	})

	if p != nil {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) FindByPublicName(_ context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, nil
	}

	p := r.data.Find(func(_ id.ProjectID, v *project.Project) bool {
		return v.Alias() == name && r.f.CanRead(v.Workspace())
	})

	if p != nil {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) CountByWorkspace(_ context.Context, workspace id.WorkspaceID) (c int, err error) {

	if !r.f.CanRead(workspace) {
		return 0, nil
	}

	return r.data.CountAll(func(_ id.ProjectID, v *project.Project) bool {
		return v.Workspace() == workspace
	}), nil
}

func (r *Project) Save(_ context.Context, p *project.Project) error {
	if !r.f.CanWrite(p.Workspace()) {
		return repo.ErrOperationDenied
	}

	p.SetUpdatedAt(Now())
	r.data.Store(p.ID(), p)
	return nil
}

func (r *Project) Remove(_ context.Context, id id.ProjectID) error {
	if p, ok := r.data.Load(id); ok && r.f.CanWrite(p.Workspace()) {
		r.data.Delete(id)
		return nil
	}
	return rerror.ErrNotFound
}
