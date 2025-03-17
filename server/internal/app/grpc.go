package app

import (
	"flag"
	"fmt"
	"net"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearthx/log"
	"google.golang.org/grpc"
)

type GrpcServer struct {
	port   *int
	server *pb.ReEarthCMSServer
}

func NewGrpcServer(port int, server pb.ReEarthCMSServer) *GrpcServer {
	return &GrpcServer{
		port:   &port,
		server: &server,
	}
}

func (s GrpcServer) Run() {
	flag.Parse()
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *s.port))
	if err != nil {
		log.Fatalf("grpc: failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	pb.RegisterReEarthCMSServer(grpcServer, *s.server)
	log.Printf("grpc: server listening at %v", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("grpc: failed %v", err)
	}
}
