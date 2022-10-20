package integration

//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen --config=server.cfg.yaml ../../../integrationAPI.yaml
//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen --config=types.cfg.yaml ../../../integrationAPI.yaml

type Server struct{}

func NewServer() *Server {
	return &Server{}
}

var _ StrictServerInterface = (*Server)(nil)
