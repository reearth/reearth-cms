package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Schema struct {
	data *util.SyncMap[id.SchemaID, *schema.Schema]
	f    repo.WorkspaceFilter
	err  error
}

func NewSchema() repo.Schema {
	return &Schema{
		data: &util.SyncMap[id.SchemaID, *schema.Schema]{},
	}
}

func (r *Schema) Filtered(f repo.WorkspaceFilter) repo.Schema {
	return &Schema{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *Schema) FindByID(_ context.Context, sid id.SchemaID) (*schema.Schema, error) {
	if r.err != nil {
		return nil, r.err
	}

	if s, ok := r.data.Load(sid); ok && r.canRead(s) {
		return s, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Schema) FindByIDs(_ context.Context, ids id.SchemaIDList) (schema.List, error) {
	if r.err != nil {
		return nil, r.err
	}
	if len(ids) == 0 {
		return nil, nil
	}

	// the result keeps the order of the given IDs, as mongo does
	result := make(schema.List, 0, len(ids))
	for _, sid := range ids {
		if s, ok := r.data.Load(sid); ok && r.canRead(s) {
			result = append(result, s)
		}
	}
	return result, nil
}

func (r *Schema) Save(_ context.Context, s *schema.Schema) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(s.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(s.ID(), s)
	return nil
}

func (r *Schema) SaveAll(_ context.Context, list schema.List) error {
	if r.err != nil {
		return r.err
	}
	for _, s := range list {
		if s == nil {
			continue
		}
		if !r.f.CanWrite(s.Workspace()) {
			return repo.ErrOperationDenied
		}
	}
	for _, s := range list {
		if s == nil {
			continue
		}
		r.data.Store(s.ID(), s)
	}
	return nil
}

func (r *Schema) Remove(_ context.Context, sId id.SchemaID) error {
	if r.err != nil {
		return r.err
	}

	if s, ok := r.data.Load(sId); ok && r.f.CanWrite(s.Workspace()) {
		r.data.Delete(sId)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *Schema) canRead(s *schema.Schema) bool {
	return r.f.Readable == nil || r.f.Readable.Has(s.Workspace())
}

func SetSchemaError(r repo.Schema, err error) {
	r.(*Schema).err = err
}
