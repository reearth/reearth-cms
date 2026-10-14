package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestSchemaRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestSchemaRepo(t, func(t *testing.T) repo.Schema {
		return NewSchema(mongox.NewClientWithDatabase(init(t)))
	})
}
