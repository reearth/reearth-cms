package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/policy"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// trackingPolicyChecker is a mock that tracks which check type was used
type trackingPolicyChecker struct {
	allowed        bool
	message        string
	trackCheckType *gateway.PolicyCheckType
}

func (t *trackingPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	if t.trackCheckType != nil {
		*t.trackCheckType = req.CheckType
	}
	return &gateway.PolicyCheckResponse{
		Allowed:      t.allowed,
		CheckType:    req.CheckType,
		CurrentLimit: "test limit",
		Message:      t.message,
		Value:        req.Value,
	}, nil
}

func TestProject_Create_WithPolicyCheck(t *testing.T) {
	ws := workspace.New().NewID().MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()
	
	acop := &accountusecase.Operator{
		User:                 lo.ToPtr(u.ID()),
		WritableWorkspaces:   []accountdomain.WorkspaceID{ws.ID()},
		MaintainableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	tests := []struct {
		name          string
		visibility    project.Visibility
		policyAllowed bool
		policyMessage string
		wantErr       error
	}{
		{
			name:          "allowed private project",
			visibility:    project.VisibilityPrivate,
			policyAllowed: true,
			policyMessage: "Private project creation allowed",
			wantErr:       nil,
		},
		{
			name:          "denied private project",
			visibility:    project.VisibilityPrivate,
			policyAllowed: false,
			policyMessage: "Private project limit reached",
			wantErr:       interfaces.ErrProjectCreationLimitExceeded,
		},
		{
			name:          "allowed public project",
			visibility:    project.VisibilityPublic,
			policyAllowed: true,
			policyMessage: "Public project creation allowed",
			wantErr:       nil,
		},
		{
			name:          "denied public project",
			visibility:    project.VisibilityPublic,
			policyAllowed: false,
			policyMessage: "Public project limit reached",
			wantErr:       interfaces.ErrProjectCreationLimitExceeded,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.Background()
			db := memory.New()
			
			// Save workspace
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)

			// Create gateways with mock policy checker
			g := gateway.Container{
				PolicyChecker: &mockPolicyChecker{allowed: tc.policyAllowed, message: tc.policyMessage},
			}

			// Create project use case
			projectUC := NewProject(db, &g)

			// Try to create project
			name := "Test Project"
			_, err = projectUC.Create(ctx, interfaces.CreateProjectParam{
				WorkspaceID: ws.ID(),
				Name:        &name,
				Accessibility: &interfaces.AccessibilityParam{
					Visibility: &tc.visibility,
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

func TestProject_Create_WithPermissivePolicyChecker(t *testing.T) {
	ctx := context.Background()
	ws := workspace.New().NewID().MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()
	
	acop := &accountusecase.Operator{
		User:                 lo.ToPtr(u.ID()),
		WritableWorkspaces:   []accountdomain.WorkspaceID{ws.ID()},
		MaintainableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	db := memory.New()
	err := db.Workspace.Save(ctx, ws)
	assert.NoError(t, err)

	// Use the real permissive checker
	g := gateway.Container{
		PolicyChecker: policy.NewPermissiveChecker(),
	}

	projectUC := NewProject(db, &g)

	// Test creating both private and public projects - should always be allowed
	tests := []struct {
		name       string
		visibility project.Visibility
	}{
		{
			name:       "private project",
			visibility: project.VisibilityPrivate,
		},
		{
			name:       "public project",
			visibility: project.VisibilityPublic,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			projectName := "Test " + tc.name
			p, err := projectUC.Create(ctx, interfaces.CreateProjectParam{
				WorkspaceID: ws.ID(),
				Name:        &projectName,
				Accessibility: &interfaces.AccessibilityParam{
					Visibility: &tc.visibility,
				},
			}, op)

			assert.NoError(t, err, "Permissive policy checker should allow any project creation")
			assert.NotNil(t, p)
			assert.Equal(t, projectName, p.Name())
		})
	}
}

func TestProject_Create_DefaultVisibility(t *testing.T) {
	ctx := context.Background()
	ws := workspace.New().NewID().MustBuild()
	u := user.New().NewID().Name("test").Email("test@example.com").Workspace(ws.ID()).MustBuild()
	
	acop := &accountusecase.Operator{
		User:                 lo.ToPtr(u.ID()),
		WritableWorkspaces:   []accountdomain.WorkspaceID{ws.ID()},
		MaintainableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	db := memory.New()
	err := db.Workspace.Save(ctx, ws)
	assert.NoError(t, err)

	// Create a policy checker that tracks which check type was used
	var usedCheckType gateway.PolicyCheckType
	policyChecker := &trackingPolicyChecker{
		allowed: true,
		message: "allowed",
		trackCheckType: &usedCheckType,
	}

	g := gateway.Container{
		PolicyChecker: policyChecker,
	}

	projectUC := NewProject(db, &g)

	// Create project without specifying visibility - should default to private
	projectName := "Test Project"
	_, err = projectUC.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Name:        &projectName,
	}, op)

	assert.NoError(t, err)
	assert.Equal(t, gateway.PolicyCheckGeneralPrivateProjectCreation, usedCheckType, 
		"Should check private project creation policy when visibility is not specified")
}
