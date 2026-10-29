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

	tests := []struct {
		name            string
		user            string
		request         *pb.ListAssetsRequest
		wantErrCode     codes.Code
		wantErrContains string
		wantTotal       int64
		verify          func(t *testing.T, resp *pb.ListAssetsResponse)
	}{
		// Error cases
		{
			name:            "empty project_id returns invalid argument",
			user:            uId.String(),
			request:         &pb.ListAssetsRequest{ProjectId: ""},
			wantErrCode:     codes.InvalidArgument,
			wantErrContains: "project_id is required",
		},
		{
			name:            "non-existent project returns not found",
			user:            uId.String(),
			request:         &pb.ListAssetsRequest{ProjectId: id.NewProjectID().String()},
			wantErrCode:     codes.Unknown,
			wantErrContains: "not found",
		},
		{
			name:            "non-member user cannot list assets from private project",
			user:            uId_2.String(),
			request:         &pb.ListAssetsRequest{ProjectId: pid2.String()},
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		{
			name:            "no user cannot list assets from private project",
			user:            "",
			request:         &pb.ListAssetsRequest{ProjectId: pid2.String()},
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		// Success cases
		{
			name:      "workspace member can list assets from public project",
			user:      uId.String(),
			request:   &pb.ListAssetsRequest{ProjectId: pid.String()},
			wantTotal: 3,
			verify: func(t *testing.T, resp *pb.ListAssetsResponse) {
				a := resp.Assets[0]
				assert.Equal(t, aid1.String(), a.Id)
				assert.Equal(t, "aaa.jpg", a.Filename)
				assert.Nil(t, a.PreviewType)
				assert.Equal(t, uint64(1000), a.Size)
				assert.Nil(t, a.ArchiveExtractionStatus)
				assert.Equal(t, pid.String(), a.ProjectId)
				assert.Equal(t, false, a.Public)
			},
		},
		{
			name:      "workspace member can list assets from private project",
			user:      uId.String(),
			request:   &pb.ListAssetsRequest{ProjectId: pid2.String()},
			wantTotal: 1,
		},
		{
			name:      "non-member user can list assets from public project",
			user:      uId_2.String(),
			request:   &pb.ListAssetsRequest{ProjectId: pid.String()},
			wantTotal: 3,
		},
		{
			name:      "no user can list assets from public project",
			user:      "",
			request:   &pb.ListAssetsRequest{ProjectId: pid.String()},
			wantTotal: 3,
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

			l, err := client.ListAssets(mdCtx, tt.request)
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
			assert.Len(t, l.Assets, int(tt.wantTotal))
			if tt.verify != nil {
				tt.verify(t, l)
			}
		})
	}
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

	tests := []struct {
		name            string
		user            string
		assetId         string
		wantErrCode     codes.Code
		wantErrContains string
		verify          func(t *testing.T, a *pb.Asset)
	}{
		// Error cases
		{
			name:            "non-existent asset returns not found",
			user:            uId.String(),
			assetId:         id.NewAssetID().String(),
			wantErrCode:     codes.Unknown,
			wantErrContains: "not found",
		},
		{
			name:            "non-member user cannot get asset from private project",
			user:            uId_2.String(),
			assetId:         aid4.String(),
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		{
			name:            "no user cannot get asset from private project",
			user:            "",
			assetId:         aid4.String(),
			wantErrCode:     codes.NotFound,
			wantErrContains: "not found",
		},
		// Success cases
		{
			name:    "workspace member can get asset",
			user:    uId.String(),
			assetId: aid1.String(),
			verify: func(t *testing.T, a *pb.Asset) {
				assert.Equal(t, aid1.String(), a.Id)
				assert.Equal(t, "aaa.jpg", a.Filename)
				assert.Nil(t, a.PreviewType)
				assert.Equal(t, uint64(1000), a.Size)
				assert.Nil(t, a.ArchiveExtractionStatus)
				assert.Equal(t, pid.String(), a.ProjectId)
				assert.Equal(t, false, a.Public)
			},
		},
		{
			name:    "non-member user can get asset from public project",
			user:    uId_2.String(),
			assetId: aid1.String(),
		},
		{
			name:    "no user can get asset from public project",
			user:    "",
			assetId: aid1.String(),
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

			resp, err := client.GetAsset(mdCtx, &pb.AssetRequest{AssetId: tt.assetId})
			if tt.wantErrCode != codes.OK {
				assert.Error(t, err)
				assert.Nil(t, resp)
				st, ok := status.FromError(err)
				assert.True(t, ok, "error should be a gRPC status error")
				assert.Equal(t, tt.wantErrCode, st.Code())
				if tt.wantErrContains != "" {
					assert.Contains(t, st.Message(), tt.wantErrContains)
				}
				return
			}

			require.NoError(t, err)
			require.NotNil(t, resp.Asset)
			assert.Equal(t, tt.assetId, resp.Asset.Id)
			if tt.verify != nil {
				tt.verify(t, resp.Asset)
			}
		})
	}
}
