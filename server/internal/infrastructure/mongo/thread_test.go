package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestThreadRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestThreadRepo(t, func(t *testing.T) repo.Thread {
		return NewThread(mongox.NewClientWithDatabase(init(t)))
	})
}
