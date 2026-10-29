package e2e

import (
	"testing"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

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

	tests := []struct {
		name            string
		user            string
		projectId       string
		wantErrCode     codes.Code
		wantErrContains string
		wantTotal       int64
	}{
		// Error cases
		{
			name:            "empty project_id returns invalid argument",
			user:            uId.String(),
			projectId:       "",
			wantErrCode:     codes.InvalidArgument,
			wantErrContains: "project_id is required",
		},
		{
			name:            "non-existent project returns not found",
			user:            uId.String(),
			projectId:       id.NewProjectID().String(),
			wantErrCode:     codes.Unknown,
			wantErrContains: "not found",
		},
		{
			name:            "non-member user cannot list models from private project",
			user:            uId_2.String(),
			projectId:       pid2.String(),
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		// Success cases
		{
			name:      "workspace member can list models from public project",
			user:      uId.String(),
			projectId: pid.String(),
			wantTotal: 7,
		},
		{
			name:      "workspace member can list models from private project",
			user:      uId.String(),
			projectId: pid2.String(),
			wantTotal: 1,
		},
		{
			name:      "non-member user can list models from public project",
			user:      uId_2.String(),
			projectId: pid.String(),
			wantTotal: 7,
		},
		{
			name:      "no user can list models from public project",
			user:      "",
			projectId: pid.String(),
			wantTotal: 7,
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

			l, err := client.ListModels(mdCtx, &pb.ListModelsRequest{ProjectId: tt.projectId})
			if tt.wantErrCode != codes.OK {
				assert.Error(t, err)
				assert.Nil(t, l)
				st, ok := status.FromError(err)
				assert.True(t, ok, "error should be a gRPC status error")
				assert.Equal(t, tt.wantErrCode, st.Code())
				if tt.wantErrContains != "" {
					assert.Contains(t, st.Message(), tt.wantErrContains)
				}
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tt.wantTotal, l.TotalCount)
			assert.Len(t, l.Models, int(tt.wantTotal))
		})
	}
}

// GRPC Get Model
func TestInternalGetModelAPI(t *testing.T) {
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
	require.NoError(t, err)

	client := pb.NewReEarthCMSClient(clientConn)

	nonMemberUserID := id.NewUserID().String()

	tests := []struct {
		name    string
		userID  string
		req     *pb.ModelRequest
		wantErr error
		wantID  string
	}{
		{
			name:   "get model by IDs",
			userID: uId.String(),
			req:    &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: pid.String(), ModelIdOrAlias: mId1.String()},
			wantID: mId1.String(),
		},
		{
			name:   "get model by aliases",
			userID: uId.String(),
			req:    &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias, ModelIdOrAlias: ikey1.String()},
			wantID: mId1.String(),
		},
		{
			name:   "get model from private project owned by the user",
			userID: uId.String(),
			req:    &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias2, ModelIdOrAlias: mId6.String()},
			wantID: mId6.String(),
		},
		{
			name:   "get model from public project without logged in user",
			userID: "",
			req:    &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias, ModelIdOrAlias: ikey1.String()},
			wantID: mId1.String(),
		},
		{
			name:   "get model from public project with non-member user",
			userID: uId_2.String(),
			req:    &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias, ModelIdOrAlias: ikey1.String()},
			wantID: mId1.String(),
		},
		{
			name:    "get model from private project with non-member user",
			userID:  nonMemberUserID,
			req:     &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias2, ModelIdOrAlias: mId6.String()},
			wantErr: status.Error(codes.NotFound, "not found"),
		},
		{
			name:    "get model from private project without logged in user",
			userID:  "",
			req:     &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias2, ModelIdOrAlias: mId6.String()},
			wantErr: status.Error(codes.NotFound, "not found"),
		},
		{
			name:    "non-existent model returns not found",
			userID:  uId.String(),
			req:     &pb.ModelRequest{WorkspaceIdOrAlias: wId0.String(), ProjectIdOrAlias: palias, ModelIdOrAlias: id.NewModelID().String()},
			wantErr: status.Error(codes.Unknown, "not found"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.userID,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			m, err := client.GetModel(mdCtx, tt.req)
			if tt.wantErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, m)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.wantID, m.Model.Id)

			_, _, res := getModel(e, tt.wantID)
			assert.Equal(t, res.Path("$.data.node.name").Raw().(string), m.Model.Name)
			assert.Equal(t, res.Path("$.data.node.key").Raw().(string), m.Model.Key)
			assert.Equal(t, res.Path("$.data.node.description").Raw().(string), m.Model.Description)
			assert.Equal(t, res.Path("$.data.node.schema.id").Raw().(string), m.Model.Schema.SchemaId)
		})
	}
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

	tests := []struct {
		name            string
		setup           func()
		user            string
		request         *pb.ListItemsRequest
		wantErrCode     codes.Code
		wantErrContains string
		wantTotal       int64
		wantItemIds     []string
		verify          func(t *testing.T, items []*pb.Item)
	}{
		// Error cases
		{
			name:            "empty model_id returns invalid argument",
			user:            uId.String(),
			request:         &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: ""},
			wantErrCode:     codes.InvalidArgument,
			wantErrContains: "model_id is required",
		},
		{
			name:            "non-existent model returns not found",
			user:            uId.String(),
			request:         &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: id.NewModelID().String()},
			wantErrCode:     codes.Unknown,
			wantErrContains: "not found",
		},
		// Sequential success cases — each setup builds on the previous state
		{
			name:      "model with no published items returns empty list",
			user:      uId.String(),
			request:   &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()},
			wantTotal: 0,
		},
		{
			name: "model returns item after its request is approved",
			setup: func() {
				res := createRequest2(e, pid.String(), "test", new("test"), new("WAITING"), []string{uId.String()}, []any{map[string]any{"itemId": itmId1.String(), "version": "latest"}})
				approveRequest2(e, res.Path("$.data.createRequest.request.id").String().Raw())
			},
			user:        uId.String(),
			request:     &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()},
			wantTotal:   1,
			wantItemIds: []string{itmId1.String()},
		},
		{
			name:        "non-member user can list published items from public project model",
			user:        uId_2.String(),
			request:     &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()},
			wantTotal:   1,
			wantItemIds: []string{itmId1.String()},
		},
		{
			name:        "no user can list published items from public project model",
			user:        "",
			request:     &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId1.String()},
			wantTotal:   1,
			wantItemIds: []string{itmId1.String()},
		},
		{
			name:            "non-member user cannot list items from private project model",
			user:            uId_2.String(),
			request:         &pb.ListItemsRequest{ProjectId: pid2.String(), ModelId: mId6.String()},
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		{
			name:            "no user cannot list items from private project model",
			user:            "",
			request:         &pb.ListItemsRequest{ProjectId: pid2.String(), ModelId: mId6.String()},
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		{
			name: "model with number and integer fields returns correct field values",
			setup: func() {
				res := createRequest2(e, pid.String(), "test", new("test"), new("WAITING"), []string{uId.String()}, []any{map[string]any{"itemId": itmId6.String(), "version": "latest"}})
				approveRequest2(e, res.Path("$.data.createRequest.request.id").String().Raw())
			},
			user:        uId.String(),
			request:     &pb.ListItemsRequest{ProjectId: pid.String(), ModelId: mId5.String()},
			wantTotal:   1,
			wantItemIds: []string{itmId6.String()},
			verify: func(t *testing.T, items []*pb.Item) {
				f, err := convertAnyToFloat32(items[0].Fields["number-key"])
				assert.NoError(t, err)
				assert.Equal(t, float32(21.2), f)

				i, err := convertAnyToInt64(items[0].Fields["integer-key"])
				assert.NoError(t, err)
				assert.Equal(t, int64(123), i)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup()
			}

			md := metadata.New(map[string]string{
				"Authorization": "Bearer TestToken",
				"User-Id":       tt.user,
			})
			mdCtx := metadata.NewOutgoingContext(t.Context(), md)

			l, err := client.ListItems(mdCtx, tt.request)
			if tt.wantErrCode != codes.OK {
				assert.Error(t, err)
				assert.Nil(t, l)
				st, ok := status.FromError(err)
				assert.True(t, ok, "error should be a gRPC status error")
				assert.Equal(t, tt.wantErrCode, st.Code())
				if tt.wantErrContains != "" {
					assert.Contains(t, st.Message(), tt.wantErrContains)
				}
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tt.wantTotal, l.TotalCount)
			assert.Len(t, l.Items, int(tt.wantTotal))
			for i, wantId := range tt.wantItemIds {
				if i < len(l.Items) {
					assert.Equal(t, wantId, l.Items[i].Id)
				}
			}

			if tt.verify != nil {
				tt.verify(t, l.Items)
			}
		})
	}
}
