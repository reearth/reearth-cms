package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createProject(e *httpexpect.Expect, wID, name, desc, alias string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateProject($workspaceId: ID!, $name: String!, $description: String!, $alias: String!) {
				  createProject(input: {workspaceId: $workspaceId, name: $name, description: $description, alias: $alias}) {
					project {
					  id
					  name
					  description
					  alias
					  publication {
						scope
						assetPublic
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"workspaceId": wID,
			"name":        name,
			"description": desc,
			"alias":       alias,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.createProject.project.id").Raw().(string), res
}

func TestCreateProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	_, res := createProject(e, wId.String(), "test", "test", "test-1")

	res.Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		HasValue("name", "test")
}

func updateProject(e *httpexpect.Expect, pId string, name string, publication map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateProject(
    $projectId: ID!
    $name: String
    $description: String
    $alias: String
    $publication: UpdateProjectPublicationInput
    $requestRoles: [Role!]
  ) {
    updateProject(
      input: {
        projectId: $projectId
        name: $name
        description: $description
        alias: $alias
        publication: $publication
        requestRoles: $requestRoles
      }
    ) {
      project {
        id
        name
        description
        alias
        publication {
          scope
          assetPublic
        }
        requestRoles
      }
    }
  }
`,
		Variables:  map[string]any{
			"projectId": pId,
			"name":      name,
			"publication": publication,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.updateProject.project.id").Raw().(string), res
}

func TestUpdateProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, p := createProject(e, wId.String(), "test", "test", "test-1")
	p.Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		HasValue("name", "test")

		_, res := updateProject(e, pId, "test1", map[string]any{
			"scope":       "LIMITED",
			"assetPublic": true,
		})
		pp := res.Object().
		Value("data").Object().
		Value("updateProject").Object().
		Value("project").Object()

		pp.HasValue("name", "test1")
		pp.Value("publication").Object().HasValue("scope", "LIMITED")
		pp.Value("publication").Object().HasValue("assetPublic", true)
}

func regeneratePublicApiToken(e *httpexpect.Expect, pId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation RegeneratePublicApiToken($projectId: ID!) {
							regeneratePublicApiToken(input: { projectId: $projectId }) {
								project {
									id
									publication {
										scope
										assetPublic
										token
									}
								}
							}
						}`,
		Variables: map[string]any{
			"projectId": pId,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func TestRegeneratePublicApiToken(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, p := createProject(e, wId.String(), "test", "test", "test-1")
	p.Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		HasValue("name", "test")

	updateProject(e, pId, "test1", map[string]any{
		"scope":       "LIMITED",
		"assetPublic": true,
	})

	res1 := regeneratePublicApiToken(e, pId)
	token := res1.Path("$.data.regeneratePublicApiToken.project.publication.token")
	res2 := regeneratePublicApiToken(e, pId)
	newToken := res2.Path("$.data.regeneratePublicApiToken.project.publication.token")
	token.NotEqual(newToken)
}
