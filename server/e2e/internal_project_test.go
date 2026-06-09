package e2e

import (
	"errors"
	"fmt"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

// GRPC List Projects
func TestInternalListProjectsAPI(t *testing.T) {
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

	tests := []struct {
		name         string
		userId       string
		request      *pb.ListProjectsRequest
		wantTotal    int64
		wantProjects project.IDList
		wantErr      error
	}{
		{
			name:         "without any parameters should return only public projects",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "for the workspace should return all projects in the workspace",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}},
			wantTotal:    2,
			wantProjects: project.IDList{pid, pid2},
		},
		{
			name:         "for the workspace with PublicOnly = true should return only public projects in the workspace",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}, PublicOnly: true},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with keyword (exact project id)",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{Keyword: pid.StringRef()},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with keyword (alias)",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{Keyword: &palias},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with keyword (topics)",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{Keyword: lo.ToPtr("topic1")},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with topics",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{Topics: []string{"topic1"}},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with topic (private project)",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}, PublicOnly: false, Topics: []string{"topic2"}},
			wantTotal:    1,
			wantProjects: project.IDList{pid2},
		},
		{
			name:         "with multiple topics",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}, PublicOnly: false, Topics: []string{"topic1", "topic3"}},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:         "with non-existence topics",
			userId:       uId.String(),
			request:      &pb.ListProjectsRequest{Topics: []string{"non-existence-topic"}},
			wantTotal:    0,
			wantProjects: project.IDList{},
		},
		{
			name:         "for workspace with non-member user should return only public projects",
			userId:       uId_2.String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
		{
			name:    "for workspace with member & non-member user should return not supported error",
			userId:  uId_2.String(),
			request: &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String(), wId1.String()}},
			wantErr: status.Error(codes.InvalidArgument, "mixed workspaces"),
		},
		{
			name:         "for workspace with non-existing user should return only public projects",
			userId:       id.NewUserID().String(),
			request:      &pb.ListProjectsRequest{WorkspaceIds: []string{wId0.String()}},
			wantTotal:    1,
			wantProjects: project.IDList{pid},
		},
	}

	for _, tt := range tests {
		t.Run("List Projects "+tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.userId,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			l, err := client.ListProjects(mdCtx, tt.request)
			if tt.wantErr != nil {
				assert.Nil(t, l)
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.wantTotal, l.TotalCount)
			assert.Len(t, l.Projects, len(tt.wantProjects))

			for i, want := range tt.wantProjects {
				if i >= len(l.Projects) {
					break
				}
				gotProject := l.Projects[i]
				_, wantProject := getProject(e, want.String())

				assert.Equal(t, wantProject.Path("$.data.node.name").Raw().(string), gotProject.GetName())
				assert.Equal(t, wantProject.Path("$.data.node.alias").Raw().(string), gotProject.GetAlias())
				//assert.Equal(t, wantProject.Path("$.data.workspace.id"), gotProject.WorkspaceId)
				assert.Equal(t, wantProject.Path("$.data.node.description").Raw().(string), gotProject.GetDescription())

				// TODO: assert ptoject.topics
			}
		})
	}
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

	p1 := project.New().ID(pid).Workspace(wId0).Name("p1").Alias(palias).Description("p1 desc").MustBuild()
	p2 := project.New().ID(pid2).Workspace(wId0).Name("p2").Alias(palias2).Description("p2 desc").MustBuild()

	tests := []struct {
		name      string
		user      string
		workspace string
		alias     string
		project   *project.Project
		err       error
	}{
		// public project
		{
			name:      "Get project owned by the user should return the project",
			workspace: wId0.String(),
			alias:     palias,
			user:      uId.String(),
			project:   p1,
		},
		{
			name:      "Get project with non-existing user = should return the project",
			workspace: wId0.String(),
			alias:     palias,
			user:      id.NewUserID().String(),
			project:   p1,
		},
		{
			name:      "Get project not owned by the user = should return the project",
			workspace: wId0.String(),
			alias:     palias,
			user:      uId_2.String(),
			project:   p1,
		},

		// private project
		{
			name:      "Get project owned by the user = should return the project",
			workspace: wId0.String(),
			alias:     palias2,
			user:      uId.String(),
			project:   p2,
		},
		{
			name:      "Get project not owned by the user = should not return the project",
			workspace: wId0.String(),
			alias:     palias2,
			user:      uId_2.String(),
			err:       errors.New("not found"),
		},
		{
			name:      "Get project not owned by the user = should return the project",
			workspace: wId0.String(),
			alias:     palias2,
			user:      id.NewUserID().String(),
			err:       errors.New("not found"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			p, err := client.GetProject(mdCtx, &pb.ProjectRequest{WorkspaceIdOrAlias: tt.workspace, ProjectIdOrAlias: tt.alias})
			if tt.err != nil {
				assert.ErrorContains(t, err, tt.err.Error())
				assert.Nil(t, p)
				return
			}

			require.NoError(t, err)
			require.NotNil(t, p)
			require.NotNil(t, p.Project)
			p1 := p.Project
			assert.Equal(t, tt.project.ID().String(), p1.Id)
			assert.Equal(t, tt.project.Name(), p1.Name)
			assert.Equal(t, tt.project.Alias(), p1.Alias)
			assert.Equal(t, tt.project.Workspace().String(), p1.WorkspaceId)
			assert.Equal(t, new(tt.project.Description()), p1.Description)
		})
	}
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

	p, err := client.CheckAliasAvailability(mdCtx, &pb.AliasAvailabilityRequest{WorkspaceId: wId0.String(), Alias: palias})
	assert.NoError(t, err)
	assert.False(t, p.Available)

	p, err = client.CheckAliasAvailability(mdCtx, &pb.AliasAvailabilityRequest{WorkspaceId: wId0.String(), Alias: "new_alias"})
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

	tests := []struct {
		name       string
		user       string
		request    *pb.CreateProjectRequest
		wantName   string
		wantAlias  string
		wantDesc   *string
		wantTopics []string
		wantError  error
	}{
		{
			name: "basic project without topics",
			user: uId.String(),
			request: &pb.CreateProjectRequest{
				Name:        "New Project",
				Alias:       "new_project",
				Description: lo.ToPtr("This is a new project"),
				WorkspaceId: wId0.String(),
			},
			wantName:  "New Project",
			wantAlias: "new_project",
			wantDesc:  lo.ToPtr("This is a new project"),
		},
		{
			name: "project with topics deduplicates and removes empty values",
			user: uId.String(),
			request: &pb.CreateProjectRequest{
				Name:        "Project With Topics",
				Alias:       "project_with_topics",
				Description: lo.ToPtr("Project with topics"),
				Topics:      &pb.Topics{Values: []string{"topic1", "topic2", "", "topic1", "topic3", "", "topic2"}},
				WorkspaceId: wId0.String(),
			},
			wantName:   "Project With Topics",
			wantAlias:  "project_with_topics",
			wantDesc:   lo.ToPtr("Project with topics"),
			wantTopics: []string{"topic1", "topic2", "topic3"},
		},
		{
			name: "create project on a workspace without user",
			user: "",
			request: &pb.CreateProjectRequest{
				Name:        "Project 1",
				Alias:       "project_1",
				Description: lo.ToPtr("Project"),
				WorkspaceId: wId0.String(),
			},
			wantError: status.Error(codes.PermissionDenied, "no permission to create project in this workspace"),
		},
		{
			name: "create project on a workspace with non-member user",
			user: uId_2.String(),
			request: &pb.CreateProjectRequest{
				Name:        "Project 1",
				Alias:       "project_1",
				Description: lo.ToPtr("Project"),
				WorkspaceId: wId0.String(),
			},
			wantError: status.Error(codes.PermissionDenied, "no permission to create project in this workspace"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			res, err := client.CreateProject(mdCtx, tt.request)
			if tt.wantError != nil {
				assert.ErrorIs(t, err, tt.wantError)
				assert.Nil(t, res)
				return
			}
			require.NoError(t, err)

			assert.Equal(t, tt.wantName, res.Project.Name)
			assert.Equal(t, tt.wantAlias, res.Project.Alias)
			assert.Equal(t, tt.request.WorkspaceId, res.Project.WorkspaceId)
			assert.Equal(t, tt.wantDesc, res.Project.Description)
			assert.Equal(t, tt.wantTopics, res.Project.Topics)

			p, err := client.GetProject(mdCtx, &pb.ProjectRequest{
				WorkspaceIdOrAlias: tt.request.WorkspaceId,
				ProjectIdOrAlias:   tt.request.Alias,
			})
			require.NoError(t, err)
			require.NotNil(t, p.Project)

			assert.Equal(t, tt.wantName, p.Project.Name)
			assert.Equal(t, tt.wantAlias, p.Project.Alias)
			assert.Equal(t, tt.request.WorkspaceId, p.Project.WorkspaceId)
			assert.Equal(t, tt.wantDesc, p.Project.Description)
			assert.Equal(t, tt.wantTopics, p.Project.Topics)
		})
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

	tests := []struct {
		name        string
		user        string
		request     *pb.UpdateProjectRequest
		lookupAlias string
		wantName    string
		wantAlias   string
		wantDesc    *string
		wantId      string
		wantTopics  []string
		wantErr     error
	}{
		{
			name: "update name, description and alias",
			user: uId.String(),
			request: &pb.UpdateProjectRequest{
				ProjectId:   pid.String(),
				Name:        lo.ToPtr("Updated Project Name"),
				Description: lo.ToPtr("Updated project description"),
				Alias:       lo.ToPtr("updated_alias"),
			},
			lookupAlias: "updated_alias",
			wantName:    "Updated Project Name",
			wantAlias:   "updated_alias",
			wantDesc:    lo.ToPtr("Updated project description"),
			wantId:      pid.String(),
			wantTopics:  []string{"topic1", "", "topic3"},
		},
		{
			name: "update topics deduplicates and removes empty values",
			user: uId.String(),
			request: &pb.UpdateProjectRequest{
				ProjectId: pid.String(),
				Topics:    &pb.Topics{Values: []string{"topic1", "", "topic2", "topic1", "", "topic3", "topic2"}},
			},
			wantId:      pid.String(),
			lookupAlias: pid.String(),
			wantTopics:  []string{"topic1", "topic2", "topic3"},
		},
		{
			name: "empty topics array clears topics",
			user: uId.String(),
			request: &pb.UpdateProjectRequest{
				ProjectId: pid.String(),
				Topics:    &pb.Topics{Values: []string{}},
			},
			wantId:      pid.String(),
			lookupAlias: pid.String(),
			wantTopics:  nil,
		},
		{
			name: "non-member user should fail",
			user: uId_2.String(),
			request: &pb.UpdateProjectRequest{
				ProjectId: pid.String(),
				Name:      new("new name"),
			},
			wantErr: status.Error(codes.PermissionDenied, "no permission to update this project"),
		},
		{
			name: "without user should fail",
			user: "",
			request: &pb.UpdateProjectRequest{
				ProjectId: pid.String(),
				Name:      new("new name"),
			},
			wantErr: status.Error(codes.PermissionDenied, "no permission to update this project"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			res, err := client.UpdateProject(mdCtx, tt.request)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, res)
				return
			}

			require.NoError(t, err)

			p, err := client.GetProject(mdCtx, &pb.ProjectRequest{
				WorkspaceIdOrAlias: wId0.String(),
				ProjectIdOrAlias:   tt.lookupAlias,
			})

			require.NoError(t, err)
			require.NotNil(t, p.Project)

			assert.Equal(t, tt.wantId, p.Project.Id)
			assert.Equal(t, tt.wantId, res.Project.Id)
			assert.Equal(t, wId0.String(), p.Project.WorkspaceId)
			assert.Equal(t, wId0.String(), res.Project.WorkspaceId)
			if tt.request.Name != nil {
				assert.Equal(t, tt.wantName, p.Project.Name)
				assert.Equal(t, tt.wantName, res.Project.Name)
			}
			if tt.request.Alias != nil {
				assert.Equal(t, tt.wantAlias, p.Project.Alias)
				assert.Equal(t, tt.wantAlias, res.Project.Alias)
			}
			if tt.request.Description != nil {
				assert.Equal(t, tt.wantDesc, p.Project.Description)
				assert.Equal(t, tt.wantDesc, res.Project.Description)
			}
			if tt.request.Topics != nil {
				assert.Equal(t, tt.wantTopics, p.Project.Topics)
				assert.Equal(t, tt.wantTopics, res.Project.Topics)
			}
		})
	}
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

	tests := []struct {
		name      string
		user      string
		projectId string
		wantErr   error
	}{
		{
			name:      "without user cannot delete project",
			user:      "",
			projectId: pid.String(),
			wantErr:   status.Error(codes.PermissionDenied, "no permission to delete this project"),
		},
		{
			name:      "non-member user cannot delete project",
			user:      uId_2.String(),
			projectId: pid.String(),
			wantErr:   status.Error(codes.PermissionDenied, "no permission to delete this project"),
		},
		{
			name:      "non-existent project should return not found",
			user:      uId.String(),
			projectId: id.NewProjectID().String(),
			wantErr:   errors.New("not found"),
		},
		{
			name:      "workspace member with write permission can delete project",
			user:      uId.String(),
			projectId: pid.String(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			res, err := client.DeleteProject(mdCtx, &pb.DeleteProjectRequest{ProjectId: tt.projectId})
			if tt.wantErr != nil {
				assert.Nil(t, res)
				if _, ok := status.FromError(tt.wantErr); ok {
					assert.ErrorIs(t, err, tt.wantErr)
				} else {
					assert.ErrorContains(t, err, tt.wantErr.Error())
				}
				return
			}

			require.NoError(t, err)
			require.NotNil(t, res)
			assert.Equal(t, tt.projectId, res.ProjectId)

			_, err = client.GetProject(mdCtx, &pb.ProjectRequest{
				WorkspaceIdOrAlias: wId0.String(),
				ProjectIdOrAlias:   tt.projectId,
			})
			assert.Error(t, err)
		})
	}
}

// GRPC Star Project
func TestInternalStarProjectAPI(t *testing.T) {
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

	tests := []struct {
		name             string
		user             string
		workspaceAlias   string
		projectAlias     string
		wantErrCode      codes.Code
		wantErrContains  string
		wantStarCount    int64
		wantStarredBy    []string
		wantNotStarredBy []string
	}{
		// Error cases — do not modify star state
		{
			name:            "non-existent project alias returns not found",
			user:            uId.String(),
			workspaceAlias:  wId0.String(),
			projectAlias:    "non-existent-project",
			wantErrCode:     codes.Unknown,
			wantErrContains: "not found",
		},
		{
			name:            "empty project alias returns invalid argument",
			user:            uId.String(),
			workspaceAlias:  wId0.String(),
			projectAlias:    "",
			wantErrCode:     codes.InvalidArgument,
			wantErrContains: "project_alias is required",
		},
		{
			name:            "missing user ID in metadata returns user not found",
			workspaceAlias:  wId0.String(),
			projectAlias:    palias,
			wantErrCode:     codes.Unknown,
			wantErrContains: "user not found",
		},
		{
			name:           "invalid user ID format returns error",
			user:           "invalid-user-id",
			workspaceAlias: wId0.String(),
			projectAlias:   palias,
			wantErrCode:    codes.Unknown,
		},
		// Sequential star/unstar operations — each row builds on the previous state
		{
			name:           "first star by member increments count to 1",
			user:           uId.String(),
			workspaceAlias: wId0.String(),
			projectAlias:   palias,
			wantStarCount:  1,
			wantStarredBy:  []string{uId.String()},
		},
		{
			name:             "second star by member decrements count to 0 (toggle unstar)",
			user:             uId.String(),
			workspaceAlias:   wId0.String(),
			projectAlias:     palias,
			wantStarCount:    0,
			wantNotStarredBy: []string{uId.String()},
		},
		{
			name:           "star again confirms toggle is idempotent",
			user:           uId.String(),
			workspaceAlias: wId0.String(),
			projectAlias:   palias,
			wantStarCount:  1,
			wantStarredBy:  []string{uId.String()},
		},
		{
			name:             "unstar again confirms toggle is idempotent",
			user:             uId.String(),
			workspaceAlias:   wId0.String(),
			projectAlias:     palias,
			wantStarCount:    0,
			wantNotStarredBy: []string{uId.String()},
		},
		{
			name:           "star using project ID instead of alias",
			user:           uId.String(),
			workspaceAlias: wId0.String(),
			projectAlias:   pid.String(),
			wantStarCount:  1,
			wantStarredBy:  []string{uId.String()},
		},
		{
			name:             "unstar using project ID",
			user:             uId.String(),
			workspaceAlias:   wId0.String(),
			projectAlias:     pid.String(),
			wantStarCount:    0,
			wantNotStarredBy: []string{uId.String()},
		},
		// Non-member user can star and unstar public projects
		{
			name:           "star by non-member user succeeds",
			user:           uId_2.String(),
			workspaceAlias: wId0.String(),
			projectAlias:   pid.String(),
			wantStarCount:  1,
			wantStarredBy:  []string{uId_2.String()},
		},
		{
			name:             "unstar by non-member user succeeds",
			user:             uId_2.String(),
			workspaceAlias:   wId0.String(),
			projectAlias:     pid.String(),
			wantStarCount:    0,
			wantNotStarredBy: []string{uId_2.String()},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() should not be used here as tests build on each other's state
			mdFields := map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			}
			mdCtx := metadata.NewOutgoingContext(t.Context(), metadata.New(mdFields))

			res, err := client.StarProject(mdCtx, &pb.StarRequest{
				WorkspaceAlias: tt.workspaceAlias,
				ProjectAlias:   tt.projectAlias,
			})

			if tt.wantErrCode != codes.OK {
				assert.Error(t, err)
				assert.Nil(t, res)
				st, ok := status.FromError(err)
				assert.True(t, ok, "error should be a gRPC status error")
				assert.Equal(t, tt.wantErrCode, st.Code())
				if tt.wantErrContains != "" {
					assert.Contains(t, st.Message(), tt.wantErrContains)
				}
				return
			}

			require.NoError(t, err)
			require.NotNil(t, res)
			require.NotNil(t, res.Project)
			assert.Equal(t, tt.wantStarCount, res.Project.StarCount)
			assert.Len(t, res.Project.StarredBy, int(tt.wantStarCount))
			for _, u := range tt.wantStarredBy {
				assert.Contains(t, res.Project.StarredBy, u)
			}
			for _, u := range tt.wantNotStarredBy {
				assert.NotContains(t, res.Project.StarredBy, u)
			}

			// Verify star state persists when fetched via GetProject
			getRes, err := client.GetProject(mdCtx, &pb.ProjectRequest{
				WorkspaceIdOrAlias: tt.workspaceAlias,
				ProjectIdOrAlias:   tt.projectAlias,
			})
			require.NoError(t, err)
			require.NotNil(t, getRes.Project)
			assert.Equal(t, tt.wantStarCount, getRes.Project.StarCount)
			assert.Len(t, getRes.Project.StarredBy, int(tt.wantStarCount))
			for _, u := range tt.wantStarredBy {
				assert.Contains(t, getRes.Project.StarredBy, u)
			}
			for _, u := range tt.wantNotStarredBy {
				assert.NotContains(t, getRes.Project.StarredBy, u)
			}
		})
	}
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
