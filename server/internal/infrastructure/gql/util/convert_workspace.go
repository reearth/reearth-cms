package util

import (
	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/workspace"
)

func ToWorkspace(w gqlmodel.Workspace) *workspace.Workspace {
	id, err := workspace.IDFrom(string(w.ID))
	if err != nil {
		return nil
	}
	return workspace.New().
		ID(id).
		Name(string(w.Name)).
		Alias(string(w.Alias)).
		Metadata(ToWorkspaceMetadata(w.Metadata)).
		MustBuild()
}

func ToWorkspaces(gqlWorkspaces []gqlmodel.Workspace) workspace.WorkspaceList {
	workspaces := make(workspace.WorkspaceList, 0, len(gqlWorkspaces))
	for _, w := range gqlWorkspaces {
		if ws := ToWorkspace(w); ws != nil {
			workspaces = append(workspaces, *ws)
		}
	}
	return workspaces
}

func ToWorkspaceMetadata(m gqlmodel.WorkspaceMetadata) workspace.Metadata {
	return workspace.NewMetadata().
		Description(string(m.Description)).
		Website(string(m.Website)).
		Location(string(m.Location)).
		BillingEmail(string(m.BillingEmail)).
		PhotoURL(string(m.PhotoURL)).
		MustBuild()
}

func FromPtrToPtr(s *graphql.String) *string {
	if s == nil {
		return nil
	}
	str := string(*s)
	return &str
}

func ToStringSlice(gqlSlice []graphql.String) []string {
	res := make([]string, len(gqlSlice))
	for i, v := range gqlSlice {
		res[i] = string(v)
	}
	return res
}
