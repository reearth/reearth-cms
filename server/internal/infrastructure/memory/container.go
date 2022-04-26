package memory

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

func InitRepos() *repo.Container {
	return &repo.Container{
		Workspace:   NewWorkspace(),
		User:        NewUser(),
		Transaction: NewTransaction(),
		Lock:        NewLock(),
	}
}
