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

func InitRepos(c *repo.Container) *repo.Container {
	if c == nil {
		c = &repo.Container{}
	}
	c.Workspace = NewWorkspace()
	c.User = NewUser()
	c.Transaction = NewTransaction()
	c.Lock = NewLock()
	return c
}
