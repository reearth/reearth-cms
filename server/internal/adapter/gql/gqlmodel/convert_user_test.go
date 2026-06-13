package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	apiworkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToWorkspace(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	uid := accountdomain.NewUserID()
	iid := accountdomain.NewIntegrationID()
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uid,
	}
	w := workspace.New().ID(wid).
		Name("workspace").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uid: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iid: roleOwner,
		}).
		MustBuild()
	tests := []struct {
		name string
		arg  *workspace.Workspace
		want *Workspace
	}{
		{
			name: "ok",
			arg:  w,
			want: &Workspace{
				ID:    IDFrom(w.ID()),
				Name:  "workspace",
				Alias: lo.ToPtr(""),
				Members: []WorkspaceMember{
					&WorkspaceUserMember{
						UserID: IDFrom(uid),
						Role:   ToRole(workspace.RoleOwner),
					},
					&WorkspaceIntegrationMember{
						IntegrationID: IDFrom(iid),
						Role:          ToRole(workspace.RoleOwner),
						Active:        true,
						InvitedByID:   IDFrom(uid),
						InvitedBy:     nil,
						Integration:   nil,
					},
				},
			},
		},
		{
			name: "nil",
			arg:  nil,
			want: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToWorkspace(tt.arg))
		})
	}
}

func TestToRole(t *testing.T) {
	tests := []struct {
		name string
		arg  workspace.Role
		want Role
	}{
		{
			name: "RoleOwner",
			arg:  workspace.RoleOwner,
			want: RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  workspace.RoleMaintainer,
			want: RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  workspace.RoleWriter,
			want: RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  workspace.RoleReader,
			want: RoleReader,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			tt := tt
			t.Parallel()

			assert.Equal(t, tt.want, ToRole(tt.arg))
		})
	}
}

func TestFromRole(t *testing.T) {
	tests := []struct {
		name string
		arg  Role
		want workspace.Role
	}{
		{
			name: "RoleOwner",
			arg:  RoleOwner,
			want: workspace.RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  RoleMaintainer,
			want: workspace.RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  RoleWriter,
			want: workspace.RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  RoleReader,
			want: workspace.RoleReader,
		},
		{
			name: "Blank",
			arg:  Role(""),
			want: workspace.Role(""),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			tt := tt
			t.Parallel()

			assert.Equal(t, tt.want, FromRole(tt.arg))
		})
	}
}

func TestToWorkspaceFromAPI(t *testing.T) {

	// Create mock IDs
	wid := id.NewWorkspaceID()
	uid1 := id.NewUserID()
	uid2 := id.NewUserID()
	iid := id.NewIntegrationID()
	personalWid := id.NewWorkspaceID()

	// Create mock workspace with users and integrations
	mockWorkspace := apiworkspace.New().
		ID(wid).
		Name("Test Workspace").
		Alias("test-workspace").
		Personal(false).
		Members(map[apiworkspace.UserID]apiworkspace.Member{
			apiworkspace.UserID(uid1): {
				Role: apiworkspace.RoleOwner,
				Host: "example.com",
			},
			apiworkspace.UserID(uid2): {
				Role: apiworkspace.RoleWriter,
				Host: "",
			},
		}).
		Integrations(map[apiworkspace.IntegrationID]apiworkspace.Member{
			apiworkspace.IntegrationID(iid): {
				Role:      apiworkspace.RoleReader,
				InvitedBy: apiworkspace.UserID(uid1),
				Disabled:  false,
			},
		}).
		MustBuild()

	// Create personal workspace
	personalWorkspace := apiworkspace.New().
		ID(personalWid).
		Name("Personal Workspace").
		Personal(true).
		MustBuild()

	tests := []struct {
		name              string
		arg               *apiworkspace.Workspace
		want              *Workspace
		checkMembers      bool
		expectedUserCount int
		expectedIntCount  int
	}{
		{
			name:              "valid workspace with users and integrations",
			arg:               mockWorkspace,
			checkMembers:      true,
			expectedUserCount: 2,
			expectedIntCount:  1,
			want: &Workspace{
				ID:       IDFrom(wid),
				Name:     "Test Workspace",
				Alias:    lo.ToPtr("test-workspace"),
				Personal: false,
				Members:  nil, // We'll validate members separately
			},
		},
		{
			name:              "personal workspace",
			arg:               personalWorkspace,
			checkMembers:      false,
			expectedUserCount: 0,
			expectedIntCount:  0,
			want: &Workspace{
				ID:       IDFrom(personalWid),
				Name:     "Personal Workspace",
				Alias:    lo.ToPtr(""),
				Personal: true,
				Members:  []WorkspaceMember{},
			},
		},
		{
			name:              "nil workspace",
			arg:               nil,
			checkMembers:      false,
			expectedUserCount: 0,
			expectedIntCount:  0,
			want:              nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToWorkspaceFromAPI(tt.arg)

			if tt.want == nil {
				assert.Nil(t, result)
				return
			}

			// Test basic fields
			assert.NotNil(t, result)
			assert.Equal(t, tt.want.ID, result.ID)
			assert.Equal(t, tt.want.Name, result.Name)
			assert.Equal(t, tt.want.Alias, result.Alias)
			assert.Equal(t, tt.want.Personal, result.Personal)

			// Test members if needed
			if tt.checkMembers {
				// Count members by type
				userMembers := 0
				integrationMembers := 0

				for _, member := range result.Members {
					switch m := member.(type) {
					case *WorkspaceUserMember:
						userMembers++
						// Validate roles are converted correctly
						assert.Contains(t, []Role{RoleOwner, RoleWriter, RoleReader, RoleMaintainer}, m.Role)
					case *WorkspaceIntegrationMember:
						integrationMembers++
						assert.Contains(t, []Role{RoleOwner, RoleWriter, RoleReader, RoleMaintainer}, m.Role)
						// Integration should be active (not disabled)
						assert.True(t, m.Active)
					}
				}

				assert.Equal(t, tt.expectedUserCount, userMembers)
				assert.Equal(t, tt.expectedIntCount, integrationMembers)
			} else {
				// For non-member checking tests, just verify count
				assert.Equal(t, tt.expectedUserCount+tt.expectedIntCount, len(result.Members))
			}
		})
	}
}

func TestToRoleFromAPI(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		arg  apiworkspace.Role
		want Role
	}{
		{
			name: "RoleOwner",
			arg:  apiworkspace.RoleOwner,
			want: RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  apiworkspace.RoleMaintainer,
			want: RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  apiworkspace.RoleWriter,
			want: RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  apiworkspace.RoleReader,
			want: RoleReader,
		},
		{
			name: "Empty role",
			arg:  apiworkspace.Role(""),
			want: Role(""),
		},
		{
			name: "Unknown role",
			arg:  apiworkspace.Role("unknown"),
			want: Role(""),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToRoleFromAPI(tt.arg)
			assert.Equal(t, tt.want, result)
		})
	}
}
