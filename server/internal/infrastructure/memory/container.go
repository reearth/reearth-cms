package memory

import (
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/usecasex"
)

func New() *repo.Container {
	return &repo.Container{
		Lock:        NewLock(),
		User:        NewUser(),
		Workspace:   NewWorkspace(),
		Project:     NewProject(),
		Model:       NewModel(),
		Schema:      NewSchema(),
		Integration: NewIntegration(),
		Transaction: &usecasex.NopTransaction{},
	}
}

func MockNow(r *repo.Container, t time.Time) func() {
	p := r.Project.(*Project).now.Mock(t)

	return func() {
		p()
	}
}
