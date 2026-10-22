package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettingsRepo(t *testing.T) {
	repotest.TestWorkspaceSettingsRepo(t, func(*testing.T) repo.WorkspaceSettings {
		return NewWorkspaceSettings()
	})
}

func TestWorkspaceSettings_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	ws := workspacesettings.New().NewID().MustBuild()

	r := NewWorkspaceSettings()
	assert.NoError(t, r.Save(ctx, ws))
	SetWorkspaceSettingsError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.WorkspaceFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, ws.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, accountdomain.WorkspaceIDList{ws.ID()})))
	assert.Same(t, wantErr, err(r.Save(ctx, ws)))
	assert.Same(t, wantErr, err(r.Remove(ctx, ws.ID())))
}
