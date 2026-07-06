package memory

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
)

// Entry points running the shared repository interface test suites
// (internal/usecase/repo/test) against the in-memory implementations.

func TestItemRepo(t *testing.T) {
	repotest.TestItemRepo(t, func(*testing.T) repo.Item {
		return NewItem()
	})
}
