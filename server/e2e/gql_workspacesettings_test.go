package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
)

func updateWorkspaceSettings(e *httpexpect.Expect, wID string, tiles *workspacesettings.ResourceList, terrains *workspacesettings.ResourceList) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateWorkspaceSettings($id: ID!, $tiles: ResourcesListInput!, $terrains: ResourcesListInput!) {
			updateWorkspaceSettings(input: {id: $id,tiles: $tiles,terrains: $terrains}) {
			  workspaceSettings{
				id
			  }
			} 
		  }`,
		Variables: map[string]any{
			"id":       wID,
			"tiles":    tiles,
			"terrains": terrains,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusUnprocessableEntity).
		JSON()

	return res
}

func TestUpdateWorkspaceSettings(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	rid := workspacesettings.NewResourceID()
	r := workspacesettings.NewResource(rid, "type", "foo", "bar", "baz", lo.ToPtr("xxx"), lo.ToPtr("xxx"))
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(false))

	rid2 := workspacesettings.NewResourceID()
	r2 := workspacesettings.NewResource(rid2, "type", "foo", "bar", "baz", lo.ToPtr("xxx"), lo.ToPtr("xxx"))
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{r2}, rid2.Ref(), lo.ToPtr(true))

	res := updateWorkspaceSettings(e, wId.String(), tiles, terrains)
	res.Object().
		Value("data").Object().
		Value("updateWorkspaceSettings").Object().
		Value("workspaceSettings").Object().
		HasValue("id", wId.String())
}
