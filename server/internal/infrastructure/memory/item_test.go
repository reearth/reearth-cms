package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestItem_FindByID(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	r := NewItem()
	_ = r.Save(ctx, i)

	out, err := r.FindByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Equal(t, i, out)

	out2, err := r.FindByID(ctx, id.ItemID{})
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_Remove(t *testing.T) {
	ctx := context.Background()
	pid := id.NewProjectID()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewItem().Filtered(pf)
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)

	_ = r.Remove(ctx, i2.ID(), pid)
	data, _ := r.FindByIDs(ctx, id.ItemIDList{i.ID(), i2.ID()})
	assert.Equal(t, 1, len(data))

	err := r.Remove(ctx, i.ID(), id.NewProjectID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i.ID(), i.Project()))
}

func TestItem_Save(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{i.Project()},
		Writable: []id.ProjectID{i.Project()},
	}
	r := NewItem().Filtered(pf)

	_ = r.Save(ctx, i)
	got, _ := r.FindByID(ctx, i.ID())
	assert.Equal(t, i, got)

	err := r.Save(ctx, i2)
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByIDs(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)

	ids := id.ItemIDList{i.ID()}
	il := item.List{i}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, il, out)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{i.Project()},
		Writable: []id.ProjectID{i.Project()},
	}
	r := NewItem().Filtered(pf)
	_ = r.Save(ctx, i)
	v, _ := r.FindAllVersionsByID(ctx, i.ID(), i.Project())
	assert.Equal(t, 1, len(v))

	_ = r.Save(ctx, i)
	v, _ = r.FindAllVersionsByID(ctx, i.ID(), i.Project())
	assert.Equal(t, 2, len(v))

	_, err := r.FindAllVersionsByID(ctx, i.ID(), id.NewProjectID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindBySchema(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	i, _ := item.New().NewID().Schema(sid).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(sid).Project(pid).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewItem().Filtered(pf)
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	got, _, _ := r.FindBySchema(ctx, sid, pid, nil)
	assert.Equal(t, 2, len(got))

	_, _, err := r.FindBySchema(ctx, sid, id.NewProjectID(), nil)
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByProject(t *testing.T) {
	ctx := context.Background()
	pid := id.NewProjectID()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewItem().Filtered(pf)
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	got, _, _ := r.FindByProject(ctx, pid, nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}
