package memory

import (
	"time"

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

func MockNow(r *repo.Container, t time.Time) func() {
	p := r.Project.(*Project).now.Mock(t)

	return func() {
		p()
	}
}
