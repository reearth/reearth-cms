package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

// Entry point running the shared repository interface test suite
// (internal/usecase/repo/test) against the in-memory implementation.
func TestProjectRepo(t *testing.T) {
	repotest.TestProjectRepo(t, func(*testing.T) repo.Project {
		return NewProject()
	})
}

// TestProject_MemorySpecific_SearchWithoutPagination tests that Search
// returns every matching project, sorted by ID, when no pagination is given
// (mongo returns nothing); interactor tests rely on it.
func TestProject_MemorySpecific_SearchWithoutPagination(t *testing.T) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := project.New().NewID().Workspace(w1).MustBuild()
	w1p2 := project.New().NewID().Workspace(w1).MustBuild()
	w2p1 := project.New().NewID().Workspace(w2).MustBuild()

	r := NewProject()
	for _, p := range (project.List{w1p1, w1p2, w2p1}) {
		assert.NoError(t, r.Save(ctx, p))
	}

	got, pi, err := r.Search(ctx, interfaces.ProjectFilter{WorkspaceIds: &accountdomain.WorkspaceIDList{w1}})
	assert.NoError(t, err)
	assert.Equal(t, project.List{w1p1, w1p2}.SortByID(), got)
	assert.Equal(t, int64(2), pi.TotalCount)
}

// TestProject_MemorySpecific_Errors tests the SetProjectError injection
// helper used by interactor tests to simulate repository failures.
func TestProject_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	w1 := accountdomain.NewWorkspaceID()
	w1p1 := project.New().NewID().Workspace(w1).MustBuild()

	r := NewProject()
	assert.NoError(t, r.Save(ctx, w1p1))
	SetProjectError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.WorkspaceFilter{}, repo.ProjectFilter{})

	_, err := r.FindByID(ctx, w1p1.ID())
	assert.Same(t, wantErr, err)
	_, err = r.FindByIDs(ctx, id.ProjectIDList{w1p1.ID()})
	assert.Same(t, wantErr, err)
	_, err = r.FindByIDOrAlias(ctx, w1p1.Workspace(), project.IDOrAlias(w1p1.ID().String()))
	assert.Same(t, wantErr, err)
	_, _, err = r.Search(ctx, interfaces.ProjectFilter{})
	assert.Same(t, wantErr, err)
	_, err = r.IsAliasAvailable(ctx, w1p1.Workspace(), "alias")
	assert.Same(t, wantErr, err)
	_, err = r.CountByWorkspace(ctx, w1p1.Workspace())
	assert.Same(t, wantErr, err)
	_, err = r.FindByPublicAPIKey(ctx, "key")
	assert.Same(t, wantErr, err)
	assert.Same(t, wantErr, r.Save(ctx, w1p1))
	_, err = r.Star(ctx, w1p1.ID(), accountdomain.NewUserID())
	assert.Same(t, wantErr, err)
	assert.Same(t, wantErr, r.Remove(ctx, w1p1.ID()))
}
