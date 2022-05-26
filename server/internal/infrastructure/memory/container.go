package memory

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

func New() *repo.Container {
	return &repo.Container{
		Workspace:   NewWorkspace(),
		User:        NewUser(),
		Transaction: NewTransaction(),
		Lock:        NewLock(),
	}
}
