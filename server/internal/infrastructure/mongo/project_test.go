package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

// Entry point running the shared repository interface test suite
// (internal/usecase/repo/test) against the Mongo implementation.
func TestProjectRepo(t *testing.T) {
	t.Helper()
	init := mongotest.Connect(t)
	repotest.TestProjectRepo(t, func(t *testing.T) repo.Project {
		return NewProject(mongox.NewClientWithDatabase(init(t)))
	})
}
