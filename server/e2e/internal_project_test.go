package e2e

import (
	"testing"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

// GRPC List Projects
func TestInternalListProjectsAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)

	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	// List projects without any parameters should return an error
	_, err = client.ListProjects(mdCtx, &pb.ListProjectsRequest{})
	assert.Error(t, err)
	assert.Equal(t, err.Error(), "rpc error: code = InvalidArgument desc = at least one valid workspace_id is required")

	// 1- List projects for the workspace
	l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}})
	assert.NoError(t, err)

	assert.Equal(t, int64(2), l.TotalCount)
	assert.Equal(t, 2, len(l.Projects))

	p1 := l.Projects[0]
	assert.Equal(t, pid.String(), p1.Id)
	assert.Equal(t, "p1", p1.Name)
	assert.Equal(t, palias, p1.Alias)
	assert.Equal(t, wId0.String(), p1.WorkspaceId)
	assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
}

// GRPC Get Project
func TestInternalGetProjectsAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)

	// region Public Project

	// 1- Get project owned by the user = should return the project
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	p, err := client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: palias})
	assert.NoError(t, err)

	p1 := p.Project
	assert.Equal(t, pid.String(), p1.Id)
	assert.Equal(t, "p1", p1.Name)
	assert.Equal(t, palias, p1.Alias)
	assert.Equal(t, wId0.String(), p1.WorkspaceId)
	assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)

	// 2- Get project with non-existing user = should return the project
	md = metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       id.NewUserID().String(),
	})
	mdCtx = metadata.NewOutgoingContext(t.Context(), md)

	p, err = client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: palias})
	assert.NoError(t, err)

	p1 = p.Project
	assert.Equal(t, pid.String(), p1.Id)
	assert.Equal(t, "p1", p1.Name)
	assert.Equal(t, palias, p1.Alias)
	assert.Equal(t, wId0.String(), p1.WorkspaceId)
	assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)

	// 3- Get project not owned by the user = should return the project
	md = metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId_2.String(),
	})
	mdCtx = metadata.NewOutgoingContext(t.Context(), md)

	p, err = client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: palias})
	assert.NoError(t, err)

	p1 = p.Project
	assert.Equal(t, pid.String(), p1.Id)
	assert.Equal(t, "p1", p1.Name)
	assert.Equal(t, palias, p1.Alias)
	assert.Equal(t, wId0.String(), p1.WorkspaceId)
	assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
	// endregion

	// region Private Project
	// 1- Get project owned by the user = should return the project
	md = metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx = metadata.NewOutgoingContext(t.Context(), md)

	p, err = client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: palias2})
	assert.NoError(t, err)

	p1 = p.Project
	assert.Equal(t, pid2.String(), p1.Id)
	assert.Equal(t, "p2", p1.Name)
	assert.Equal(t, palias2, p1.Alias)
	assert.Equal(t, wId0.String(), p1.WorkspaceId)
	assert.Equal(t, lo.ToPtr("p2 desc"), p1.Description)

	// 2- Get project not owned by the user = should return a not found error
	md = metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       id.NewUserID().String(),
	})
	mdCtx = metadata.NewOutgoingContext(t.Context(), md)

	p, err = client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: palias2})
	assert.Error(t, err)
	assert.Equal(t, "rpc error: code = Unknown desc = not found", err.Error())
	assert.Nil(t, p)
	// endregion
}

// GRPC Check Alias
func TestInternalCheckAliasAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)

	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	p, err := client.CheckAliasAvailability(mdCtx, &pb.AliasAvailabilityRequest{Alias: palias})
	assert.NoError(t, err)
	assert.False(t, p.Available)

	p, err = client.CheckAliasAvailability(mdCtx, &pb.AliasAvailabilityRequest{Alias: "new_alias"})
	assert.NoError(t, err)
	assert.True(t, p.Available)
}

// GRPC Create Project
func TestInternalCreateProjectAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})

	mdCtx := metadata.NewOutgoingContext(t.Context(), md)
	_, err = client.CreateProject(mdCtx, &pb.CreateProjectRequest{
		Name:        "New Project",
		Alias:       "new_project",
		Description: lo.ToPtr("This is a new project"),
		WorkspaceId: wId0.String(),
	})
	assert.NoError(t, err)

	// Verify the project was created
	l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}})
	assert.NoError(t, err)
	assert.Equal(t, int64(3), l.TotalCount)
	for _, p := range l.Projects {
		if p.Alias == "new_project" {
			assert.Equal(t, "New Project", p.Name)
			assert.Equal(t, lo.ToPtr("This is a new project"), p.Description)
			assert.Equal(t, wId0.String(), p.WorkspaceId)
			return
		}
	}
}

// GRPC Update Project
func TestInternalUpdateProjectAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)
	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	_, err = client.UpdateProject(mdCtx, &pb.UpdateProjectRequest{
		ProjectId:   pid.String(),
		Name:        lo.ToPtr("Updated Project Name"),
		Description: lo.ToPtr("Updated project description"),
		Alias:       lo.ToPtr("updated_alias"),
	})
	assert.NoError(t, err)

	// Verify the project was updated
	p, err := client.GetProject(mdCtx, &pb.ProjectRequest{ProjectIdOrAlias: "updated_alias"})
	assert.NoError(t, err)
	assert.Equal(t, "Updated Project Name", p.Project.Name)
	assert.Equal(t, lo.ToPtr("Updated project description"), p.Project.Description)
	assert.Equal(t, "updated_alias", p.Project.Alias)
	assert.Equal(t, wId0.String(), p.Project.WorkspaceId)
	assert.Equal(t, pid.String(), p.Project.Id)
}

// GRPC Delete Project
func TestInternalDeleteProjectAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)
	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	_, err = client.DeleteProject(mdCtx, &pb.DeleteProjectRequest{ProjectId: pid.String()})
	assert.NoError(t, err)

	// Verify the project was deleted
	l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}})
	assert.NoError(t, err)
	assert.Equal(t, int64(1), l.TotalCount)
}

// GRPC List Models in Project
func TestInternalListModelsInProjectAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	l, err := client.ListModels(mdCtx, &pb.ListModelsRequest{ProjectId: pid.String()})
	assert.NoError(t, err)
	assert.Equal(t, int64(7), l.TotalCount)

	// Verify that no models are returned for the project

}

// GRPC List Items in Model
func TestInternalListItemsInModelAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	l, err := client.ListItems(mdCtx, &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()})
	assert.NoError(t, err)

	assert.Equal(t, int64(1), l.TotalCount)
	assert.Equal(t, 1, len(l.Items))
	item := l.Items[0]
	assert.Equal(t, itmId1.String(), item.Id)
}

// GRPC List Assets in Project
func TestInternalListAssetsInProjectAPI(t *testing.T) {
	StartServer(t, &app.Config{
		InternalApi: app.InternalApiConfig{
			Active: true,
			Port:   "52050",
			Token:  "TestToken",
		},
	}, true, baseSeeder)

	clientConn, err := grpc.NewClient("localhost:52050",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithMaxCallAttempts(5))
	assert.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)
	md := metadata.New(map[string]string{
		"Authorization": "Bearer TestToken",
		"User-Id":       uId.String(),
	})
	mdCtx := metadata.NewOutgoingContext(t.Context(), md)

	l, err := client.ListAssets(mdCtx, &pb.ListAssetsRequest{ProjectId: pid.String()})
	assert.NoError(t, err)
	assert.Equal(t, int64(3), l.TotalCount)

	a := l.Assets[0]
	assert.Equal(t, a.Id, aid1.String())
	assert.Equal(t, "aaa.jpg", a.Filename)
	assert.Nil(t, a.PreviewType)
	assert.Equal(t, uint64(1000), a.Size)
	assert.Nil(t, a.ArchiveExtractionStatus)
	assert.Equal(t, pid.String(), a.ProjectId)
	assert.Equal(t, false, a.Public)
}
