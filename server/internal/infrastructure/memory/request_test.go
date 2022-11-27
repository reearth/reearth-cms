package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestRequest_Filtered(t *testing.T) {
	r := &Request{}
	pid := id.NewProjectID()

	assert.Equal(t, &Request{
		f: repo.ProjectFilter{
			Readable: id.ProjectIDList{pid},
			Writable: nil,
		},
	}, r.Filtered(repo.ProjectFilter{
		Readable: id.ProjectIDList{pid},
		Writable: nil,
	}))
}

func TestRequest_FindByID(t *testing.T) {
	ctx := context.Background()
	i := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		MustBuild()
	r := NewRequest()
	_ = r.Save(ctx, i)

	out, err := r.FindByID(ctx, i.ID())
	assert.NoError(t, err)
	assert.Equal(t, i, out.Value())

	out2, err := r.FindByID(ctx, id.RequestID{})
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestRequest_Remove(t *testing.T) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID()).MustBuild()
	i2 := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID()).MustBuild()
	i3 := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID()).MustBuild()

	r := NewRequest()
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)
	_ = r.Save(ctx, i3)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	err := r.Remove(ctx, i1.ID())
	assert.NoError(t, err)
	data, _ := r.FindByIDs(ctx, id.RequestIDList{i1.ID(), i2.ID()})
	assert.Equal(t, request.List{i2}, data.Unwrap())

	err = r.Remove(ctx, i1.ID())
	assert.Equal(t, rerror.ErrNotFound, err)

	err = r.Remove(ctx, i3.ID())
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetRequestError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, i1.ID()))
}

func TestRequest_Save(t *testing.T) {
	ctx := context.Background()
	i := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID()).Project(id.NewProjectID()).MustBuild()
	i2 := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID()).Project(id.NewProjectID()).MustBuild()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{i.Project()},
		Writable: []id.ProjectID{i.Project()},
	}
	r := NewRequest().Filtered(pf)

	_ = r.Save(ctx, i)
	got, _ := r.FindByID(ctx, i.ID())
	assert.Equal(t, i, got.Value())

	err := r.Save(ctx, i2)
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetRequestError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, i))
}

func TestRequest_FindByIDs(t *testing.T) {
	ctx := context.Background()
	i := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID()).Project(id.NewProjectID()).MustBuild()
	i2 := request.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Thread(id.NewThreadID()).Project(id.NewProjectID()).MustBuild()
	r := NewRequest()
	_ = r.Save(ctx, i)
	_ = r.Save(ctx, i2)

	ids := id.RequestIDList{i.ID()}
	il := request.List{i}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, il, out.Unwrap())
}
