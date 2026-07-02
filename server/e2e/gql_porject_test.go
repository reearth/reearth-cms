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

func updateProjectPosting(e *httpexpect.Expect, pID string, allowedOrigins []string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateProjectPosting($projectId: ID!, $allowedOrigins: [String!]!) {
    updateProject(input: {projectId: $projectId, accessibility: {posting: {allowedOrigins: $allowedOrigins}}}) {
        project {
            id
            accessibility {
                posting {
                    allowedOrigins
                }
            }
        }
    }
}`,
		Variables: map[string]any{
			"projectId":      pID,
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

func getProjectPosting(e *httpexpect.Expect, pID string) *httpexpect.Object {
	requestBody := GraphQLRequest{
		Query: `query GetProjectPosting($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
        ... on Project {
            id
            accessibility {
                posting {
                    allowedOrigins
                }
            }
        }
    }
}`,
		Variables: map[string]any{"projectId": pID},
	}
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Path("$.data.node.accessibility.posting").Object()
}

func TestProjectPostingAllowedOrigins_GQL(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "origins-gql-test", "origins-gql-test", "origins-gql-test")
	_, _ = createModel(e, pId, "origins-model", "origins-model", "origins-model")

	// new project: allowedOrigins should be an empty list
	posting := getProjectPosting(e, pId)
	posting.Value("allowedOrigins").Array().IsEmpty()

	// set two allowed origins
	updateProjectPosting(e, pId, []string{"https://allowed1.com", "https://allowed2.com"})
	posting = getProjectPosting(e, pId)
	posting.Value("allowedOrigins").Array().IsEqual([]any{"https://allowed1.com", "https://allowed2.com"})

	// update origins list to a single origin
	updateProjectPosting(e, pId, []string{"https://only.com"})
	posting = getProjectPosting(e, pId)
	posting.Value("allowedOrigins").Array().IsEqual([]any{"https://only.com"})

	// clear origins back to empty (deny-all)
	updateProjectPosting(e, pId, []string{})
	posting = getProjectPosting(e, pId)
	posting.Value("allowedOrigins").Array().IsEmpty()
}

func TestProjectPostingAllowedOrigins_PostEndpoint(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pAlias := "origins-post-test"
	mKey := "origins-model-post"
	pId, _ := createProject(e, wId.String(), pAlias, pAlias, pAlias)
	mPostId, _ := createModel(e, pId, mKey, mKey, mKey)
	updateModelPostingEnabled(e, mPostId, true)

	const url = "/api/p/{workspace}/{project}/{model}/items"

	tests := []struct {
		name           string
		allowedOrigins []string
		method         string
		origin         string
		wantStatus     int
		wantErrorCode  string
		checkResp      func(t *testing.T, resp *httpexpect.Response)
	}{
		{
			name:           "rejected when allowedOrigins is empty",
			allowedOrigins: []string{},
			method:         http.MethodPost,
			origin:         "https://example.com",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "posting_disabled",
		},
		{
			name:           "accepted when Origin header is absent (non-browser client)",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodPost,
			origin:         "",
			wantStatus:     http.StatusAccepted,
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Empty(t, resp.Header("Access-Control-Allow-Origin").Raw())
			},
		},
		{
			name:           "rejected when Origin not in list",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodPost,
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "accepted and CORS header set when Origin is in list",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodPost,
			origin:         "https://allowed.com",
			wantStatus:     http.StatusAccepted,
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Equal(t, "https://allowed.com", resp.Header("Access-Control-Allow-Origin").Raw())
				resp.JSON().Object().ContainsKey("id").ContainsKey("$createdAt")
			},
		},
		{
			name:           "OPTIONS preflight approved for allowed origin",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodOptions,
			origin:         "https://allowed.com",
			wantStatus:     http.StatusNoContent,
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Equal(t, "https://allowed.com", resp.Header("Access-Control-Allow-Origin").Raw())
				assert.Equal(t, "POST", resp.Header("Access-Control-Allow-Methods").Raw())
				assert.Equal(t, "Content-Type", resp.Header("Access-Control-Allow-Headers").Raw())
				assert.Empty(t, resp.Header("Access-Control-Max-Age").Raw())
			},
		},
		{
			name:           "OPTIONS preflight rejected for disallowed origin",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodOptions,
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Empty(t, resp.Header("Access-Control-Allow-Origin").Raw())
			},
		},
		{
			name:           "OPTIONS preflight rejected when allowedOrigins is empty",
			allowedOrigins: []string{},
			method:         http.MethodOptions,
			origin:         "https://allowed.com",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "posting_disabled",
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Empty(t, resp.Header("Access-Control-Allow-Origin").Raw())
			},
		},
		{
			name:           "OPTIONS without Origin header passes through",
			allowedOrigins: []string{"https://allowed.com"},
			method:         http.MethodOptions,
			origin:         "",
			wantStatus:     http.StatusNoContent,
			checkResp: func(t *testing.T, resp *httpexpect.Response) {
				assert.Empty(t, resp.Header("Access-Control-Allow-Origin").Raw())
				assert.Empty(t, resp.Header("Access-Control-Allow-Methods").Raw())
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updateProjectPosting(e, pId, tt.allowedOrigins)

			req := e.Request(tt.method, url, "test-workspace", pAlias, mKey)
			if tt.origin != "" {
				req = req.WithHeader("Origin", tt.origin)
			}
			if tt.method == http.MethodOptions {
				req = req.WithHeader("Access-Control-Request-Method", "POST")
			}
			resp := req.Expect().Status(tt.wantStatus)

			if tt.wantErrorCode != "" {
				resp.JSON().Object().HasValue("error", tt.wantErrorCode)
			}
			if tt.checkResp != nil {
				tt.checkResp(t, resp)
			}
		})
	}
}
