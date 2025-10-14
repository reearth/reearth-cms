package e2e

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

var (
	pApiW1Id      = id.NewWorkspaceID()
	pApiW1Alias   = "test-workspace"
	pApiP1Id      = id.NewProjectID()
	pApiP1Alias   = "test-project"
	pApiP1A1Id    = id.NewAssetID()
	pApiA1UUID    = uuid.NewString()
	pApiP1A2Id    = id.NewAssetID()
	pApiA2UUID    = uuid.NewString()
	pApiP1M1Id    = id.NewModelID()
	pApiP1S1Id    = id.NewSchemaID()
	pApiP1M1Key   = "test-model"
	pApiP1S1F1Key = "test-field-1"
	pApiP1S1F2Key = "asset"
	pApiP1S1F3Key = "test-field-2"
	pApiP1S1F4Key = "asset2"
	pApiP1S1F5Key = "geometry-object"
	pApiP1S1F6Key = "geometry-editor"
	pApiP1M1I1Id  = id.NewItemID()
	pApiP1M1I2Id  = id.NewItemID()
	pApiP1M1I3Id  = id.NewItemID()
	pApiP1M1I4Id  = id.NewItemID()
	pApiP1M1I5Id  = id.NewItemID()
	pApiP1M2Id    = id.NewModelID()
	pApiP1M2Key   = "test-model-2"
	pApiP1M3Id    = id.NewModelID()
	pApiP1M3Key   = "test-model-3"
	pApiP1M3I1Id  = id.NewItemID()
	pApiP2Id      = id.NewProjectID()
	pApiP2M1Id    = id.NewModelID()
	pApiP2M1Key   = "test-model-4"
	pApiP2M2Key   = "key-p2-m2"
	pApiP1M2I1Id  = id.NewItemID()
	pApiP1S2F1Key = "test-field-1"
	pApiP1S2F2Key = "test-field-2"
	pApiP2Alias   = "test-project-2"
	pApiP1M4Id    = id.NewModelID()
	pApiP1M4Key   = "test-model-5"
	pApiP1M4I1Id  = id.NewItemID()
	pApiP1S3F1Key = "group"
	pApiP1S3F2Key = "multiple-group"
	pApiP1S3F3Key = "geometry-object"
)

func TestPublicAPI_NotFound(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	t.Run("invalid alias", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, "invalid-alias", pApiP1M1Key).
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("private model", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP2Alias, pApiP2M1Key).
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("private assets", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP2Alias, "assets").
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("invalid key", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, "invalid-key").
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("item not found", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, id.NewItemID()).
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{"error": "not found"})
	})
}

func TestPublicAPI_CORS(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL:   "https://example.com",
		Public_Origins: []string{"https://example.com"},
	}, true, publicAPISeeder)

	res := e.OPTIONS("/api/p/{workspace}/{project}/{model}/{item}/", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
		WithHeader("Origin", "https://example.com").
		WithHeader("Access-Control-Request-Method", "POST").
		Expect().
		Status(http.StatusNoContent)
	res.Header("Access-Control-Allow-Origin").IsEqual("https://example.com")
	res.Header("Access-Control-Allow-Methods").Contains("POST")

	e, _, _ = StartServerWithRepos(t, &app.Config{
		AssetBaseURL:   "https://example.com",
		Public_Origins: []string{"*"},
	}, true, publicAPISeeder)

	res = e.OPTIONS("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
		WithHeader("Origin", "https://example.com").
		WithHeader("Access-Control-Request-Method", "POST").
		Expect().
		Status(http.StatusNoContent)
	res.Header("Access-Control-Allow-Origin").IsEqual("*")
	res.Header("Access-Control-Allow-Methods").Contains("POST")
}

func TestPublicAPI_Item(t *testing.T) {
	e, r, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"id":          pApiP1M1I1Id.String(),
			pApiP1S1F1Key: "aaa",
			pApiP1S1F2Key: map[string]any{
				"type": "asset",
				"id":   pApiP1A1Id.String(),
				"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
			},
		})

	// test reference field
	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M2Key, pApiP1M2I1Id).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"id":          pApiP1M2I1Id.String(),
			pApiP1S2F1Key: "bbb",
			pApiP1S2F2Key: map[string]any{
				"id":          pApiP1M1I1Id.String(),
				pApiP1S1F1Key: "aaa",
				pApiP1S1F2Key: map[string]any{
					"type": "asset",
					"id":   pApiP1A1Id.String(),
					"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
				},
			},
		})

	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, "___", pApiP1M1I1Id).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I4Id).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	// make the project's assets private
	ctx := context.Background()
	prj := lo.Must(r.Project.FindByID(ctx, pApiP1Id))
	prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{pApiP1M1Id}, false), nil))
	lo.Must0(r.Project.Save(ctx, prj))
	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"id":          pApiP1M1I1Id.String(),
			pApiP1S1F1Key: "aaa",
			// pApiP1S1F2Key should be removed
		})

	prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{}, false), nil))
	lo.Must0(r.Project.Save(ctx, prj))

	e.GET("/api/p/{workspace}/{project}/{model}/{item}", pApiW1Alias, pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})
}

func TestPublicAPI_Assets(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	t.Run("export assets with pagination", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/assets", pApiW1Alias, pApiP1Alias).
			WithQuery("page", "1").
			WithQuery("limit", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"hasMore": true,
				"limit":   1,
				"offset":  0,
				"page":    1,
				"results": []map[string]any{
					{
						"id":          pApiP1A1Id.String(),
						"type":        "asset",
						"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						"contentType": "application/zip",
						"files": []string{
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
						},
					},
				},
				"totalCount": 2,
			})
	})

	t.Run("export assets without pagination", func(t *testing.T) {
		e.GET("/api/p/{project}/assets", pApiP1Alias).
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1A1Id.String(),
						"type":        "asset",
						"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						"contentType": "application/zip",
						"files": []string{
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
						},
					},
					{
						"id":          pApiP1A2Id.String(),
						"type":        "asset",
						"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						"contentType": "application/zip",
						"files": []string{
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", pApiA2UUID[:2], pApiA2UUID[2:]),
							fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
				},
				"totalCount": 2,
			})
	})

	t.Run("get a single asset", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/assets/{assetid}", pApiW1Alias, pApiP1Alias, pApiP1A1Id).
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"type":        "asset",
				"id":          pApiP1A1Id.String(),
				"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
				"contentType": "application/zip",
				"files": []string{
					fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
					fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", pApiA1UUID[:2], pApiA1UUID[2:]),
				},
			})
	})
}

func TestPublicAPI_Model(t *testing.T) {
	e, r, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)
	ctx := context.Background()
	prj := lo.Must(r.Project.FindByID(ctx, pApiP1Id))
	apiKey := project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key1").Description("desc1").
		Publication(project.NewPublicationSettings(id.ModelIDList{pApiP1M1Id}, true)).Build()

	t.Run("export as json (default format)", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithQuery("page", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I1Id.String(),
						pApiP1S1F1Key: "aaa",
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A1Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						},
					},
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
					{
						"id":          pApiP1M1I3Id.String(),
						pApiP1S1F1Key: "ccc",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
					// pApiP1M1I4Id is not included in the response because it does not have the public reference
					//{
					//	"id":          pApiP1M1I4Id.String(),
					//	pApiP1S1F1Key: "ddd",
					//},
					{
						"id":          pApiP1M1I5Id.String(),
						pApiP1S1F1Key: "eee",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
						pApiP1S1F5Key: map[string]any{
								"type":        "Point",
								"coordinates": []any{102.0, 0.5},
							},
						pApiP1S1F6Key: map[string]any{
								"type": "LineString",
								"coordinates": []any{
									[]any{139.65439725962517, 36.34793305387103},
									[]any{139.61688622815393, 35.910803456352724},
								},
							},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
					},
				},
				"totalCount": 4,
				"hasMore":    false,
				"limit":      50,
				"offset":     0,
				"page":       1,
			})
	})

	t.Run("export as json with reference fields", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M2Key).
			WithQuery("page", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M2I1Id.String(),
						pApiP1S2F1Key: "bbb",
						pApiP1S2F2Key: map[string]any{
							"id":          pApiP1M1I1Id.String(),
							pApiP1S1F1Key: "aaa",
						},
					},
				},
				"totalCount": 1,
				"hasMore":    false,
				"limit":      50,
				"offset":     0,
				"page":       1,
			})
	})

	t.Run("export as json with no pagination", func(t *testing.T) {
		e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I1Id.String(),
						pApiP1S1F1Key: "aaa",
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A1Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						},
					},
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
					{
						"id":          pApiP1M1I3Id.String(),
						pApiP1S1F1Key: "ccc",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
					// pApiP1M1I4Id is not included in the response because it does not have the public reference
					//{
					//	"id":          pApiP1M1I4Id.String(),
					//	pApiP1S1F1Key: "ddd",
					//},
					{
						"id":          pApiP1M1I5Id.String(),
						pApiP1S1F1Key: "eee",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
						pApiP1S1F5Key: map[string]any{
							"type":        "Point",
							"coordinates": []any{102.0, 0.5},
						},
						pApiP1S1F6Key: map[string]any{
							"type": "LineString",
							"coordinates": []any{
								[]any{139.65439725962517, 36.34793305387103},
								[]any{139.61688622815393, 35.910803456352724},
							},
						},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
				},
				"totalCount": 4,
			})
	})

	t.Run("export as json with offset pagination", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithQuery("limit", "1").
			WithQuery("offset", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
				},
				"totalCount": 4,
				"hasMore":    true,
				"limit":      1,
				"offset":     1,
				"page":       2,
			})
	})

	t.Run("export as json with cursor pagination", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithQuery("start_cursor", pApiP1M1I1Id.String()).
			WithQuery("page_size", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
				},
				"totalCount": 4,
				"hasMore":    true,
				"nextCursor": pApiP1M1I2Id.String(),
			})
	})

	t.Run("export as json with private assets", func(t *testing.T) {
		prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{pApiP1M1Id}, false), nil))
		lo.Must0(r.Project.Save(ctx, prj))

		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithQuery("page", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I1Id.String(),
						pApiP1S1F1Key: "aaa",
						// pApiP1S1F2Key should be removed
					},
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
					{
						"id":          pApiP1M1I3Id.String(),
						pApiP1S1F1Key: "ccc",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						// pApiP1S1F4Key should be removed (not public asset)
					},
					// pApiP1M1I4Id is not included in the response because it does not have the public reference
					//{
					//	"id":          pApiP1M1I4Id.String(),
					//	pApiP1S1F1Key: "ddd",
					//},
					{
						"id":          pApiP1M1I5Id.String(),
						pApiP1S1F1Key: "eee",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						// pApiP1S1F4Key should be removed (not public asset)
						//pApiP1S1F4Key: []any{
						//	map[string]any{
						//		"type": "asset",
						//		"id":   pApiP1A1Id.String(),
						//		"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						//	},
						//},
						pApiP1S1F5Key: map[string]any{
								"type":        "Point",
								"coordinates": []any{102.0, 0.5},
							},
						pApiP1S1F6Key: map[string]any{
								"type": "LineString",
								"coordinates": []any{
									[]any{139.65439725962517, 36.34793305387103},
									[]any{139.61688622815393, 35.910803456352724},
								},
							},
					},
				},
				"totalCount": 4,
				"hasMore":    false,
				"limit":      50,
				"offset":     0,
				"page":       1,
			})
	})

	t.Run("export as json should fail for private project", func(t *testing.T) {
		prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{}, false), nil))
		lo.Must0(r.Project.Save(ctx, prj))

		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{
				"error": "not found",
			})
	})

	t.Run("export as json with valid/invalid token", func(t *testing.T) {
		prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), project.APIKeys{apiKey}))
		lo.Must0(r.Project.Save(ctx, prj))

		// invalid token
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithHeader("Origin", "https://example.com").
			WithHeader("Authorization", "secret_abc").
			WithHeader("Content-Type", "application/json").
			Expect().
			Status(http.StatusUnauthorized).
			JSON().
			IsEqual(map[string]any{
				"error": "invalid key",
			})

		// valid token
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			WithHeader("Origin", "https://example.com").
			WithHeader("Authorization", apiKey.Key()).
			WithHeader("Content-Type", "application/json").
			WithQuery("page", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"results": []map[string]any{
					{
						"id":          pApiP1M1I1Id.String(),
						pApiP1S1F1Key: "aaa",
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A1Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
						},
					},
					{
						"id":          pApiP1M1I2Id.String(),
						pApiP1S1F1Key: "bbb",
					},
					{
						"id":          pApiP1M1I3Id.String(),
						pApiP1S1F1Key: "ccc",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
					// pApiP1M1I4Id is not included in the response because it does not have the public reference
					//{
					//	"id":          pApiP1M1I4Id.String(),
					//	pApiP1S1F1Key: "ddd",
					//},
					{
						"id":          pApiP1M1I5Id.String(),
						pApiP1S1F1Key: "eee",
						pApiP1S1F3Key: []string{"aaa", "bbb", "ccc"},
						pApiP1S1F4Key: []any{
							map[string]any{
								"type": "asset",
								"id":   pApiP1A1Id.String(),
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
						pApiP1S1F5Key: map[string]any{
								"type":        "Point",
								"coordinates": []any{102.0, 0.5},
							},
						pApiP1S1F6Key: map[string]any{
								"type": "LineString",
								"coordinates": []any{
									[]any{139.65439725962517, 36.34793305387103},
									[]any{139.61688622815393, 35.910803456352724},
								},
							},
						pApiP1S1F2Key: map[string]any{
							"type": "asset",
							"id":   pApiP1A2Id.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
					},
				},
				"totalCount": 4,
				"hasMore":    false,
				"limit":      50,
				"offset":     0,
				"page":       1,
			})

		// different project in the same workspace with the same token
		e.GET("/api/p/{workspace}/{project}/{model}", pApiW1Alias, pApiP2Alias, pApiP1M2Key).
			WithHeader("Origin", "https://example.com").
			WithHeader("Authorization", apiKey.Key()).
			WithHeader("Content-Type", "application/json").
			Expect().
			Status(http.StatusNotFound).
			JSON().
			IsEqual(map[string]any{
				"error": "not found",
			})
	})
}

func TestPublicAPI_Model_GeoJson(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{workspace}/{project}/{model}.geojson", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
		Expect().
		Status(http.StatusOK).
		JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
		IsEqual(map[string]any{
			"type": "FeatureCollection",
			"features": []map[string]any{
				{
					"type": "Feature",
					"id":   pApiP1M1I5Id.String(),
					"geometry": map[string]any{
						"type": "Point",
						"coordinates": []any{
							102,
							0.5,
						},
					},
					"properties": map[string]any{
						"test-field-1": "eee",
						"test-field-2": []any{
							"aaa",
							"bbb",
							"ccc",
						},
						pApiP1S1F2Key: map[string]any{
							"id":   pApiP1A2Id,
							"type": "asset",
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA2UUID[:2], pApiA2UUID[2:]),
						},
						pApiP1S1F4Key: []map[string]any{
							{
								"id":   pApiP1A1Id,
								"type": "asset",
								"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", pApiA1UUID[:2], pApiA1UUID[2:]),
							},
						},
					},
				},
			},
		})

	// no geometry field
	e.GET("/api/p/{workspace}/{project}/{model}.geojson", pApiW1Alias, pApiP1Alias, pApiP1M2Key).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		IsEqual(map[string]any{
			"error": "no geometry field in this model",
		})
}

func TestPublicAPI_Model_CSV(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	t.Run("export as csv with default settings", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.csv", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			Expect().
			Status(http.StatusOK).
			HasContentType("text/csv").
			Body().
			IsEqual(fmt.Sprintf("id,%s\n", pApiP1S1F1Key) +
				fmt.Sprintf("%s,aaa\n", pApiP1M1I1Id.String()) +
				fmt.Sprintf("%s,bbb\n", pApiP1M1I2Id.String()) +
				fmt.Sprintf("%s,ccc\n", pApiP1M1I3Id.String()) +
				fmt.Sprintf("%s,eee\n", pApiP1M1I5Id.String()),
			)
	})

	t.Run("export as csv should not fail if the model does not have point geo field", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.csv", pApiW1Alias, pApiP1Alias, pApiP1M2Key).
			Expect().
			Status(http.StatusOK).
			HasContentType("text/csv").
			Body().
			IsEqual("id,test-field-1\n" +
				fmt.Sprintf("%s,bbb\n", pApiP1M2I1Id.String()))
	})
}

func TestPublicAPI_Model_Schema(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	// schema export json
	t.Run("not found", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}/schema.json", pApiW1Alias, pApiP1Alias, id.RandomKey()).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("ok", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.schema.json", pApiW1Alias, pApiP1Alias, pApiP1M1Key).
			Expect().
			Status(http.StatusOK).
			JSON().
			IsEqual(map[string]any{
				"$id": pApiP1S1Id,
				"properties": map[string]any{
					"asset": map[string]any{
						"title":  "asset",
						"type":   "string",
						"format": "binary",
					},
					"asset2": map[string]any{
						"title":  "asset2",
						"type":   "string",
						"format": "binary",
					},
					"geometry-editor": map[string]any{
						"title": "geometry-editor",
						"type":  "object",
					},
					"geometry-object": map[string]any{
						"title": "geometry-object",
						"type":  "object",
					},
					"test-field-1": map[string]any{
						"title": "test-field-1",
						"type":  "string",
					},
					"test-field-2": map[string]any{
						"title": "test-field-2",
						"type":  "string",
					},
				},
				"$schema": "https://json-schema.org/draft/2020-12/schema",
				"type":    "object",
			})
	})
}

func publicAPISeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()

	/// Workspace
	wid := accountdomain.WorkspaceID(pApiW1Id)
	w := workspace.New().ID(wid).Name("Test Workspace").Alias(pApiW1Alias).Members(map[accountdomain.UserID]workspace.Member{
		uid: {Role: workspace.RoleOwner, InvitedBy: uid},
	}).MustBuild()
	lo.Must0(r.Workspace.Save(ctx, w))

	/// Project 1 (Public Project)
	p1 := project.New().ID(pApiP1Id).Workspace(wid).Alias(pApiP1Alias).Accessibility(project.NewPublicAccessibility()).MustBuild()
	lo.Must0(r.Project.Save(ctx, p1))

	/// Project 1 Asset 1
	p1a1 := asset.New().ID(pApiP1A1Id).Project(pApiP1Id).CreatedByUser(uid).Size(1).Thread(id.NewThreadID().Ref()).FileName("aaa.zip").UUID(pApiA1UUID).MustBuild()
	lo.Must0(r.Asset.Save(ctx, p1a1))

	p1a1c := []*asset.File{
		asset.NewFile().Name("bbb.txt").Path("aaa/bbb.txt").Build(),
		asset.NewFile().Name("ccc.txt").Path("aaa/ccc.txt").Build(),
	}
	p1a1f := asset.NewFile().Name("aaa.zip").Path("aaa.zip").ContentType("application/zip").Size(10).Children(p1a1c).Build()
	lo.Must0(r.AssetFile.Save(ctx, p1a1.ID(), p1a1f))

	/// Project 1 Asset 2
	p1a2 := asset.New().ID(pApiP1A2Id).Project(pApiP1Id).CreatedByUser(uid).Size(1).Thread(id.NewThreadID().Ref()).FileName("aaa.zip").UUID(pApiA2UUID).MustBuild()
	lo.Must0(r.Asset.Save(ctx, p1a2))

	p1a2f := p1a1f
	lo.Must0(r.AssetFile.Save(ctx, p1a2.ID(), p1a2f))

	/// Project 1 Model 1
	p1s1txt1Id := id.NewFieldID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	p1s1 := schema.New().ID(pApiP1S1Id).Project(pApiP1Id).Workspace(p1.Workspace()).
		Fields(schema.FieldList{
			schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1s1txt1Id).Name(pApiP1S1F1Key).Key(id.NewKey(pApiP1S1F1Key)).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(pApiP1S1F2Key).Key(id.NewKey(pApiP1S1F2Key)).MustBuild(),
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name(pApiP1S1F3Key).Key(id.NewKey(pApiP1S1F3Key)).Multiple(true).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(pApiP1S1F4Key).Key(id.NewKey(pApiP1S1F4Key)).Multiple(true).MustBuild(),
			schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name(pApiP1S1F5Key).Key(id.NewKey(pApiP1S1F5Key)).MustBuild(),
			schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name(pApiP1S1F6Key).Key(id.NewKey(pApiP1S1F6Key)).MustBuild(),
		}).TitleField(p1s1txt1Id.Ref()).
		MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1s1))

	p1m1 := model.New().ID(pApiP1M1Id).Project(pApiP1Id).Schema(p1s1.ID()).Key(id.NewKey(pApiP1M1Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m1))

	/// Project 1 Model 2
	p1s2 := schema.New().NewID().Project(pApiP1Id).Workspace(p1.Workspace()).
		Fields(schema.FieldList{
			schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1s1txt1Id).Name(pApiP1S2F1Key).Key(id.NewKey(pApiP1S2F1Key)).MustBuild(),
			schema.NewField(schema.NewReference(p1m1.ID(), p1m1.Schema(), nil, nil).TypeProperty()).NewID().Name(pApiP1S2F2Key).Key(id.NewKey(pApiP1S2F2Key)).MustBuild(),
		}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1s2))

	p1m2 := model.New().ID(pApiP1M2Id).Project(pApiP1Id).Schema(p1s2.ID()).Name(pApiP1M2Key).Key(id.NewKey(pApiP1M2Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m2))

	/// Project 1 Model 3
	p1g1f1Id := id.NewFieldID()
	p1g1s := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1g1f1Id).Name("text").Key(id.NewKey("text")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1g1s))

	p1g1 := group.New().ID(id.NewGroupID()).Project(p1.ID()).Schema(p1g1s.ID()).Name("group1").Key(id.NewKey("group1")).MustBuild()
	lo.Must0(r.Group.Save(ctx, p1g1))

	p1g2f1Id := id.NewFieldID()
	p1g2s := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1g2f1Id).Name("text2").Key(id.NewKey("text2")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1g2s))

	p1g2 := group.New().ID(id.NewGroupID()).Project(p1.ID()).Schema(p1g2s.ID()).Name("group2").Key(id.NewKey("group2")).MustBuild()
	lo.Must0(r.Group.Save(ctx, p1g2))

	p1s3g1Id := id.NewFieldID()
	p1s3g2Id := id.NewFieldID()
	p1s3geo1Id := id.NewFieldID()
	p1s3 := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewGroup(p1g1.ID()).TypeProperty()).ID(p1s3g1Id).Name(pApiP1S3F1Key).Key(id.NewKey(pApiP1S3F1Key)).MustBuild(),
		schema.NewField(schema.NewGroup(p1g2.ID()).TypeProperty()).ID(p1s3g2Id).Name(pApiP1S3F2Key).Key(id.NewKey(pApiP1S3F2Key)).Multiple(true).MustBuild(),
		schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).ID(p1s3geo1Id).Name(pApiP1S3F3Key).Key(id.NewKey(pApiP1S3F3Key)).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1s3))

	p1m3 := model.New().ID(pApiP1M3Id).Project(pApiP1Id).Schema(p1s3.ID()).Name(pApiP1M3Key).Key(id.NewKey(pApiP1M3Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m3))

	/// Project 1 Model 4
	p1s4 := p1s3.Clone()
	lo.Must0(r.Schema.Save(ctx, p1s4))

	p1m4 := model.New().ID(pApiP1M4Id).Project(p1.ID()).Schema(p1s4.ID()).Key(id.NewKey(pApiP1M4Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m4))

	p1m1i1 := item.New().
		ID(pApiP1M1I1Id).
		Model(p1m1.ID()).
		Schema(p1s1.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
			item.NewField(p1s1.Fields()[1].ID(), value.TypeAsset.Value(p1a1.ID()).AsMultiple(), nil),
		}).MustBuild()

	p1m1i2 := item.New().
		ID(pApiP1M1I2Id).
		Model(p1m1.ID()).
		Schema(p1s1.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("bbb").AsMultiple(), nil),
		}).MustBuild()

	p1m1i3 := item.New().
		ID(pApiP1M1I3Id).
		Model(p1m1.ID()).
		Schema(p1s1.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("ccc").AsMultiple(), nil),
			item.NewField(p1s1.Fields()[1].ID(), value.TypeAsset.Value(pApiP1A2Id).AsMultiple(), nil),
			item.NewField(p1s1.Fields()[2].ID(), value.NewMultiple(value.TypeText, []any{"aaa", "bbb", "ccc"}), nil),
			item.NewField(p1s1.Fields()[3].ID(), value.TypeAsset.Value(p1a1.ID()).AsMultiple(), nil),
		}).MustBuild()

	p1m1i4 := item.New().
		ID(pApiP1M1I4Id).
		Model(p1m1.ID()).
		Schema(p1s1.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("ddd").AsMultiple(), nil),
		}).MustBuild()

	p1m1i5 := item.New().
		ID(pApiP1M1I5Id).
		Model(p1m1.ID()).
		Schema(p1s1.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("eee").AsMultiple(), nil),
			item.NewField(p1s1.Fields()[1].ID(), value.TypeAsset.Value(pApiP1A2Id).AsMultiple(), nil),
			item.NewField(p1s1.Fields()[2].ID(), value.NewMultiple(value.TypeText, []any{"aaa", "bbb", "ccc"}), nil),
			item.NewField(p1s1.Fields()[3].ID(), value.TypeAsset.Value(p1a1.ID()).AsMultiple(), nil),
			item.NewField(p1s1.Fields()[4].ID(), value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}").AsMultiple(), nil),
			item.NewField(p1s1.Fields()[5].ID(), value.TypeGeometryEditor.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil),
		}).MustBuild()

	p1m2i1 := item.New().
		ID(pApiP1M2I1Id).
		Model(p1m2.ID()).
		Schema(p1s2.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s2.Fields()[0].ID(), value.TypeText.Value("bbb").AsMultiple(), nil),
			item.NewField(p1s2.Fields()[1].ID(), value.TypeReference.Value(p1m1i1.ID()).AsMultiple(), nil),
		}).MustBuild()

	p1m3i1 := item.New().
		ID(pApiP1M3I1Id).
		Model(p1m3.ID()).
		Schema(p1s3.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s3.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
		}).MustBuild()

	p1m4i8ig1 := id.NewItemGroupID()
	p1m4i8ig2 := id.NewItemGroupID()
	p1m4i1 := item.New().
		ID(pApiP1M4I1Id).
		Model(p1m4.ID()).
		Schema(p1s4.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		IsMetadata(false).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s3g1Id, value.TypeGroup.Value(p1m4i8ig1).AsMultiple(), nil),
			item.NewField(p1s3g2Id, value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(p1m4i8ig2)}), nil),
			item.NewField(p1s3geo1Id, value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}").AsMultiple(), nil),
			item.NewField(p1g1f1Id, value.TypeText.Value("aaa").AsMultiple(), p1m4i8ig1.Ref()),
			item.NewField(p1g2f1Id, value.TypeText.Value("bbb").AsMultiple(), p1m4i8ig2.Ref()),
		}).
		MustBuild()

	lo.Must0(r.Item.Save(ctx, p1m1i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i1.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m1i2))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i2.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m1i3))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i3.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m1i4))
	//lo.Must0(r.Item.UpdateRef(ctx, p1m1i4.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m1i5))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i5.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m2i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m2i1.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.Save(ctx, p1m3i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m3i1.ID(), version.Public, version.Latest.OrVersion().Ref()))

	lo.Must0(r.Item.Save(ctx, p1m4i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m4i1.ID(), version.Public, version.Latest.OrVersion().Ref()))

	/// Project 2 (Private Project)
	p2 := project.New().
		ID(pApiP2Id).
		Workspace(wid).
		Alias(pApiP2Alias).
		Accessibility(project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), nil)).
		MustBuild()
	lo.Must0(r.Project.Save(ctx, p2))

	/// Project 2 Model 1
	p2s1 := schema.New().NewID().Project(p2.ID()).Workspace(p2.Workspace()).Fields(schema.FieldList{}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p2s1))

	p2m1 := model.New().ID(pApiP2M1Id).Project(p2.ID()).Schema(p2s1.ID()).Key(id.NewKey(pApiP2M1Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p2m1))

	/// Project 2 Model 2
	p2s2 := schema.New().NewID().Project(p2.ID()).Workspace(p2.Workspace()).Fields(schema.FieldList{}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p2s2))

	p2m2 := model.New().NewID().Project(p2.ID()).Schema(p2s2.ID()).Key(id.NewKey(pApiP2M2Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, p2m2))

	p2.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{p2m2.ID()}, false), nil))
	lo.Must0(r.Project.Save(ctx, p2))

	return nil
}
