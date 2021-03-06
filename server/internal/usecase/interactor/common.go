package interactor

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

type ContainerConfig struct {
	SignupSecret    string
	AuthSrvUIDomain string
}

func New(r *repo.Container, g *gateway.Container, config ContainerConfig) interfaces.Container {

	return interfaces.Container{
		Workspace: NewWorkspace(r),
		User:      NewUser(r, g, config.SignupSecret, config.AuthSrvUIDomain),
		Project:   NewProject(r),
	}
}
