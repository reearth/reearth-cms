package memory

import (
	"cmp"
	"context"
	"slices"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Model struct {
	data *util.SyncMap[id.ModelID, *model.Model]
	f    repo.ProjectFilter
	err  error
}

func NewModel() repo.Model {
	return &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
	}
}

func (r *Model) Filtered(f repo.ProjectFilter) repo.Model {
	return &Model{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *Model) FindByProject(_ context.Context, pid id.ProjectID, pagination *usecasex.Pagination) (model.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	// only CanRead applies, as mongox.And drops the mongo read filter for
	// queries keyed by project
	result := r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project() == pid
	})

	return r.pager().paginate(result, nil, pagination)
}

func (r *Model) FindByProjectAndKeyword(_ context.Context, pid id.ProjectID, k *string, sort *usecasex.Sort, pagination *usecasex.Pagination) (model.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	// the keyword matches the name case-insensitively, as the mongo regex does
	keyword := strings.ToLower(lo.FromPtr(k))
	result := r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project() == pid && strings.Contains(strings.ToLower(m.Name()), keyword)
	})

	return r.pager().paginate(result, normalize(sort), pagination)
}

func (r *Model) CountByProject(_ context.Context, pid id.ProjectID) (int, error) {
	if r.err != nil {
		return 0, r.err
	}

	if !r.f.CanRead(pid) {
		return 0, nil
	}

	return r.data.CountAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project() == pid
	}), nil
}

func (r *Model) FindByKey(_ context.Context, pid id.ProjectID, key string) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	if key == "" {
		return nil, rerror.ErrNotFound
	}

	if !r.f.CanRead(pid) {
		return nil, rerror.ErrNotFound
	}

	return r.findOne(func(m *model.Model) bool {
		return m.Project() == pid && m.Key().String() == key
	})
}

func (r *Model) FindByIDOrKey(_ context.Context, pid id.ProjectID, q model.IDOrKey) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	modelID := q.ID()
	key := q.Key()
	if modelID == nil && (key == nil || *key == "") {
		return nil, rerror.ErrNotFound
	}

	if !r.f.CanRead(pid) {
		return nil, rerror.ErrNotFound
	}

	return r.findOne(func(m *model.Model) bool {
		if m.Project() != pid {
			return false
		}
		if modelID != nil {
			return m.ID() == *modelID
		}
		return m.Key().String() == *key
	})
}

func (r *Model) FindByID(_ context.Context, mid id.ModelID) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.findOne(func(m *model.Model) bool {
		return m.ID() == mid && r.canRead(m)
	})
}

func (r *Model) FindBySchema(_ context.Context, sid id.SchemaID) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.findOne(func(m *model.Model) bool {
		return (m.Schema() == sid || (m.Metadata() != nil && *m.Metadata() == sid)) && r.canRead(m)
	})
}

func (r *Model) FindByIDs(_ context.Context, ids id.ModelIDList) (model.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if len(ids) == 0 {
		return nil, nil
	}

	// models are returned in the order of the given IDs
	res := make(model.List, 0, len(ids))
	for _, mid := range ids {
		if m, ok := r.data.Load(mid); ok && r.canRead(m) {
			res = append(res, m)
		}
	}
	return res, nil
}

func (r *Model) Save(_ context.Context, m *model.Model) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(m.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(m.ID(), m)
	return nil
}

func (r *Model) SaveAll(_ context.Context, models model.List) error {
	if r.err != nil {
		return r.err
	}

	if len(models) == 0 {
		return nil
	}

	if !r.f.CanWrite(models.Projects()...) {
		return repo.ErrOperationDenied
	}

	r.data.StoreAll(lo.SliceToMap(models, func(m *model.Model) (id.ModelID, *model.Model) {
		return m.ID(), m
	}))
	return nil
}

func (r *Model) Remove(_ context.Context, mId id.ModelID) error {
	if r.err != nil {
		return r.err
	}

	if m, ok := r.data.Load(mId); ok && r.f.CanWrite(m.Project()) {
		r.data.Delete(mId)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *Model) findOne(f func(*model.Model) bool) (*model.Model, error) {
	m := r.data.Find(func(_ id.ModelID, m *model.Model) bool {
		return f(m)
	})
	if m == nil {
		return nil, rerror.ErrNotFound
	}
	return m, nil
}

func (r *Model) canRead(m *model.Model) bool {
	return r.f.CanRead(m.Project())
}

func (r *Model) pager() pager[*model.Model] {
	text := func(f func(*model.Model) string) compareFunc[*model.Model] {
		return func(a, b *model.Model) int { return strings.Compare(f(a), f(b)) }
	}
	return pager[*model.Model]{
		id: func(m *model.Model) string { return m.ID().String() },
		keys: map[string]compareFunc[*model.Model]{
			"name":        text((*model.Model).Name),
			"description": text((*model.Model).Description),
			"key":         text(func(m *model.Model) string { return m.Key().String() }),
			"project":     text(func(m *model.Model) string { return m.Project().String() }),
			"schema":      text(func(m *model.Model) string { return m.Schema().String() }),
			"metadata":    text(func(m *model.Model) string { return lo.FromPtr(m.Metadata().StringRef()) }),
			// mongo stores times in milliseconds, so finer differences tie
			"updatedat": func(a, b *model.Model) int {
				return cmp.Compare(a.UpdatedAt().UnixMilli(), b.UpdatedAt().UnixMilli())
			},
			"order": func(a, b *model.Model) int { return cmp.Compare(a.Order(), b.Order()) },
		},
		find: func(c usecasex.Cursor) (*model.Model, bool) {
			mid, err := id.ModelIDFrom(string(c))
			if err != nil {
				return nil, false
			}
			return r.data.Load(mid)
		},
	}
}

func normalize(s *usecasex.Sort) *usecasex.Sort {
	if s == nil {
		return &usecasex.Sort{Key: "order", Reverted: true}
	}
	res := &usecasex.Sort{
		Key:      strings.TrimSpace(strings.ToLower(s.Key)),
		Reverted: s.Reverted,
	}
	switch res.Key {
	case "createdat", "created_at":
		res.Key = "id"
	case "updated_at":
		res.Key = "updatedat"
	}
	if !slices.Contains([]string{"id", "name", "description", "key", "project", "schema", "metadata", "updatedat", "order"}, res.Key) {
		res.Key = "order"
	}
	return res
}

func SetModelError(r repo.Model, err error) {
	r.(*Model).err = err
}
