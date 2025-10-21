package e2e

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/wrapperspb"
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

	t.Run("List Projects without any parameters should return only public projects", func(t *testing.T) {
		l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), l.TotalCount)
		assert.Equal(t, 1, len(l.Projects))

		p1 := l.Projects[0]
		assert.Equal(t, pid.String(), p1.Id)
		assert.Equal(t, "p1", p1.Name)
		assert.Equal(t, palias, p1.Alias)
		assert.Equal(t, wId0.String(), p1.WorkspaceId)
		assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
	})

	t.Run("List Projects for the workspace should return all projects in the workspace", func(t *testing.T) {
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

		p2 := l.Projects[1]
		assert.Equal(t, pid2.String(), p2.Id)
		assert.Equal(t, "p2", p2.Name)
		assert.Equal(t, palias2, p2.Alias)
		assert.Equal(t, wId0.String(), p2.WorkspaceId)
		assert.Equal(t, lo.ToPtr("p2 desc"), p2.Description)
	})

	t.Run("List Projects for the workspace with PublicOnly = true should return only public projects in the workspace", func(t *testing.T) {
		l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}, PublicOnly: true})
		assert.NoError(t, err)

		assert.Equal(t, int64(1), l.TotalCount)
		assert.Equal(t, 1, len(l.Projects))

		p1 := l.Projects[0]
		assert.Equal(t, pid.String(), p1.Id)
		assert.Equal(t, "p1", p1.Name)
		assert.Equal(t, palias, p1.Alias)
		assert.Equal(t, wId0.String(), p1.WorkspaceId)
		assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
	})

	t.Run("List Projects with keyword (exact project id)", func(t *testing.T) {
		l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{
			Keyword: pid.StringRef(),
		})
		assert.NoError(t, err)

		assert.Equal(t, int64(1), l.TotalCount)
		assert.Equal(t, 1, len(l.Projects))

		p1 := l.Projects[0]
		assert.Equal(t, pid.String(), p1.Id)
		assert.Equal(t, "p1", p1.Name)
		assert.Equal(t, palias, p1.Alias)
		assert.Equal(t, wId0.String(), p1.WorkspaceId)
		assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
	})

	t.Run("List Projects with keyword (alias)", func(t *testing.T) {
		l, err := client.ListProjects(mdCtx, &pb.ListProjectsRequest{
			Keyword: &palias,
		})
		assert.NoError(t, err)

		assert.Equal(t, int64(1), l.TotalCount)
		assert.Equal(t, 1, len(l.Projects))

		p1 := l.Projects[0]
		assert.Equal(t, pid.String(), p1.Id)
		assert.Equal(t, "p1", p1.Name)
		assert.Equal(t, palias, p1.Alias)
		assert.Equal(t, wId0.String(), p1.WorkspaceId)
		assert.Equal(t, lo.ToPtr("p1 desc"), p1.Description)
	})
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

// GRPC Get Model
func TestInternalGetModelAPI(t *testing.T) {
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

	// Get model by IDs
	m, err := client.GetModel(mdCtx, &pb.ModelRequest{ProjectIdOrAlias: pid.String(), ModelIdOrAlias: mId1.String()})
	assert.NoError(t, err)
	assert.Equal(t, mId1.String(), m.Model.Id)
	assert.Equal(t, ikey1.String(), m.Model.Key)
	assert.Equal(t, "m1", m.Model.Name)
	assert.Equal(t, pid.String(), m.Model.ProjectId)
	assert.Equal(t, "m1 desc", m.Model.Description)
	assert.NotNil(t, m.Model.Schema)

	// Get model by aliases
	m, err = client.GetModel(mdCtx, &pb.ModelRequest{ProjectIdOrAlias: palias, ModelIdOrAlias: ikey1.String()})
	assert.NoError(t, err)
	assert.Equal(t, mId1.String(), m.Model.Id)
	assert.Equal(t, ikey1.String(), m.Model.Key)
	assert.Equal(t, "m1", m.Model.Name)
	assert.Equal(t, pid.String(), m.Model.ProjectId)
	assert.Equal(t, "m1 desc", m.Model.Description)
	assert.NotNil(t, m.Model.Schema)
}

// GRPC List Items in Model
func TestInternalListItemsInModelAPI(t *testing.T) {
	e := StartServer(t, &app.Config{
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

	// 1- Model does not contain any published items
	l, err := client.ListItems(mdCtx, &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()})
	assert.NoError(t, err)

	assert.Equal(t, int64(0), l.TotalCount)
	assert.Equal(t, 0, len(l.Items))

	// 2- Model contains one published item

	// create request & approve it to make the item published
	res := createRequest2(e, pid.String(), "test", lo.ToPtr("test"), lo.ToPtr("WAITING"), []string{uId.String()}, []any{map[string]any{"itemId": itmId1.String(), "version": "latest"}})
	approveRequest2(e, res.Path("$.data.createRequest.request.id").String().Raw())

	l, err = client.ListItems(mdCtx, &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()})
	assert.NoError(t, err)

	assert.Equal(t, int64(1), l.TotalCount)
	assert.Equal(t, 1, len(l.Items))
	item := l.Items[0]
	assert.Equal(t, itmId1.String(), item.Id)

	// 3- model contains items with different fields types

	// create request & approve it to make the item published
	res = createRequest2(e, pid.String(), "test", lo.ToPtr("test"), lo.ToPtr("WAITING"), []string{uId.String()}, []any{map[string]any{"itemId": itmId6.String(), "version": "latest"}})
	approveRequest2(e, res.Path("$.data.createRequest.request.id").String().Raw())

	l, err = client.ListItems(mdCtx, &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId5.String()})
	assert.NoError(t, err)

	assert.Equal(t, int64(1), l.TotalCount)
	assert.Equal(t, 1, len(l.Items))
	item = l.Items[0]
	assert.Equal(t, itmId6.String(), item.Id)
	f, err := convertAnyToFloat32(item.Fields["number-key"])
	assert.NoError(t, err)
	assert.Equal(t, float32(21.2), f)

	i, err := convertAnyToInt64(item.Fields["integer-key"])
	assert.NoError(t, err)
	assert.Equal(t, int64(123), i)
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

// GRPC Get Asset
func TestInternalGetAssetAPI(t *testing.T) {
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
	a, err := client.GetAsset(mdCtx, &pb.AssetRequest{AssetId: aid1.String()})
	assert.NoError(t, err)
	assert.Equal(t, aid1.String(), a.Asset.Id)
	assert.Equal(t, "aaa.jpg", a.Asset.Filename)
	assert.Nil(t, a.Asset.PreviewType)
	assert.Equal(t, uint64(1000), a.Asset.Size)
	assert.Nil(t, a.Asset.ArchiveExtractionStatus)
	assert.Equal(t, pid.String(), a.Asset.ProjectId)
	assert.Equal(t, false, a.Asset.Public)
}

// TODO: improve common methods usage instead of duplicating
func createRequest2(e *httpexpect.Expect, projectId, title string, description, state *string, reviewersId []string, items []any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation CreateRequest($projectId: ID!, $title: String!, $description: String, $state: RequestState, $reviewersId: [ID!], $items: [RequestItemInput!]!) {
    createRequest(
      input: {projectId: $projectId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items}
    ) {
      request {
				id
				items {
					itemId
					version
					ref
				}
				title
				description
				createdBy {
					id
					name
					email
				}
				workspaceId
				projectId
				threadId
				reviewersId
				state
				createdAt
				updatedAt
				approvedAt
				closedAt
			}
		}		
  }`,
		Variables: map[string]any{
			"projectId":   projectId,
			"title":       title,
			"description": description,
			"state":       state,
			"reviewersId": reviewersId,
			"items":       items,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// TODO: improve common methods usage instead of duplicating
func approveRequest2(e *httpexpect.Expect, requestId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation ApproveRequest($requestId: ID!) {
    approveRequest(input: { requestId: $requestId }) {
      request {
				id
				state
      }
    }
  }
`,
		Variables: map[string]any{
			"requestId": requestId,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func convertAnyToFloat32(a *anypb.Any) (float32, error) {
	var w wrapperspb.DoubleValue
	if err := a.UnmarshalTo(&w); err != nil {
		return 0, fmt.Errorf("failed to unmarshal Any to FloatValue: %w", err)
	}
	return float32(w.Value), nil
}

func convertAnyToInt64(a *anypb.Any) (int64, error) {
	var w wrapperspb.Int64Value
	if err := a.UnmarshalTo(&w); err != nil {
		return 0, fmt.Errorf("failed to unmarshal Any to IntValue: %w", err)
	}
	return int64(w.Value), nil
}

// GRPC Patch Star Count
func TestInternalPatchStarCountAPI(t *testing.T) {
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

	t.Run("Star project (first time) - should add user to starredBy and increment count", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// First call should star the project
		resp, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
		assert.NotNil(t, resp.Project)

		// Verify star count is 1 and user is in starredBy
		assert.Equal(t, int64(1), resp.Project.StarCount)
		assert.Contains(t, resp.Project.StarredBy, uId.String())
		assert.Len(t, resp.Project.StarredBy, 1)
	})

	t.Run("Unstar project (second time) - should remove user from starredBy and decrement count", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// Second call should unstar the project
		resp, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
		assert.NotNil(t, resp.Project)

		// Verify star count is 0 and user is not in starredBy
		assert.Equal(t, int64(0), resp.Project.StarCount)
		assert.NotContains(t, resp.Project.StarredBy, uId.String())
		assert.Len(t, resp.Project.StarredBy, 0)
	})

	t.Run("Star and unstar multiple times", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// Star the project (3rd time total)
		resp1, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), resp1.Project.StarCount)
		assert.Contains(t, resp1.Project.StarredBy, uId.String())
		assert.Len(t, resp1.Project.StarredBy, 1)

		// Unstar the project (4th time total)
		resp2, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
		assert.Equal(t, int64(0), resp2.Project.StarCount)
		assert.NotContains(t, resp2.Project.StarredBy, uId.String())
		assert.Len(t, resp2.Project.StarredBy, 0)

		// Star again (5th time total)
		resp3, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), resp3.Project.StarCount)
		assert.Contains(t, resp3.Project.StarredBy, uId.String())
		assert.Len(t, resp3.Project.StarredBy, 1)

		// Clean up - unstar
		_, err = client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)
	})

	t.Run("Star project using project ID instead of alias", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// Use project ID instead of alias
		resp, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: pid.String(),
		})
		assert.NoError(t, err)
		assert.NotNil(t, resp.Project)

		// Verify star count is 1 and user is in starredBy
		assert.Equal(t, int64(1), resp.Project.StarCount)
		assert.Contains(t, resp.Project.StarredBy, uId.String())
		assert.Equal(t, pid.String(), resp.Project.Id)

		// Clean up - unstar
		_, err = client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: pid.String(),
		})
		assert.NoError(t, err)
	})

	t.Run("Error cases", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// Non-existent project alias
		_, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: "non-existent-project",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not found")

		// Empty project alias
		_, err = client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: "",
		})
		assert.Error(t, err)

		// Missing user ID in metadata
		mdNoUser := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
		})
		mdCtxNoUser := metadata.NewOutgoingContext(t.Context(), mdNoUser)

		_, err = client.PatchStarCount(mdCtxNoUser, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.Error(t, err)

		// Invalid user ID format (should be rejected by user ID validation)
		mdInvalidUser := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       "invalid-user-id",
		})
		mdCtxInvalidUser := metadata.NewOutgoingContext(t.Context(), mdInvalidUser)

		_, err = client.PatchStarCount(mdCtxInvalidUser, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.Error(t, err)
		// Should get an error during user ID parsing in gRPC interceptor
	})

	t.Run("Star count persists across GetProject calls", func(t *testing.T) {
		md := metadata.New(map[string]string{
			"Authorization": "Bearer TestToken",
			"User-Id":       uId.String(),
		})
		mdCtx := metadata.NewOutgoingContext(t.Context(), md)

		// Star the project
		_, err := client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)

		// Get the project and verify the star count persisted
		getResp, err := client.GetProject(mdCtx, &pb.ProjectRequest{
			ProjectIdOrAlias: palias,
		})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), getResp.Project.StarCount)
		assert.Contains(t, getResp.Project.StarredBy, uId.String())

		// Unstar the project
		_, err = client.PatchStarCount(mdCtx, &pb.PatchStarCountRequest{
			ProjectAlias: palias,
		})
		assert.NoError(t, err)

		// Get the project again and verify the unstar persisted
		getResp2, err := client.GetProject(mdCtx, &pb.ProjectRequest{
			ProjectIdOrAlias: palias,
		})
		assert.NoError(t, err)
		assert.Equal(t, int64(0), getResp2.Project.StarCount)
		assert.Len(t, getResp2.Project.StarredBy, 0)
	})
}
