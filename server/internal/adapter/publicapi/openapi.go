package publicapi

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
)

type OpenAPISpec struct {
	OpenAPI    string            `json:"openapi"`
	Info       OpenAPIInfo       `json:"info"`
	Servers    []OpenAPIServer   `json:"servers"`
	Paths      map[string]any    `json:"paths"`
	Components OpenAPIComponents `json:"components"`
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
	Schemas         map[string]any `json:"schemas"`
	SecuritySchemes map[string]any `json:"securitySchemes"`
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
		Paths: make(map[string]any),
		Components: OpenAPIComponents{
			Schemas:         make(map[string]any),
			SecuritySchemes: make(map[string]any),
		},
	}

	// Endpoints of a private project require an API key; public projects are open
	a11y := wpm.Project.Accessibility()
	isPrivate := a11y != nil && a11y.Visibility() == project.VisibilityPrivate
	keyId := adapter.APIKeyId(ctx)

	if isPrivate {
		spec.Components.SecuritySchemes["apiKey"] = map[string]any{
			"type":   "http",
			"scheme": "bearer",
		}
	}

	// Get all models
	models, _, err := c.usecases.Model.FindByProject(ctx, wpm.Project.ID(), usecasex.OffsetPagination{Limit: 1000}.Wrap(), nil)
	if err != nil {
		return nil, err
	}

	// Add security schemes for API keys
	spec.Components.SecuritySchemes["apiKey"] = map[string]any{
		"type": "apiKey",
		"in":   "header",
		"name": "Authorization",
	}

	// Add the shared error schema. code enumerates every machine-readable error
	// code the posting endpoint can return (see PostingErrorCodes in error.go).
	spec.Components.Schemas["Error"] = map[string]any{
		"type":     "object",
		"required": []string{"error", "code", "message"},
		"properties": map[string]any{
			"error": map[string]any{
				"type":        "string",
				"description": "Machine-readable error code (mirrors code).",
			},
			"code": map[string]any{
				"type":        "string",
				"description": "Machine-readable error code.",
				"enum":        PostingErrorCodes,
			},
			"message": map[string]any{
				"type":        "string",
				"description": "Human-readable description of the error.",
			},
			"details": map[string]any{
				"type":        "array",
				"description": "Field-level validation errors, present only for validation_error.",
				"items": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"field":   map[string]any{"type": "string"},
						"code":    map[string]any{"type": "string"},
						"message": map[string]any{"type": "string"},
					},
				},
			},
		},
	}

	// errorContent references the shared Error schema for error responses.
	errorContent := map[string]any{
		"application/json": map[string]any{
			"schema": map[string]any{
				"$ref": "#/components/schemas/Error",
			},
		},
	}

	postingEnabled := wpm.Project.Accessibility().PostingEnabled()

	// PostItemResponse schema — returned by POST /:model/items
	spec.Components.Schemas["PostItemResponse"] = map[string]any{
		"type": "object",
		"properties": map[string]any{
			"id": map[string]any{
				"type":        "string",
				"description": "Unique ID of the created item",
			},
			"$createdAt": map[string]any{
				"type":        "string",
				"format":      "date-time",
				"description": "Timestamp when the item was created",
			},
			"fields": map[string]any{
				"type":        "object",
				"description": "Field values keyed by field key",
			},
		},
		"required": []string{"id", "$createdAt", "fields"},
	}

	// Generate paths for each model accessible to the caller
	for _, m := range models {
		if !a11y.IsModelPublic(m.ID(), keyId) {
			continue
		}

		modelKey := m.Key().String()

		// Add path for getting all items (and optionally posting)
		itemsPath := map[string]any{
			"get": map[string]any{
				"summary":     fmt.Sprintf("Get all %s items", m.Name()),
				"description": fmt.Sprintf("Retrieve all items from the %s model", m.Name()),
				"parameters": []map[string]any{
					{
						"name":        "page",
						"in":          "query",
						"description": "Page number for pagination",
						"schema": map[string]any{
							"type": "integer",
						},
					},
					{
						"name":        "limit",
						"in":          "query",
						"description": "Number of items per page",
						"schema": map[string]any{
							"type":    "integer",
							"default": 50,
							"maximum": 100,
						},
					},
				},
				"responses": map[string]any{
					"200": map[string]any{
						"description": "Successful response",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]any{
						"description": "Model not found",
					},
				},
				"security": []map[string][]string{
					{
						"apiKey": {},
					},
				},
			},
		}
		if postingEnabled && m.PostingEnabled() {
			itemsPath["post"] = map[string]any{
				"summary":     fmt.Sprintf("Create a new %s item", m.Name()),
				"description": fmt.Sprintf("Submit a new item to the %s model. The created item is unpublished and will not appear in the public read API until it is published.", m.Name()),
				"requestBody": map[string]any{
					"required": true,
					"content": map[string]any{
						"application/json": map[string]any{
							"schema": map[string]any{
								"type": "object",
								"properties": map[string]any{
									"fields": map[string]any{
										"type":        "object",
										"description": "Field values keyed by field key",
									},
								},
							},
						},
					},
				},
				"responses": map[string]any{
					"202": map[string]any{
						"description": "Item accepted and created as unpublished",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
									"$ref": "#/components/schemas/PostItemResponse",
								},
							},
						},
					},
					"400": map[string]any{
						"description": "Validation error",
						"content":     errorContent,
					},
					"403": map[string]any{
						"description": "Posting disabled or origin not allowed",
						"content":     errorContent,
					},
					"404": map[string]any{
						"description": "Not found",
						"content":     errorContent,
					},
					"413": map[string]any{
						"description": "Request body exceeds the allowed size limit",
						"content":     errorContent,
					},
					"429": map[string]any{
						"description": "Too many requests; retry after the period indicated by the Retry-After header",
						"headers": map[string]any{
							"Retry-After": map[string]any{
								"description": "Number of seconds to wait before retrying",
								"schema":      map[string]any{"type": "integer"},
							},
						},
						"content": errorContent,
					},
				},
			}
		}
		spec.Paths[fmt.Sprintf("/%s/items", modelKey)] = itemsPath

		// Add path for getting a single item
		spec.Paths[fmt.Sprintf("/%s/{itemId}", modelKey)] = map[string]any{
			"get": map[string]any{
				"summary":     fmt.Sprintf("Get a %s item by ID", m.Name()),
				"description": fmt.Sprintf("Retrieve a single item from the %s model by its ID", m.Name()),
				"parameters": []map[string]any{
					{
						"name":        "itemId",
						"in":          "path",
						"required":    true,
						"description": "Item ID",
						"schema": map[string]any{
							"type": "string",
						},
					},
				},
				"responses": map[string]any{
					"200": map[string]any{
						"description": "Successful response",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]any{
						"description": "Item not found",
					},
				},
			},
		}

		// Add path for getting schema
		spec.Paths[fmt.Sprintf("/%s.schema.json", modelKey)] = map[string]any{
			"get": map[string]any{
				"summary":     fmt.Sprintf("Get %s schema", m.Name()),
				"description": fmt.Sprintf("Retrieve the JSON schema for the %s model", m.Name()),
				"responses": map[string]any{
					"200": map[string]any{
						"description": "Successful response",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
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
		spec.Paths["/assets"] = map[string]any{
			"get": map[string]any{
				"summary":     "Get all assets",
				"description": "Retrieve all public assets",
				"parameters": []map[string]any{
					{
						"name":        "page",
						"in":          "query",
						"description": "Page number for pagination",
						"schema": map[string]any{
							"type": "integer",
						},
					},
					{
						"name":        "limit",
						"in":          "query",
						"description": "Number of items per page",
						"schema": map[string]any{
							"type":    "integer",
							"default": 50,
							"maximum": 100,
						},
					},
				},
				"responses": map[string]any{
					"200": map[string]any{
						"description": "Successful response",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
									"type": "object",
								},
							},
						},
					},
				},
			},
		}

		spec.Paths["/assets/{assetId}"] = map[string]any{
			"get": map[string]any{
				"summary":     "Get an asset by ID",
				"description": "Retrieve a single asset by its ID",
				"parameters": []map[string]any{
					{
						"name":        "assetId",
						"in":          "path",
						"required":    true,
						"description": "Asset ID",
						"schema": map[string]any{
							"type": "string",
						},
					},
				},
				"responses": map[string]any{
					"200": map[string]any{
						"description": "Successful response",
						"content": map[string]any{
							"application/json": map[string]any{
								"schema": map[string]any{
									"type": "object",
								},
							},
						},
					},
					"404": map[string]any{
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
			pi, ok := pathItem.(map[string]any)
			if !ok {
				continue
			}
			op, ok := pi["get"].(map[string]any)
			if !ok {
				continue
			}
			op["security"] = security
			if responses, ok := op["responses"].(map[string]any); ok {
				responses["401"] = map[string]any{
					"description": "API key is invalid",
				}
			}
		}
	}

	return spec, nil
}
