package integration

//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen@master --config=server.cfg.yaml ../../../integrationAPI.yaml
//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen@master --config=types.cfg.yaml ../../../integrationAPI.yaml

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

type Server struct {
	usecases interfaces.Container
}

func NewServer(container interfaces.Container) *Server {
	return &Server{
		usecases: container,
	}
}

var _ StrictServerInterface = (*Server)(nil)
