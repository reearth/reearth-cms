package publicApi

type Server struct{}

func NewServer() *Server {
	return &Server{}
}

// var _ StrictServerInterface = (*Server)(nil)
