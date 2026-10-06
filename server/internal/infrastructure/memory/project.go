package memory

import (
	"context"
	"slices"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Project struct {
	data *util.SyncMap[id.ProjectID, *project.Project]
	f    repo.WorkspaceFilter
	pf   repo.ProjectFilter
	err  error
}

func NewProject() repo.Project {
	return &Project{
		data: &util.SyncMap[id.ProjectID, *project.Project]{},
	}
}

func (r *Project) Filtered(wf repo.WorkspaceFilter, pf repo.ProjectFilter) repo.Project {
	return &Project{
		data: r.data,
		f:    r.f.Merge(wf),
		pf:   r.pf.Merge(pf),
		err:  r.err,
	}
}

func (r *Project) Search(_ context.Context, f interfaces.ProjectFilter) (project.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	matchProjectKeyword := func(p *project.Project, keyword string) bool {
		if p.ID().String() == keyword {
			return true
		}
		k := strings.ToLower(keyword)
		return lo.SomeBy(append([]string{p.Name(), p.Alias(), p.Description()}, p.Topics()...), func(s string) bool {
			return strings.Contains(strings.ToLower(s), k)
		})
	}

	hasAllTopics := func(p *project.Project, topics []string) bool {
		return lo.EveryBy(topics, func(t string) bool {
			return lo.ContainsBy(p.Topics(), func(pt string) bool { return strings.EqualFold(pt, t) })
		})
	}

	result := project.List(r.data.FindAll(func(_ id.ProjectID, p *project.Project) bool {
		if f.WorkspaceIds != nil && len(*f.WorkspaceIds) > 0 && !f.WorkspaceIds.Has(p.Workspace()) {
			return false
		}
		if f.Visibility != nil && p.Accessibility().Visibility() != *f.Visibility {
			return false
		}
		if f.Keyword != nil && *f.Keyword != "" && !matchProjectKeyword(p, *f.Keyword) {
			return false
		}
		if !hasAllTopics(p, f.Topics) {
			return false
		}
		return r.canRead(p)
	}))

	// if no pagination is specified, return all results sorted by ID with page info
	// this behavior is not consistent with the mongo implementation, but it is more useful for testing and debugging
	if f.Pagination == nil {
		result = result.SortByID()
		var startCursor, endCursor *usecasex.Cursor
		if len(result) > 0 {
			startCursor = new(usecasex.Cursor(result[0].ID().String()))
			endCursor = new(usecasex.Cursor(result[len(result)-1].ID().String()))
		}
		return result, usecasex.NewPageInfo(int64(len(result)), startCursor, endCursor, false, true), nil
	}

	return r.pager().paginate(result, f.Sort, f.Pagination)
}

func (r *Project) FindByIDs(_ context.Context, ids id.ProjectIDList) (project.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k id.ProjectID, p *project.Project) bool {
		return ids.Has(k) && r.canRead(p)
	})

	return project.List(result).OrderByIds(ids), nil
}

func (r *Project) FindByID(_ context.Context, pid id.ProjectID) (*project.Project, error) {
	if r.err != nil {
		return nil, r.err
	}

	p := r.data.Find(func(k id.ProjectID, v *project.Project) bool {
		return k == pid && r.canRead(v)
	})

	if p != nil {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) FindByIDOrAlias(_ context.Context, wId accountdomain.WorkspaceID, q project.IDOrAlias) (*project.Project, error) {
	if r.err != nil {
		return nil, r.err
	}

	pid := q.ID()
	alias := q.Alias()
	if pid == nil && (alias == nil || *alias == "") {
		return nil, rerror.ErrNotFound
	}

	p := r.data.Find(func(k id.ProjectID, v *project.Project) bool {
		if v.Workspace() != wId {
			return false
		}
		if pid != nil && k != *pid {
			return false
		}
		// aliases are compared case-insensitively, as the mongo collation does
		if alias != nil && !strings.EqualFold(v.Alias(), *alias) {
			return false
		}
		return r.canRead(v)
	})

	if p != nil {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) IsAliasAvailable(_ context.Context, wId accountdomain.WorkspaceID, name string) (bool, error) {
	if r.err != nil {
		return false, r.err
	}

	if name == "" {
		return false, nil
	}

	// the read filter is not applied: the alias must be unique in the workspace
	// regardless of what the caller can read
	p := r.data.Find(func(_ id.ProjectID, v *project.Project) bool {
		return v.Workspace() == wId && strings.EqualFold(v.Alias(), name)
	})

	return p == nil, nil
}

func (r *Project) FindByPublicAPIKey(_ context.Context, key string) (*project.Project, error) {
	if r.err != nil {
		return nil, r.err
	}

	if key == "" {
		return nil, rerror.ErrNotFound
	}

	p := r.data.Find(func(_ id.ProjectID, p *project.Project) bool {
		return p.Accessibility().APIKeyByKey(key) != nil && r.canRead(p)
	})

	if p != nil {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) CountByWorkspace(_ context.Context, workspace accountdomain.WorkspaceID) (c int, err error) {
	if r.err != nil {
		return 0, r.err
	}

	return r.data.CountAll(func(_ id.ProjectID, v *project.Project) bool {
		return v.Workspace() == workspace && r.canRead(v)
	}), nil
}

func (r *Project) Save(_ context.Context, p *project.Project) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(p.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(p.ID(), p)
	return nil
}

func (r *Project) Star(_ context.Context, projectID id.ProjectID, userID accountdomain.UserID) (*project.Project, error) {
	if r.err != nil {
		return nil, r.err
	}

	p, ok := r.data.Load(projectID)
	if !ok {
		return nil, rerror.ErrNotFound
	}

	isPublic := p.Accessibility().Visibility() == project.VisibilityPublic
	canRead := r.f.CanRead(p.Workspace()) || r.pf.CanRead(p.ID())
	if !canRead && !isPublic {
		return nil, repo.ErrOperationDenied
	}

	if slices.Contains(p.StarredBy(), userID.String()) {
		p.Unstar(userID)
	} else {
		p.Star(userID)
	}

	r.data.Store(projectID, p)
	return p, nil
}

func (r *Project) Remove(_ context.Context, id id.ProjectID) error {
	if r.err != nil {
		return r.err
	}

	if p, ok := r.data.Load(id); ok && r.f.CanWrite(p.Workspace()) {
		r.data.Delete(id)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *Project) pager() pager[*project.Project] {
	return pager[*project.Project]{
		id: func(p *project.Project) string { return p.ID().String() },
		keys: map[string]compareFunc[*project.Project]{
			"updatedat": func(a, b *project.Project) int { return a.UpdatedAt().Compare(b.UpdatedAt()) },
		},
		find: func(c usecasex.Cursor) (*project.Project, bool) {
			pid, err := id.ProjectIDFrom(string(c))
			if err != nil {
				return nil, false
			}
			return r.data.Load(pid)
		},
	}
}

func (r *Project) canRead(p *project.Project) bool {
	if !r.f.IsAccessScopeDefined() && !r.pf.IsAccessScopeDefined() && !r.pf.AttachPublic {
		return true
	}
	if r.f.ReadableIDs().Has(p.Workspace()) || r.pf.ReadableIDs().Has(p.ID()) {
		return true
	}
	return r.pf.AttachPublic && p.Accessibility().Visibility() == project.VisibilityPublic
}

func SetProjectError(r repo.Project, err error) {
	r.(*Project).err = err
}
