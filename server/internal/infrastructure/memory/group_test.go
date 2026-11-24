package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestGroupRepo(t *testing.T) {
	repotest.TestGroupRepo(t, func(*testing.T) repo.Group {
		return NewGroup()
	})
}

func TestGroup_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	g := group.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(id.RandomKey()).MustBuild()
	pagination := usecasex.CursorPagination{First: new(int64(10))}.Wrap()

	r := NewGroup()
	assert.NoError(t, r.Save(ctx, g))
	SetGroupError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.ProjectFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, g.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.GroupIDList{g.ID()})))
	assert.Same(t, wantErr, err(r.Filter(ctx, g.Project(), nil, pagination)))
	assert.Same(t, wantErr, err(r.FindByProject(ctx, g.Project())))
	assert.Same(t, wantErr, err(r.FindByKey(ctx, g.Project(), g.Key().String())))
	assert.Same(t, wantErr, err(r.FindByIDOrKey(ctx, g.Project(), group.IDOrKey(g.ID().String()))))
	assert.Same(t, wantErr, err(r.Save(ctx, g)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, group.List{g})))
	assert.Same(t, wantErr, err(r.Remove(ctx, g.ID())))
}
