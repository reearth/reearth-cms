package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestGroupRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestGroupRepo(t, func(t *testing.T) repo.Group {
		return NewGroup(mongox.NewClientWithDatabase(init(t)))
	})
}
