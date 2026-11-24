package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestRequestRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestRequestRepo(t, func(t *testing.T) repo.Request {
		return NewRequest(mongox.NewClientWithDatabase(init(t)))
	})
}
