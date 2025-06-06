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
            accessibility {
                visibility
                publication {
                    publicAssets
                    publicModels
                }
                apiKeys {
                    id
                    name
                    description
                    key
                    publication {
                        publicAssets
                        publicModels
                    }
                }
            }
        }
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

func updateProject(e *httpexpect.Expect, pID, name, desc, alias, visibility string, publicAssets bool, publicModels []string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateProject($projectId: ID!, $name: String!, $description: String!, $alias: String!, $visibility: ProjectVisibility!,  $publicAssets: Boolean!, $publicModels: [ID!]!) {
    updateProject(input: {projectId: $projectId, name: $name, description: $description, alias: $alias, accessibility: {visibility: $visibility, publication: {publicAssets: $publicAssets , publicModels: $publicModels}}}) {
        project {
            id
            name
            description
            alias
            accessibility {
                visibility
                publication {
                    publicAssets
                    publicModels
                }
                apiKeys {
                    id
                    name
                    description
                    key
                    publication {
                        publicAssets
                        publicModels
                    }
                }
            }
        }
    }
}`,
		Variables: map[string]any{
			"projectId":    pID,
			"name":         name,
			"description":  desc,
			"alias":        alias,
			"visibility":   visibility,
			"publicAssets": publicAssets,
			"publicModels": publicModels,
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

func RegeneratePublicApiToken(e *httpexpect.Expect, pId, tId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation RegeneratePublicApiToken($projectId: ID!, $id: ID!) {
    regenerateAPIKey(input: { projectId: $projectId, id: $id }) {
        accessToken {
            id
            name
            description
            key
            publication {
                publicAssets
                publicModels
            }
        }
        public {
            publicAssets
            publicAssets
        }
    }
}`,
		Variables: map[string]any{
			"projectId": pId,
			"id":        tId,
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

func TestProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// create project
	pId, p := createProject(e, wId.String(), "test1", "test1", "test1")
	pp := p.Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object()
	pp.HasValue("name", "test1")
	pp.HasValue("description", "test1")
	pp.HasValue("alias", "test1")
	pp.Value("accessibility").Object().HasValue("visibility", "PUBLIC")
	pp.Value("accessibility").Object().Value("publication").IsNull()
	pp.Value("accessibility").Object().Value("apiKeys").IsNull()

	mId, _ := createModel(e, pId, "testModel", "testModel", "testModel")

	// update project
	_, res := updateProject(e, pId, "test2", "test2", "test2", "PRIVATE", true, []string{mId})
	pp = res.Object().
		Value("data").Object().
		Value("updateProject").Object().
		Value("project").Object()
	pp.HasValue("name", "test2")
	pp.HasValue("description", "test2")
	pp.HasValue("alias", "test2")
	pp.Value("accessibility").Object().HasValue("visibility", "PRIVATE")
	pp.Value("accessibility").Object().Value("publication").Object().HasValue("publicAssets", true)
	pp.Value("accessibility").Object().Value("publication").Object().HasValue("publicModels", []any{mId})
}

// TODO: teest for api keys CRUD
