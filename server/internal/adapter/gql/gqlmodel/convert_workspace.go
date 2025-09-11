package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/workspace"
	"github.com/samber/lo"
)

// ToWorkspaces converts workspace.WorkspaceList to []*Workspace
func ToWorkspaces(workspaces workspace.WorkspaceList) []*Workspace {
	if workspaces == nil {
		return []*Workspace{}
	}

	result := make([]*Workspace, 0, len(workspaces))
	for _, ws := range workspaces {
		if converted := ToWorkspaceFromValue(ws); converted != nil {
			result = append(result, converted)
		}
	}
	return result
}

// ToWorkspaceFromValue converts workspace.Workspace (value) to *Workspace
func ToWorkspaceFromValue(ws workspace.Workspace) *Workspace {
	if ws.ID().IsEmpty() {
		return nil
	}

	// Convert single member to WorkspaceMember slice
	// Following the pattern from existing ToWorkspace function but adapted for our custom workspace
	members := []WorkspaceMember{} // Initialize as empty slice
	if member := ws.Member(); member != nil {
		members = convertMemberToWorkspaceMembers(member)
	}

	return &Workspace{
		ID:       IDFrom(ws.ID()),
		Name:     ws.Name(),
		Alias:    lo.EmptyableToPtr(ws.Alias()),
		Personal: ws.Personal(),
		Members:  members,
	}
}

// convertMemberToWorkspaceMembers converts our custom Member to []WorkspaceMember
// Similar to the member conversion logic in the existing ToWorkspace function
func convertMemberToWorkspaceMembers(member workspace.Member) []WorkspaceMember {
	var members []WorkspaceMember
	
	switch m := member.(type) {
	case workspace.UserMember:
		members = append(members, &WorkspaceUserMember{
			UserID: IDFrom(m.UserID),
			Role:   convertWorkspaceRole(m.Role),
			Host:   m.Host,
		})
	case workspace.IntegrationMember:
		members = append(members, &WorkspaceIntegrationMember{
			IntegrationID: IDFrom(m.IntegrationID),
			Role:          convertWorkspaceRole(m.Role),
			Active:        m.Active,
			InvitedByID:   IDFrom(m.InvitedByID),
			InvitedBy:     nil, // Not populated in this conversion
			Integration:   nil, // Not populated in this conversion
		})
	}
	
	return members
}

// convertWorkspaceRole converts our custom workspace.Role to gqlmodel.Role
// Replicates the logic from existing ToRole function but for our workspace package
func convertWorkspaceRole(r workspace.Role) Role {
	switch r {
	case workspace.RoleReader:
		return RoleReader
	case workspace.RoleWriter:
		return RoleWriter
	case workspace.RoleMaintainer:
		return RoleMaintainer
	case workspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}
