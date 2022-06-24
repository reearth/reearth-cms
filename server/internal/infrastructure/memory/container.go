package memory

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

func New() *repo.Container {
	return &repo.Container{
		Transaction: NewTransaction(),
		Lock:        NewLock(),
		User:        NewUser(),
		Workspace:   NewWorkspace(),
		Project:     NewProject(),
	}
}
