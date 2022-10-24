package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)

	_ = r.Remove(ctx, i2.ID())
	data, _ := r.FindByIDs(ctx, id.ItemIDList{i.ID(), i2.ID()})
	assert.Equal(t, 1, len(data))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i.ID()))
}

func TestItem_Save(t *testing.T) {
	ctx := context.Background()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()

	r := NewItem()
	_ = r.Save(ctx, i)
	got, _ := r.FindByID(ctx, i.ID())
	assert.Equal(t, i, got)

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

	r := NewItem()
	_ = r.Save(ctx, i)
	v, _ := r.FindAllVersionsByID(ctx, i.ID())
	assert.Equal(t, 1, len(v))

	_ = r.Save(ctx, i)
	v, _ = r.FindAllVersionsByID(ctx, i.ID())
	assert.Equal(t, 2, len(v))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindBySchema(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	i, _ := item.New().NewID().Schema(sid).Project(id.NewProjectID()).Build()
	i2, _ := item.New().NewID().Schema(sid).Project(id.NewProjectID()).Build()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	got, _, _ := r.FindBySchema(ctx, sid, nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByProject(t *testing.T) {
	ctx := context.Background()
	pid := id.NewProjectID()
	i, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(id.NewSchemaID()).Project(pid).Build()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	got, _, _ := r.FindByProject(ctx, pid, nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestItem_FindByFieldValue(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	pid := id.NewProjectID()
	f1 := item.NewField(sf1, schema.TypeText, "foo")
	f2 := item.NewField(sf2, schema.TypeText, "hoge")
	i, _ := item.New().NewID().Schema(sid).Fields([]*item.Field{f1}).Project(pid).Build()
	i2, _ := item.New().NewID().Schema(sid).Fields([]*item.Field{f1}).Project(pid).Build()
	i3, _ := item.New().NewID().Schema(sid).Fields([]*item.Field{f2}).Project(pid).Build()

	r := NewItem()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	got, _, _ := r.Search(ctx, "foo", nil)
	assert.Equal(t, 2, len(got))

	wantErr := errors.New("test")
	SetItemError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}
