package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestIntegrationRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestIntegrationRepo(t, func(t *testing.T) repo.Integration {
		return NewIntegration(mongox.NewClientWithDatabase(init(t)))
	})
}
