package e2e

import (
	"testing"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

// GET /assets/{assetId}
func TestInternalGetProjectsAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "0", // Let os assign a random port
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050", grpc.WithTransportCredentials(insecure.NewCredentials()))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)

	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{WorkspaceId: wId0.String()})
	assert.NoError(t, err)

	assert.Equal(t, int32(1), l.TotalCount)
	assert.Equal(t, 1, len(l.Projects))
	assert.Equal(t, pid.String(), l.Projects[0].Id)
	assert.Equal(t, "p1", l.Projects[0].Name)
	assert.Equal(t, palias, l.Projects[0].Alias)
	assert.Equal(t, wId0.String(), l.Projects[0].WorkspaceId)
	assert.Equal(t, lo.ToPtr("p1 desc"), l.Projects[0].Description)
}
