package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/stretchr/testify/assert"
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

func updateProjectPosting(e *httpexpect.Expect, pID string, enabled bool) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateProjectPosting($projectId: ID!, $enabled: Boolean!, $allowedOrigins: [String!]!) {
    updateProject(input: {projectId: $projectId, accessibility: {posting: {enabled: $enabled, allowedOrigins: $allowedOrigins}}}) {
        project {
            id
            accessibility {
                posting {
                    enabled
                    allowedOrigins
                }
            }
        }
    }
}`,
		Variables: map[string]any{
			"projectId":      pID,
			"enabled":        enabled,
			"allowedOrigins": []string{},
		},
	}

	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
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

func getProject(e *httpexpect.Expect, pId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
        ... on Project {
            id
            accessibility {
                posting {
                    enabled
                }
            }
        }
    }
}`,
		Variables: map[string]any{"projectId": pId},
	}
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func TestProjectPostingSettings(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "posting-test", "posting-test", "posting-test")

	// new project: posting disabled by default
	getProject(e, pId).Path("$.data.node.accessibility.posting").Object().HasValue("enabled", false)

	// enable posting
	res := updateProjectPosting(e, pId, true)
	posting := res.Path("$.data.updateProject.project.accessibility.posting").Object()
	posting.HasValue("enabled", true)

	// disable posting
	res = updateProjectPosting(e, pId, false)
	posting = res.Path("$.data.updateProject.project.accessibility.posting").Object()
	posting.HasValue("enabled", false)
}

func updateProjectPostingWithOrigins(e *httpexpect.Expect, pID string, enabled bool, allowedOrigins []string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateProjectPostingWithOrigins($projectId: ID!, $enabled: Boolean!, $allowedOrigins: [String!]!) {
    updateProject(input: {projectId: $projectId, accessibility: {posting: {enabled: $enabled, allowedOrigins: $allowedOrigins}}}) {
        project {
            id
            accessibility {
                posting {
                    enabled
                    allowedOrigins
                }
            }
        }
    }
}`,
		Variables: map[string]any{
			"projectId":      pID,
			"enabled":        enabled,
			"allowedOrigins": allowedOrigins,
		},
	}

	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func TestProjectPostingAllowedOrigins_GQL(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "origins-gql-test", "origins-gql-test", "origins-gql-test")
	_, _ = createModel(e, pId, "origins-model", "origins-model", "origins-model")

	// new project: allowedOrigins should be an empty list
	requestBody := GraphQLRequest{
		Query: `query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
        ... on Project {
            id
            accessibility {
                posting {
                    enabled
                    allowedOrigins
                }
            }
        }
    }
}`,
		Variables: map[string]any{"projectId": pId},
	}
	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
	posting := res.Path("$.data.node.accessibility.posting").Object()
	posting.HasValue("enabled", false)
	posting.Value("allowedOrigins").Array().IsEmpty()

	// enable posting with two allowed origins
	res = updateProjectPostingWithOrigins(e, pId, true, []string{"https://allowed1.com", "https://allowed2.com"})
	posting = res.Path("$.data.updateProject.project.accessibility.posting").Object()
	posting.HasValue("enabled", true)
	posting.Value("allowedOrigins").Array().IsEqual([]any{"https://allowed1.com", "https://allowed2.com"})

	// update origins list to a single origin
	res = updateProjectPostingWithOrigins(e, pId, true, []string{"https://only.com"})
	posting = res.Path("$.data.updateProject.project.accessibility.posting").Object()
	posting.HasValue("enabled", true)
	posting.Value("allowedOrigins").Array().IsEqual([]any{"https://only.com"})

	// clear origins back to empty (deny-all)
	res = updateProjectPostingWithOrigins(e, pId, true, []string{})
	posting = res.Path("$.data.updateProject.project.accessibility.posting").Object()
	posting.HasValue("enabled", true)
	posting.Value("allowedOrigins").Array().IsEmpty()
}

func TestProjectPostingAllowedOrigins_PostEndpoint(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pAlias := "origins-post-test"
	mKey := "origins-model-post"
	pId, _ := createProject(e, wId.String(), pAlias, pAlias, pAlias)
	_, _ = createModel(e, pId, mKey, mKey, mKey)

	// enable posting but with empty origins — all requests must be rejected
	updateProjectPostingWithOrigins(e, pId, true, []string{})

	t.Run("rejected when allowedOrigins is empty", func(t *testing.T) {
		res := e.POST("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://example.com").
			Expect().
			Status(http.StatusForbidden).
			JSON()
		res.Object().HasValue("error", "origin_not_allowed")
		res.Object().HasValue("message", "No origins are configured for posting on this project.")
	})

	// set allowed origins
	updateProjectPostingWithOrigins(e, pId, true, []string{"https://allowed.com"})

	t.Run("rejected when Origin header is absent", func(t *testing.T) {
		res := e.POST("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			Expect().
			Status(http.StatusForbidden).
			JSON()
		res.Object().HasValue("error", "origin_not_allowed")
		res.Object().HasValue("message", "Origin is not allowed for posting on this project.")
	})

	t.Run("rejected when Origin not in list", func(t *testing.T) {
		res := e.POST("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://evil.com").
			Expect().
			Status(http.StatusForbidden).
			JSON()
		res.Object().HasValue("error", "origin_not_allowed")
		res.Object().HasValue("message", "Origin is not allowed for posting on this project.")
	})

	t.Run("rejected when posting disabled", func(t *testing.T) {
		updateProjectPostingWithOrigins(e, pId, false, []string{"https://allowed.com"})
		defer updateProjectPostingWithOrigins(e, pId, true, []string{"https://allowed.com"})

		res := e.POST("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://allowed.com").
			Expect().
			Status(http.StatusForbidden).
			JSON()
		res.Object().HasValue("error", "posting_disabled")
	})

	t.Run("accepted and CORS header set when Origin is in list", func(t *testing.T) {
		resp := e.POST("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://allowed.com").
			Expect().
			Status(http.StatusOK)
		assert.Equal(t, "https://allowed.com", resp.Header("Access-Control-Allow-Origin").Raw())
		resp.JSON().Object().HasValue("status", "accepted")
	})

	t.Run("OPTIONS preflight approved for allowed origin", func(t *testing.T) {
		resp := e.OPTIONS("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://allowed.com").
			WithHeader("Access-Control-Request-Method", "POST").
			Expect().
			Status(http.StatusNoContent)
		assert.Equal(t, "https://allowed.com", resp.Header("Access-Control-Allow-Origin").Raw())
		assert.Equal(t, "POST", resp.Header("Access-Control-Allow-Methods").Raw())
		assert.Equal(t, "Content-Type", resp.Header("Access-Control-Allow-Headers").Raw())
		assert.Empty(t, resp.Header("Access-Control-Max-Age").Raw())
	})

	t.Run("OPTIONS preflight rejected for disallowed origin", func(t *testing.T) {
		resp := e.OPTIONS("/api/p/{workspace}/{project}/{model}/items", "test-workspace", pAlias, mKey).
			WithHeader("Origin", "https://evil.com").
			WithHeader("Access-Control-Request-Method", "POST").
			Expect().
			Status(http.StatusForbidden)
		assert.Empty(t, resp.Header("Access-Control-Allow-Origin").Raw())
	})
}
