package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

// Entry points running the shared repository interface test suites
// (internal/usecase/repo/test) against the Mongo implementations.

func TestItemRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestItemRepo(t, func(t *testing.T) repo.Item {
		return NewItem(mongox.NewClientWithDatabase(init(t)))
	})
}
