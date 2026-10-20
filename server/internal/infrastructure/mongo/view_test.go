package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestViewRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestViewRepo(t, func(t *testing.T) repo.View {
		return NewView(mongox.NewClientWithDatabase(init(t)))
	})
}
