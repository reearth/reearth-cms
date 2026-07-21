package publicapi

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
)

type OpenAPISpec struct {
	OpenAPI    string                 `json:"openapi"`
	Info       OpenAPIInfo            `json:"info"`
	Servers    []OpenAPIServer        `json:"servers"`
	Paths      map[string]interface{} `json:"paths"`
	Components OpenAPIComponents      `json:"components"`
}

type OpenAPIInfo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

type OpenAPIServer struct {
	URL         string `json:"url"`
	Description string `json:"description"`
}

type OpenAPIComponents struct {
	Schemas         map[string]interface{} `json:"schemas"`
	SecuritySchemes map[string]interface{} `json:"securitySchemes"`
}

// GetOpenAPISchema generates the OpenAPI schema for the public API of the given workspace and project.
func (c *Controller) GetOpenAPISchema(ctx context.Context, wsAlias, pAlias string) (*OpenAPISpec, error) {
	wpm, err := c.loadWPMContext(ctx, wsAlias, pAlias, "")
	if err != nil {
		return nil, err
	}

	spec := &OpenAPISpec{
		OpenAPI: "3.0.3",
		Info: OpenAPIInfo{
			Title:       fmt.Sprintf("%s - Public API", wpm.Project.Name()),
			Description: fmt.Sprintf("Public API for accessing data from the %s project", wpm.Project.Name()),
			// Version:     "1.0.0",
		},
		Servers: []OpenAPIServer{
			{
				URL:         fmt.Sprintf("/api/p/%s/%s", wsAlias, pAlias),
				Description: "Public API endpoint",
			},
		},
		Paths: make(map[string]interface{}),
		Components: OpenAPIComponents{
			Schemas:         make(map[string]interface{}),
			SecuritySchemes: make(map[string]interface{}),
		},
	}

	// Endpoints of a private project require an API key; public projects are open
	a11y := wpm.Project.Accessibility()
	isPrivate := a11y != nil && a11y.Visibility() == project.VisibilityPrivate
	keyId := adapter.APIKeyId(ctx)

	if isPrivate {
		spec.Components.SecuritySchemes["apiKey"] = map[string]interface{}{
			"type":   "http",
			"scheme": "bearer",
		}
	}

	// Get all models
	models, _, err := c.usecases.Model.FindByProject(ctx, wpm.Project.ID(), usecasex.OffsetPagination{Limit: 1000}.Wrap(), nil)
	if err != nil {
		return nil, err
	}

	// Generate paths for each model accessible to the caller
	for _, m := range models {
		if !a11y.IsModelPublic(m.ID(), keyId) {
			continue
		}

		modelKey := m.Key().String()

		// Add path for getting all items
		spec.Paths[fmt.Sprintf("/%s", modelKey)] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     fmt.Sprintf("Get all %s items", m.Name()),
				"description": fmt.Sprintf("Retrieve all items from the %s model", m.Name()),
				"parameters": []map[string]interface{}{
					{
						"name":        "page",
						"in":          "query",
						"description": "Page number for pagination",
						"schema": map[string]interface{}{
							"type": "integer",
						},
					},
					{
						"name":        "limit",
						"in":          "query",
						"description": "Number of items per page",
						"schema": map[string]interface{}{
							"type":    "integer",
							"default": 50,
							"maximum": 100,
						},
					},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Successful response",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]interface{}{
						"description": "Model not found",
					},
				},
			},
		}

		// Add path for getting a single item
		spec.Paths[fmt.Sprintf("/%s/{itemId}", modelKey)] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     fmt.Sprintf("Get a %s item by ID", m.Name()),
				"description": fmt.Sprintf("Retrieve a single item from the %s model by its ID", m.Name()),
				"parameters": []map[string]interface{}{
					{
						"name":        "itemId",
						"in":          "path",
						"required":    true,
						"description": "Item ID",
						"schema": map[string]interface{}{
							"type": "string",
						},
					},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Successful response",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]interface{}{
						"description": "Item not found",
					},
				},
			},
		}

		// Add path for getting schema
		spec.Paths[fmt.Sprintf("/%s.schema.json", modelKey)] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     fmt.Sprintf("Get %s schema", m.Name()),
				"description": fmt.Sprintf("Retrieve the JSON schema for the %s model", m.Name()),
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Successful response",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
								},
							},
						},
					},
				},
			},
		}
	}

	// Add assets endpoints if assets are public
	if wpm.PublicAssets {
		spec.Paths["/assets"] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     "Get all assets",
				"description": "Retrieve all public assets",
				"parameters": []map[string]interface{}{
					{
						"name":        "page",
						"in":          "query",
						"description": "Page number for pagination",
						"schema": map[string]interface{}{
							"type": "integer",
						},
					},
					{
						"name":        "limit",
						"in":          "query",
						"description": "Number of items per page",
						"schema": map[string]interface{}{
							"type":    "integer",
							"default": 50,
							"maximum": 100,
						},
					},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Successful response",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
								},
							},
						},
					},
				},
			},
		}

		spec.Paths["/assets/{assetId}"] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     "Get an asset by ID",
				"description": "Retrieve a single asset by its ID",
				"parameters": []map[string]interface{}{
					{
						"name":        "assetId",
						"in":          "path",
						"required":    true,
						"description": "Asset ID",
						"schema": map[string]interface{}{
							"type": "string",
						},
					},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Successful response",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]interface{}{
						"description": "Asset not found",
					},
				},
			},
		}
	}

	// Private projects require an API key on every endpoint
	if isPrivate {
		security := []map[string][]string{{"apiKey": {}}}
		for _, pathItem := range spec.Paths {
			pi, ok := pathItem.(map[string]interface{})
			if !ok {
				continue
			}
			op, ok := pi["get"].(map[string]interface{})
			if !ok {
				continue
			}
			op["security"] = security
			if responses, ok := op["responses"].(map[string]interface{}); ok {
				responses["401"] = map[string]interface{}{
					"description": "API key is invalid",
				}
			}
		}
	}

	return spec, nil
}
