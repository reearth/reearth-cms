package interactor

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/policy"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

// Mock policy checker that can be configured to allow or deny
type mockPolicyChecker struct {
	allowed bool
	message string
}

func (m *mockPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	return &gateway.PolicyCheckResponse{
		Allowed:      m.allowed,
		CheckType:    req.CheckType,
		CurrentLimit: "test limit",
		Message:      m.message,
		Value:        req.Value,
	}, nil
}

func TestAsset_Create_WithPolicyCheck(t *testing.T) {
	ws := workspace.New().NewID().MustBuild()
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(ws.ID()).MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()

	acop := &accountusecase.Operator{
		User:               lo.ToPtr(u.ID()),
		WritableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	tests := []struct {
		name          string
		fileSize      int64
		policyAllowed bool
		policyMessage string
		wantErr       error
	}{
		{
			name:          "allowed upload",
			fileSize:      1024,
			policyAllowed: true,
			policyMessage: "Upload allowed",
			wantErr:       nil,
		},
		{
			name:          "denied upload - size limit exceeded",
			fileSize:      1024 * 1024 * 1024, // 1GB
			policyAllowed: false,
			policyMessage: "Upload size limit exceeded",
			wantErr:       interfaces.ErrAssetUploadSizeLimitExceeded,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.Background()
			db := memory.New()

			// Save project and workspace
			err := db.Project.Save(ctx, p)
			assert.NoError(t, err)
			err = db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)

			// Create gateways with mock policy checker
			g := gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
				PolicyChecker: &mockPolicyChecker{allowed: tc.policyAllowed, message: tc.policyMessage},
			}

			// Create asset use case
			assetUC := NewAsset(db, &g)

			// Create file with specified size
			content := bytes.Repeat([]byte("a"), int(tc.fileSize))
			buf := bytes.NewBuffer(content)

			// Try to create asset
			_, _, err = assetUC.Create(ctx, interfaces.CreateAssetParam{
				ProjectID: pid,
				File: &file.File{
					Name:    "test.txt",
					Content: io.NopCloser(buf),
					Size:    tc.fileSize,
				},
			}, op)

			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestAsset_Create_WithPermissivePolicyChecker(t *testing.T) {
	ctx := context.Background()
	ws := workspace.New().NewID().MustBuild()
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(ws.ID()).MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()

	acop := &accountusecase.Operator{
		User:               lo.ToPtr(u.ID()),
		WritableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	db := memory.New()
	err := db.Project.Save(ctx, p)
	assert.NoError(t, err)
	err = db.Workspace.Save(ctx, ws)
	assert.NoError(t, err)

	// Use the real permissive checker
	g := gateway.Container{
		File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
		PolicyChecker: policy.NewPermissiveChecker(),
	}

	assetUC := NewAsset(db, &g)

	// Test with reasonable file size - permissive checker should allow it
	// Note: The file gateway still has its own hard limit of 10GB
	fileSize := int64(100 * 1024 * 1024) // 100MB
	content := bytes.NewBufferString("test content")

	_, _, err = assetUC.Create(ctx, interfaces.CreateAssetParam{
		ProjectID: pid,
		File: &file.File{
			Name:    "test.txt",
			Content: io.NopCloser(content),
			Size:    fileSize,
		},
	}, op)

	assert.NoError(t, err, "Permissive policy checker should allow file uploads")
}

func TestAsset_Create_WithHTTPPolicyChecker(t *testing.T) {
	// Create test HTTP server
	httpCalled := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		httpCalled = true

		var req gateway.PolicyCheckRequest
		_ = json.NewDecoder(r.Body).Decode(&req)

		// Deny large files
		allowed := req.Value < 1024*1024 // 1MB limit

		resp := gateway.PolicyCheckResponse{
			Allowed:      allowed,
			CheckType:    req.CheckType,
			CurrentLimit: "1MB",
			Message:      "Test HTTP policy",
			Value:        req.Value,
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	ctx := context.Background()
	ws := workspace.New().NewID().MustBuild()
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(ws.ID()).MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()

	acop := &accountusecase.Operator{
		User:               lo.ToPtr(u.ID()),
		WritableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	db := memory.New()
	err := db.Project.Save(ctx, p)
	assert.NoError(t, err)
	err = db.Workspace.Save(ctx, ws)
	assert.NoError(t, err)

	// Use HTTP policy checker
	g := gateway.Container{
		File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
		PolicyChecker: policy.NewHTTPPolicyChecker(server.URL, "", 5),
	}

	assetUC := NewAsset(db, &g)

	// Test with small file - should be allowed
	content := bytes.NewBufferString("small file")
	_, _, err = assetUC.Create(ctx, interfaces.CreateAssetParam{
		ProjectID: pid,
		File: &file.File{
			Name:    "small.txt",
			Content: io.NopCloser(content),
			Size:    int64(content.Len()),
		},
	}, op)

	assert.NoError(t, err)
	assert.True(t, httpCalled, "HTTP endpoint should have been called")

	// Test with large file - should be denied
	httpCalled = false
	largeContent := bytes.NewBuffer(make([]byte, 2*1024*1024)) // 2MB
	_, _, err = assetUC.Create(ctx, interfaces.CreateAssetParam{
		ProjectID: pid,
		File: &file.File{
			Name:    "large.txt",
			Content: io.NopCloser(largeContent),
			Size:    int64(largeContent.Len()),
		},
	}, op)

	assert.ErrorIs(t, err, interfaces.ErrAssetUploadSizeLimitExceeded)
	assert.True(t, httpCalled, "HTTP endpoint should have been called")
}
