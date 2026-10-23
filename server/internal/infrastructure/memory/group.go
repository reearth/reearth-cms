package memory

import (
	"cmp"
	"context"
	"slices"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Group struct {
	data *util.SyncMap[id.GroupID, *group.Group]
	f    repo.ProjectFilter
	err  error
}

func NewGroup() repo.Group {
	return &Group{
		data: &util.SyncMap[id.GroupID, *group.Group]{},
	}
}

func (r *Group) Filtered(filter repo.ProjectFilter) repo.Group {
	return &Group{
		data: r.data,
		f:    r.f.Merge(filter),
		err:  r.err,
	}
}

func (r *Group) FindByID(_ context.Context, groupID id.GroupID) (*group.Group, error) {
	if r.err != nil {
		return nil, r.err
	}

	if g, ok := r.data.Load(groupID); ok && r.canRead(g) {
		return g.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Group) FindByIDs(_ context.Context, list id.GroupIDList) (group.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if len(list) == 0 {
		return nil, nil
	}

	// groups are returned in the order of the given IDs, as mongo does
	res := make(group.List, 0, len(list))
	for _, gid := range list {
		if g, ok := r.data.Load(gid); ok && r.canRead(g) {
			res = append(res, g.Clone())
		}
	}
	return res, nil
}

func (r *Group) Filter(_ context.Context, pid id.ProjectID, sort *group.Sort, pagination *usecasex.Pagination) (group.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	// only CanRead applies, as mongox.And drops the mongo read filter for
	// queries keyed by project
	result := r.data.FindAll(func(_ id.GroupID, g *group.Group) bool {
		return g.Project() == pid
	})

	res, pi, err := r.pager().paginate(result, groupSort(sort), pagination)
	if err != nil {
		return nil, nil, err
	}
	return group.List(res).Clone(), pi, nil
}

func (r *Group) FindByProject(_ context.Context, pid id.ProjectID) (group.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, nil
	}

	result := group.List(r.data.FindAll(func(_ id.GroupID, g *group.Group) bool {
		return g.Project() == pid
	}))
	if len(result) == 0 {
		return nil, nil
	}

	return result.SortByID().Clone(), nil
}

func (r *Group) FindByKey(_ context.Context, pid id.ProjectID, key string) (*group.Group, error) {
	if r.err != nil {
		return nil, r.err
	}

	if key == "" {
		return nil, rerror.ErrNotFound
	}

	if !r.f.CanRead(pid) {
		return nil, rerror.ErrNotFound
	}

	return r.findOne(func(g *group.Group) bool {
		return g.Project() == pid && g.Key().String() == key
	})
}

func (r *Group) FindByIDOrKey(_ context.Context, pid id.ProjectID, q group.IDOrKey) (*group.Group, error) {
	if r.err != nil {
		return nil, r.err
	}

	groupID := q.ID()
	key := q.Key()
	if groupID == nil && (key == nil || *key == "") {
		return nil, rerror.ErrNotFound
	}

	if !r.f.CanRead(pid) {
		return nil, rerror.ErrNotFound
	}

	return r.findOne(func(g *group.Group) bool {
		if g.Project() != pid {
			return false
		}
		if groupID != nil {
			return g.ID() == *groupID
		}
		return g.Key().String() == *key
	})
}

func (r *Group) SaveAll(_ context.Context, groups group.List) error {
	if r.err != nil {
		return r.err
	}

	if len(groups) == 0 {
		return nil
	}
	if slices.Contains(groups, nil) {
		return rerror.ErrInvalidParams
	}

	if !r.f.CanWrite(groups.Projects()...) {
		return repo.ErrOperationDenied
	}

	r.data.StoreAll(lo.SliceToMap(groups, func(g *group.Group) (id.GroupID, *group.Group) {
		return g.ID(), g.Clone()
	}))
	return nil
}

func (r *Group) Save(_ context.Context, g *group.Group) error {
	if r.err != nil {
		return r.err
	}
	if g == nil {
		return rerror.ErrInvalidParams
	}

	if !r.f.CanWrite(g.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(g.ID(), g.Clone())
	return nil
}

func (r *Group) Remove(_ context.Context, groupID id.GroupID) error {
	if r.err != nil {
		return r.err
	}

	if g, ok := r.data.Load(groupID); ok && r.f.CanWrite(g.Project()) {
		r.data.Delete(groupID)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *Group) findOne(f func(*group.Group) bool) (*group.Group, error) {
	g := r.data.Find(func(_ id.GroupID, g *group.Group) bool {
		return f(g)
	})
	if g == nil {
		return nil, rerror.ErrNotFound
	}
	return g.Clone(), nil
}

func (r *Group) canRead(g *group.Group) bool {
	return r.f.CanRead(g.Project())
}

func (r *Group) pager() pager[*group.Group] {
	return pager[*group.Group]{
		id: func(g *group.Group) string { return g.ID().String() },
		keys: map[string]compareFunc[*group.Group]{
			"order": func(a, b *group.Group) int { return cmp.Compare(a.Order(), b.Order()) },
		},
		find: func(c usecasex.Cursor) (*group.Group, bool) {
			gid, err := id.GroupIDFrom(string(c))
			if err != nil {
				return nil, false
			}
			return r.data.Load(gid)
		},
	}
}

func groupSort(s *group.Sort) *usecasex.Sort {
	res := &usecasex.Sort{Key: "order"}
	if s == nil {
		return res
	}
	if s.Column == group.ColumnCreatedAt {
		res.Key = "id"
	}
	res.Reverted = s.Direction == group.DirectionDesc
	return res
}

func SetGroupError(r repo.Group, err error) {
	r.(*Group).err = err
}
