package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestWorkspaceSettingsRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestWorkspaceSettingsRepo(t, func(t *testing.T) repo.WorkspaceSettings {
		return NewWorkspaceSettings(mongox.NewClientWithDatabase(init(t)))
	})
}
