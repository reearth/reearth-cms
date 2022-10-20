package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
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
}

func TestItem_Remove(t *testing.T) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i3, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid2).Build()

	r := NewItem()
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	err := r.Remove(ctx, i1.ID())
	assert.NoError(t, err)
	data, _ := r.FindByIDs(ctx, id.ItemIDList{i1.ID(), i2.ID()})
	assert.Equal(t, item.List{i2}, data)

	err = r.Remove(ctx, i1.ID())
	assert.Equal(t, rerror.ErrNotFound, err)

	err = r.Remove(ctx, i3.ID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i1.ID()))
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
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	r := NewItem()
	_ = r.Save(ctx, i)

	v, err := r.FindAllVersionsByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Equal(t, []*version.Value[*item.Item]{
		version.MustBeValue(v[0].Version(), nil, version.NewRefs(version.Latest), i),
	}, v)

	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{},
		Writable: []id.ProjectID{},
	})
	res, err := r.FindAllVersionsByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Empty(t, res)
}

func TestItem_FindBySchema(t *testing.T) {
	ctx := context.Background()
	sid1, sid2 := id.NewSchemaID(), id.NewSchemaID()
	pid1, pid2 := id.NewProjectID(), id.NewProjectID()
	i1, _ := item.New().NewID().Schema(sid1).Project(pid1).Build()
	i2, _ := item.New().NewID().Schema(sid2).Project(pid2).Build()

	r := NewItem().Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid1},
		Writable: []id.ProjectID{pid1},
	})
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)

	got, _, err := r.FindBySchema(ctx, sid1, nil)
	assert.NoError(t, err)
	assert.Equal(t, item.List{i1}, got)

	got, _, err = r.FindBySchema(ctx, sid2, nil)
	assert.NoError(t, err)
	assert.Nil(t, got)
}

func TestItem_FindByProject(t *testing.T) {
	ctx := context.Background()
	pid := id.NewProjectID()
	i1, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	r := NewItem().Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)

	got, _, err := r.FindByProject(ctx, pid, nil)
	assert.NoError(t, err)
	assert.Equal(t, item.List{i1, i2}, got)
}
