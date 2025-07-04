package e2e

import (
	"context"
	"fmt"
	"net/http"
	"testing"

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
	"github.com/samber/lo"
)

var (
	pApiP1Id               = id.NewProjectID()
	pApiP1Alias            = "test-project"
	pApiP1A1Id             = id.NewAssetID()
	pApiA1UUID             = uuid.NewString()
	pApiP1A2Id             = id.NewAssetID()
	pApiP1M1Id             = id.NewModelID()
	pApiP1M1Key            = "test-model"
	pApiP1S1F1Key          = "test-field-1"
	pApiP1S1F2Key          = "asset"
	pApiP1S1F3Key          = "test-field-2"
	pApiP1S1F4Key          = "asset2"
	pApiP1S1F5Key          = "geometry-object"
	pApiP1S1F6Key          = "geometry-editor"
	pApiP1M1I1Id           = id.NewItemID()
	pApiP1M1I2Id           = id.NewItemID()
	pApiP1M1I3Id           = id.NewItemID()
	pApiP1M1I4Id           = id.NewItemID()
	pApiP1M1I5Id           = id.NewItemID()
	pApiP1M2Id             = id.NewModelID()
	pApiP1M2Key            = "test-model-2"
	pApiP1M3Id             = id.NewModelID()
	pApiP1M3Key            = "test-model-3"
	pApiP1M3I1Id           = id.NewItemID()
	pApiP2Id               = id.NewProjectID()
	pApiP2M1Id             = id.NewModelID()
	pApiP2M1Key            = "test-model-4"
	pApiP1M2I1Id           = id.NewItemID()
	pApiP1S2F1Key          = "test-field-1"
	publicAPIProjectAlias2 = "test-project-2"
	pApiP1M4Id             = id.NewModelID()
	pApiP1M4Key            = "test-model-5"
	pApiP1M4I1Id           = id.NewItemID()
	pApiP1S3F1Key          = "group"
	pApiP1S3F2Key          = "multiple-group"
	pApiP1S3F3Key          = "geometry-object"
)

func TestPublicAPI_NotFound(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{project}/{model}", "invalid-alias", pApiP1M1Key).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M2Key).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}", pApiP1Alias, "invalid-key").
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, pApiP1M1Key, id.NewItemID()).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})
}

func TestPublicAPI_Item(t *testing.T) {
	e, r, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
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

	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, "___", pApiP1M1I1Id).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, pApiP1M1Key, pApiP1M1I4Id).
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
	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
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

	e.GET("/api/p/{project}/{model}/{item}", pApiP1Alias, pApiP1M1Key, pApiP1M1I1Id).
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

	e.GET("/api/p/{project}/assets", pApiP1Alias).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"hasMore": false,
			"limit":   50,
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
			"totalCount": 1,
		})

	e.GET("/api/p/{project}/assets/{assetid}", pApiP1Alias, pApiP1A1Id).
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
}

func TestPublicAPI_Model(t *testing.T) {
	e, r, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	// ok
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
					pApiP1S1F5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					pApiP1S1F6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
			},
			"totalCount": 4,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	// offset pagination
	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
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

	// cursor pagination
	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
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

	// make the project's assets private
	ctx := context.Background()
	prj := lo.Must(r.Project.FindByID(ctx, pApiP1Id))
	prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{pApiP1M1Id}, false), nil))
	lo.Must0(r.Project.Save(ctx, prj))

	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
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
					pApiP1S1F5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					pApiP1S1F6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
			},
			"totalCount": 4,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	// make the project private
	prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(id.ModelIDList{}, false), nil))
	lo.Must0(r.Project.Save(ctx, prj))

	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	// make the project limited
	apiKey := project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key1").Description("desc1").
		Publication(project.NewPublicationSettings(id.ModelIDList{pApiP1M1Id}, true)).Build()
	prj.SetAccessibility(*project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), project.APIKeys{apiKey}))
	lo.Must0(r.Project.Save(ctx, prj))

	// invalid token
	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
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
	e.GET("/api/p/{project}/{model}", pApiP1Alias, pApiP1M1Key).
		WithHeader("Origin", "https://example.com").
		WithHeader("Authorization", apiKey.Key()).
		WithHeader("Content-Type", "application/json").
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
					pApiP1S1F5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					pApiP1S1F6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
			},
			"totalCount": 4,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	// different project in the same workspace with the same token
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias2, pApiP1M2Key).
		WithHeader("Origin", "https://example.com").
		WithHeader("Authorization", apiKey.Key()).
		WithHeader("Content-Type", "application/json").
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})
}

func TestPublicAPI_Model_GeoJson(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{project}/{model}.geojson", pApiP1Alias, pApiP1M1Key).
		Expect().
		Status(http.StatusOK).
		JSON().
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
							"url":  "", // asset does not exist in db
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
	e.GET("/api/p/{project}/{model}.geojson", pApiP1Alias, pApiP1M3Key).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})
}

func TestPublicAPI_Model_CSV(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{project}/{model}.csv", pApiP1Alias, pApiP1M1Key).
		Expect().
		Status(http.StatusOK).
		Body().
		IsEqual(fmt.Sprintf("id,location_lat,location_lng,test-field-1,asset,test-field-2,asset2\n%s,0.5,102,eee,,aaa,\n", pApiP1M1I5Id.String()))

	// no geometry field
	e.GET("/api/p/{project}/{model}.csv", pApiP1Alias, pApiP1M3Key).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})
}

func TestPublicAPI_Model_Json(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	// schema export json
	e.GET("/api/p/{project}/{model}/schema.json", pApiP1Alias, id.RandomKey()).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/p/{project}/{model}/schema.json", pApiP1Alias, pApiP1M1Key).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id": pApiP1M1Id,
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
}

func publicAPISeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	p1 := project.New().
		ID(pApiP1Id).
		Workspace(wid).Alias(pApiP1Alias).
		Accessibility(project.NewPublicAccessibility()).
		MustBuild()

	p1a1 := asset.New().
		ID(pApiP1A1Id).
		Project(pApiP1Id).
		CreatedByUser(uid).
		Size(1).
		Thread(id.NewThreadID().Ref()).
		FileName("aaa.zip").
		UUID(pApiA1UUID).
		MustBuild()
	c := []*asset.File{
		asset.NewFile().Name("bbb.txt").Path("aaa/bbb.txt").Build(),
		asset.NewFile().Name("ccc.txt").Path("aaa/ccc.txt").Build(),
	}
	af := asset.NewFile().Name("aaa.zip").Path("aaa.zip").ContentType("application/zip").Size(10).Children(c).Build()

	fid := id.NewFieldID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	p1s1 := schema.New().
		NewID().
		Project(pApiP1Id).
		Workspace(p1.Workspace()).
		Fields(schema.FieldList{
			schema.NewField(schema.NewText(nil).TypeProperty()).ID(fid).Name(pApiP1S1F1Key).Key(id.NewKey(pApiP1S1F1Key)).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(pApiP1S1F2Key).Key(id.NewKey(pApiP1S1F2Key)).MustBuild(),
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name(pApiP1S1F3Key).Key(id.NewKey(pApiP1S1F3Key)).Multiple(true).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(pApiP1S1F4Key).Key(id.NewKey(pApiP1S1F4Key)).Multiple(true).MustBuild(),
			schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name(pApiP1S1F5Key).Key(id.NewKey(pApiP1S1F5Key)).MustBuild(),
			schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name(pApiP1S1F6Key).Key(id.NewKey(pApiP1S1F6Key)).MustBuild(),
		}).TitleField(fid.Ref()).
		MustBuild()

	p1s2 := schema.New().
		NewID().
		Project(pApiP1Id).
		Workspace(p1.Workspace()).
		Fields(schema.FieldList{
			schema.NewField(schema.NewText(nil).TypeProperty()).ID(fid).Name(pApiP1S2F1Key).Key(id.NewKey(pApiP1S2F1Key)).MustBuild(),
		}).MustBuild()

	p1g1f1Id := id.NewFieldID()
	p1g1f2Id := id.NewFieldID()
	p1g1f3Id := id.NewFieldID()
	p1g1f4Id := id.NewFieldID()
	p1g1f5Id := id.NewFieldID()
	p1g1s1 := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1g1f4Id).Name("text").Key(id.NewKey("text")).MustBuild(),
	}).MustBuild()
	p1g1 := group.New().ID(id.NewGroupID()).Project(p1.ID()).Schema(p1g1s1.ID()).Name("group1").Key(id.NewKey("group1")).MustBuild()
	p1g2s1 := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(p1g1f5Id).Name("text2").Key(id.NewKey("text2")).MustBuild(),
	}).MustBuild()
	p1g2 := group.New().ID(id.NewGroupID()).Project(p1.ID()).Schema(p1g2s1.ID()).Name("group2").Key(id.NewKey("group2")).MustBuild()
	p1s3 := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewGroup(p1g1.ID()).TypeProperty()).ID(p1g1f1Id).Name(pApiP1S3F1Key).Key(id.NewKey(pApiP1S3F1Key)).MustBuild(),
		schema.NewField(schema.NewGroup(p1g2.ID()).TypeProperty()).ID(p1g1f2Id).Name(pApiP1S3F2Key).Key(id.NewKey(pApiP1S3F2Key)).Multiple(true).MustBuild(),
		schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).ID(p1g1f3Id).Name(pApiP1S3F3Key).Key(id.NewKey(pApiP1S3F3Key)).MustBuild(),
	}).MustBuild()

	p1m1 := model.New().ID(pApiP1M1Id).Project(pApiP1Id).Schema(p1s1.ID()).Key(id.NewKey(pApiP1M1Key)).MustBuild()
	// p1m2 is not a public model
	p1m2 := model.New().ID(pApiP1M2Id).Project(pApiP1Id).Schema(p1s1.ID()).Name(pApiP1M2Key).Key(id.NewKey(pApiP1M2Key)).MustBuild()
	p1m3 := model.New().ID(pApiP1M3Id).Project(pApiP1Id).Schema(p1s2.ID()).Name(pApiP1M3Key).Key(id.NewKey(pApiP1M3Key)).MustBuild()
	p1m4 := model.New().ID(pApiP1M4Id).Project(p1.ID()).Schema(p1s3.ID()).Key(id.NewKey(pApiP1M4Key)).MustBuild()

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
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
			item.NewField(p1s1.Fields()[1].ID(), value.TypeAsset.Value(p1a1.ID()).AsMultiple(), nil),
		}).MustBuild()

	p1m3i1 := item.New().
		ID(pApiP1M3I1Id).
		Model(p1m3.ID()).
		Schema(p1s2.ID()).
		Project(pApiP1Id).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1s1.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
		}).MustBuild()

	p1m4i8ig1 := id.NewItemGroupID()
	p1m4i8ig2 := id.NewItemGroupID()
	p1m4i1 := item.New().
		ID(pApiP1M4I1Id).
		Model(p1m4.ID()).
		Schema(p1s3.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		IsMetadata(false).
		User(uid).
		Fields([]*item.Field{
			item.NewField(p1g1f1Id, value.TypeGroup.Value(p1m4i8ig1).AsMultiple(), nil),
			item.NewField(p1g1f2Id, value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(p1m4i8ig2)}), nil),
			item.NewField(p1g1f3Id, value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}").AsMultiple(), nil),
			item.NewField(p1g1f4Id, value.TypeText.Value("aaa").AsMultiple(), p1m4i8ig1.Ref()),
			item.NewField(p1g1f5Id, value.TypeText.Value("bbb").AsMultiple(), p1m4i8ig2.Ref()),
		}).
		MustBuild()

	lo.Must0(r.Project.Save(ctx, p1))

	lo.Must0(r.Asset.Save(ctx, p1a1))
	lo.Must0(r.AssetFile.Save(ctx, p1a1.ID(), af))
	lo.Must0(r.Schema.Save(ctx, p1s1))
	lo.Must0(r.Model.Save(ctx, p1m1))

	lo.Must0(r.Item.Save(ctx, p1m1i1))
	lo.Must0(r.Item.Save(ctx, p1m1i2))
	lo.Must0(r.Item.Save(ctx, p1m1i3))
	lo.Must0(r.Item.Save(ctx, p1m1i4))
	lo.Must0(r.Item.Save(ctx, p1m1i5))
	lo.Must0(r.Item.Save(ctx, p1m2i1))
	lo.Must0(r.Item.Save(ctx, p1m3i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i1.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i2.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i3.ID(), version.Public, version.Latest.OrVersion().Ref()))
	//lo.Must0(r.Item.UpdateRef(ctx, p1m1i4.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, p1m1i5.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, p1m3i1.ID(), version.Public, version.Latest.OrVersion().Ref()))

	lo.Must0(r.Schema.Save(ctx, p1s3))
	lo.Must0(r.Schema.Save(ctx, p1g1s1))
	lo.Must0(r.Schema.Save(ctx, p1g2s1))
	lo.Must0(r.Model.Save(ctx, p1m4))
	lo.Must0(r.Group.Save(ctx, p1g1))
	lo.Must0(r.Group.Save(ctx, p1g2))
	lo.Must0(r.Item.Save(ctx, p1m4i1))
	lo.Must0(r.Item.UpdateRef(ctx, p1m4i1.ID(), version.Public, version.Latest.OrVersion().Ref()))

	p2 := project.New().
		ID(pApiP2Id).
		Workspace(wid).
		Alias(publicAPIProjectAlias2).
		Accessibility(project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), nil)).
		MustBuild()

	p2m1 := model.New().ID(pApiP2M1Id).Project(pApiP2Id).Schema(id.NewSchemaID()).Key(id.NewKey(pApiP2M1Key)).MustBuild()

	lo.Must0(r.Project.Save(ctx, p2))
	lo.Must0(r.Model.Save(ctx, p2m1))

	return nil
}
