package memory

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestInitRepos(t *testing.T) {
	expected := &repo.Container{
		Lock: &Lock{},
		User: &User{
			//data: map[id.UserID]*user.User{},
		},
		Transaction: &Transaction{},
		Workspace: &Workspace{
			data: map[id.WorkspaceID]*user.Workspace{},
		},
	}
	got := InitRepos()
	assert.Equal(t, expected, got)
}
