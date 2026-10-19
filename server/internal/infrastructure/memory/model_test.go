package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestModelRepo(t *testing.T) {
	repotest.TestModelRepo(t, func(*testing.T) repo.Model {
		return NewModel()
	})
}

func TestModel_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	m := model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).RandomKey().MustBuild()
	pagination := usecasex.CursorPagination{First: new(int64(10))}.Wrap()

	r := NewModel()
	assert.NoError(t, r.Save(ctx, m))
	SetModelError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.ProjectFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, m.ID())))
	assert.Same(t, wantErr, err(r.FindBySchema(ctx, m.Schema())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.ModelIDList{m.ID()})))
	assert.Same(t, wantErr, err(r.FindByProject(ctx, m.Project(), pagination)))
	assert.Same(t, wantErr, err(r.FindByProjectAndKeyword(ctx, m.Project(), nil, nil, pagination)))
	assert.Same(t, wantErr, err(r.FindByKey(ctx, m.Project(), m.Key().String())))
	assert.Same(t, wantErr, err(r.FindByIDOrKey(ctx, m.Project(), model.IDOrKey(m.ID().String()))))
	assert.Same(t, wantErr, err(r.CountByProject(ctx, m.Project())))
	assert.Same(t, wantErr, err(r.Save(ctx, m)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, model.List{m})))
	assert.Same(t, wantErr, err(r.Remove(ctx, m.ID())))
}
