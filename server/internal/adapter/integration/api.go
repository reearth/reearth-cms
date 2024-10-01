package integration

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen --config=server.cfg.yml ../../../schemas/integration.yml

type Server struct{}

func NewServer() *Server {
	return &Server{}
}

var _ StrictServerInterface = (*Server)(nil)
