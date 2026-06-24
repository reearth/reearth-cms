package publicapi

import (
	"context"
	"fmt"

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

// GetOpenAPISchema [WIP] generates the OpenAPI schema for the public API of the given workspace and project.
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

	// if project is private, return empty spec
	a11y := wpm.Project.Accessibility()
	if a11y != nil && a11y.Visibility() == project.VisibilityPrivate {
		return spec, nil
	}

	// if no public models and no public assets, return empty spec
	publication := a11y.Publication()
	if publication != nil && (len(publication.PublicModels()) == 0 && !publication.PublicAssets()) {
		return spec, nil
	}

	// Get all models
	models, _, err := c.usecases.Model.FindByProject(ctx, wpm.Project.ID(), usecasex.OffsetPagination{Limit: 1000}.Wrap(), nil)
	if err != nil {
		return nil, err
	}

	// Add security schemes for API keys
	spec.Components.SecuritySchemes["apiKey"] = map[string]interface{}{
		"type": "apiKey",
		"in":   "header",
		"name": "Authorization",
	}

	// Add the shared error schema. code enumerates every machine-readable error
	// code the posting endpoint can return (see PostingErrorCodes in error.go).
	spec.Components.Schemas["Error"] = map[string]interface{}{
		"type":     "object",
		"required": []string{"error", "code", "message"},
		"properties": map[string]interface{}{
			"error": map[string]interface{}{
				"type":        "string",
				"description": "Machine-readable error code (mirrors code).",
			},
			"code": map[string]interface{}{
				"type":        "string",
				"description": "Machine-readable error code.",
				"enum":        PostingErrorCodes,
			},
			"message": map[string]interface{}{
				"type":        "string",
				"description": "Human-readable description of the error.",
			},
			"details": map[string]interface{}{
				"type":        "array",
				"description": "Field-level validation errors, present only for validation_error.",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"field":   map[string]interface{}{"type": "string"},
						"code":    map[string]interface{}{"type": "string"},
						"message": map[string]interface{}{"type": "string"},
					},
				},
			},
		},
	}

	// errorContent references the shared Error schema for error responses.
	errorContent := map[string]interface{}{
		"application/json": map[string]interface{}{
			"schema": map[string]interface{}{
				"$ref": "#/components/schemas/Error",
			},
		},
	}

	postingEnabled := wpm.Project.Accessibility().PostingEnabled()

	// PostItemResponse schema — returned by POST /:model/items
	spec.Components.Schemas["PostItemResponse"] = map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"id": map[string]interface{}{
				"type":        "string",
				"description": "Unique ID of the created item",
			},
			"$createdAt": map[string]interface{}{
				"type":        "string",
				"format":      "date-time",
				"description": "Timestamp when the item was created",
			},
			"fields": map[string]interface{}{
				"type":        "object",
				"description": "Field values keyed by field key",
			},
		},
		"required": []string{"id", "$createdAt", "fields"},
	}

	// Generate paths for each public model
	for _, m := range models {
		if !wpm.Project.Accessibility().IsModelPublic(m.ID(), nil) {
			continue
		}

		modelKey := m.Key().String()

		// Add path for getting all items (and optionally posting)
		itemsPath := map[string]interface{}{
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
				"security": []map[string][]string{
					{
						"apiKey": {},
					},
				},
			},
		}
		if postingEnabled && m.PostingEnabled() {
			itemsPath["post"] = map[string]interface{}{
				"summary":     fmt.Sprintf("Create a new %s item", m.Name()),
				"description": fmt.Sprintf("Submit a new item to the %s model. The created item is unpublished and will not appear in the public read API until it is published.", m.Name()),
				"requestBody": map[string]interface{}{
					"required": true,
					"content": map[string]interface{}{
						"application/json": map[string]interface{}{
							"schema": map[string]interface{}{
								"type": "object",
								"properties": map[string]interface{}{
									"fields": map[string]interface{}{
										"type":        "object",
										"description": "Field values keyed by field key",
									},
								},
							},
						},
					},
				},
				"responses": map[string]interface{}{
					"202": map[string]interface{}{
						"description": "Item accepted and created as unpublished",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"$ref": "#/components/schemas/PostItemResponse",
								},
							},
						},
					},
					"400": map[string]interface{}{
						"description": "Validation error",
						"content":     errorContent,
					},
					"403": map[string]interface{}{
						"description": "Posting disabled or origin not allowed",
						"content":     errorContent,
					},
					"404": map[string]interface{}{
						"description": "Not found",
						"content":     errorContent,
					},
					"429": map[string]interface{}{
						"description": "Too many requests; retry after the period indicated by the Retry-After header",
						"headers": map[string]interface{}{
							"Retry-After": map[string]interface{}{
								"description": "Number of seconds to wait before retrying",
								"schema":      map[string]interface{}{"type": "integer"},
							},
						},
						"content": errorContent,
					},
				},
			}
		}
		spec.Paths[fmt.Sprintf("/%s/items", modelKey)] = itemsPath

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

	return spec, nil
}
