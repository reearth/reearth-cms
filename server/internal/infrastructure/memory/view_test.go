package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/stretchr/testify/assert"
)

func TestViewRepo(t *testing.T) {
	repotest.TestViewRepo(t, func(*testing.T) repo.View {
		return NewView()
	})
}

func TestView_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	v := view.New().NewID().Project(id.NewProjectID()).Model(id.NewModelID()).MustBuild()

	r := NewView()
	assert.NoError(t, r.Save(ctx, v))
	SetViewError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.ProjectFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, v.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.ViewIDList{v.ID()})))
	assert.Same(t, wantErr, err(r.FindByModel(ctx, v.Model())))
	assert.Same(t, wantErr, err(r.Save(ctx, v)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, view.List{v})))
	assert.Same(t, wantErr, err(r.Remove(ctx, v.ID())))
	assert.Same(t, wantErr, err(r.RemoveByModel(ctx, v.Model())))
}
