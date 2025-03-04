package e2e

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
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
	publicAPIProjectID     = id.NewProjectID()
	publicAPIProjectID2    = id.NewProjectID()
	publicAPIModelID       = id.NewModelID()
	publicAPIModelID2      = id.NewModelID()
	publicAPIItem1ID       = id.NewItemID()
	publicAPIItem2ID       = id.NewItemID()
	publicAPIItem3ID       = id.NewItemID()
	publicAPIItem4ID       = id.NewItemID()
	publicAPIItem6ID       = id.NewItemID()
	publicAPIItem7ID       = id.NewItemID()
	publicAPIAsset1ID      = id.NewAssetID()
	publicAPIAsset2ID      = id.NewAssetID()
	publicAPIAssetUUID     = uuid.NewString()
	publicAPIProjectAlias  = "test-project"
	publicAPIProjectAlias2 = "test-project-2"
	publicAPIModelKey      = "test-model"
	publicAPIModelKey2     = "test-model-2"
	publicAPIModelKey3     = "test-model-3"
	publicAPIModelKey4     = "test-model-4"
	publicAPIField1Key     = "test-field-1"
	publicAPIField2Key     = "asset"
	publicAPIField3Key     = "test-field-2"
	publicAPIField4Key     = "asset2"
	publicAPIField5Key     = "geometry-object"
	publicAPIField6Key     = "geometry-editor"
)

func TestPublicAPI(t *testing.T) {
	e, repos, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	// not found
	e.GET("/api/p/{project}/{model}", "invalid-alias", publicAPIModelKey).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey2).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, "invalid-key").
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, publicAPIModelKey, id.NewItemID()).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{"error": "not found"})

	// ok
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"results": []map[string]any{
				{
					"id":               publicAPIItem1ID.String(),
					publicAPIField1Key: "aaa",
					publicAPIField2Key: map[string]any{
						"type": "asset",
						"id":   publicAPIAsset1ID.String(),
						"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
					},
				},
				{
					"id":               publicAPIItem2ID.String(),
					publicAPIField1Key: "bbb",
				},
				{
					"id":               publicAPIItem3ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					publicAPIField4Key: []any{
						map[string]any{
							"type": "asset",
							"id":   publicAPIAsset1ID.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
						},
					},
				},
				{
					"id":               publicAPIItem6ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					publicAPIField4Key: []any{
						map[string]any{
							"type": "asset",
							"id":   publicAPIAsset1ID.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
						},
					},
					publicAPIField5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					publicAPIField6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
				{
					"id":               publicAPIItem7ID.String(),
					publicAPIField1Key: "ccc",
				},
			},
			"totalCount": 5,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	// offset pagination
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		WithQuery("limit", "1").
		WithQuery("offset", "1").
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"results": []map[string]any{
				{
					"id":               publicAPIItem2ID.String(),
					publicAPIField1Key: "bbb",
				},
			},
			"totalCount": 5,
			"hasMore":    true,
			"limit":      1,
			"offset":     1,
			"page":       2,
		})

	// cursor pagination
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		WithQuery("start_cursor", publicAPIItem1ID.String()).
		WithQuery("page_size", "1").
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"results": []map[string]any{
				{
					"id":               publicAPIItem2ID.String(),
					publicAPIField1Key: "bbb",
				},
			},
			"totalCount": 5,
			"hasMore":    true,
			"nextCursor": publicAPIItem2ID.String(),
		})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, publicAPIModelKey, publicAPIItem1ID).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"id":               publicAPIItem1ID.String(),
			publicAPIField1Key: "aaa",
			publicAPIField2Key: map[string]any{
				"type": "asset",
				"id":   publicAPIAsset1ID.String(),
				"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
			},
		})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, "___", publicAPIItem1ID).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, publicAPIModelKey, publicAPIItem4ID).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	e.GET("/api/p/{project}/assets", publicAPIProjectAlias).
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
					"id":          publicAPIAsset1ID.String(),
					"type":        "asset",
					"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
					"contentType": "application/zip",
					"files": []string{
						fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
						fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
					},
				},
			},
			"totalCount": 1,
		})

	e.GET("/api/p/{project}/assets/{assetid}", publicAPIProjectAlias, publicAPIAsset1ID).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"type":        "asset",
			"id":          publicAPIAsset1ID.String(),
			"url":         fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
			"contentType": "application/zip",
			"files": []string{
				fmt.Sprintf("https://example.com/assets/%s/%s/aaa/bbb.txt", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
				fmt.Sprintf("https://example.com/assets/%s/%s/aaa/ccc.txt", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
			},
		})

	// make the project's assets private
	ctx := context.Background()
	prj := lo.Must(repos.Project.FindByID(ctx, publicAPIProjectID))
	prj.Publication().SetAssetPublic(false)
	lo.Must0(repos.Project.Save(ctx, prj))

	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"results": []map[string]any{
				{
					"id":               publicAPIItem1ID.String(),
					publicAPIField1Key: "aaa",
					// publicAPIField2Key should be removed
				},
				{
					"id":               publicAPIItem2ID.String(),
					publicAPIField1Key: "bbb",
				},
				{
					"id":               publicAPIItem3ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					// publicAPIField4Key should be removed
				},
				{
					"id":               publicAPIItem6ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					publicAPIField5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					publicAPIField6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
				{
					"id":               publicAPIItem7ID.String(),
					publicAPIField1Key: "ccc",
				},
			},
			"totalCount": 5,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	e.GET("/api/p/{project}/{model}.geojson", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]interface{}{
			"type": "FeatureCollection",
			"features": []map[string]interface{}{
				{
					"type": "Feature",
					"id":   publicAPIItem6ID.String(),
					"geometry": map[string]interface{}{
						"type": "Point",
						"coordinates": []interface{}{
							102,
							0.5,
						},
					},
					"properties": map[string]interface{}{
						"test-field-1": "ccc",
						"test-field-2": []interface{}{
							"aaa",
							"bbb",
							"ccc",
						},
					},
				},
			},
		})

	// no geometry field
	e.GET("/api/p/{project}/{model}.geojson", publicAPIProjectAlias, publicAPIModelKey3).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]interface{}{
			"error": "not found",
		})

	e.GET("/api/p/{project}/{model}.csv", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusOK).
		Body().
		IsEqual(fmt.Sprintf("id,location_lat,location_lng,test-field-1,asset,test-field-2,asset2\n%s,102,0.5,ccc,,aaa,\n", publicAPIItem6ID.String()))

	// no geometry field
	e.GET("/api/p/{project}/{model}.csv", publicAPIProjectAlias, publicAPIModelKey3).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]interface{}{
			"error": "not found",
		})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, publicAPIModelKey, publicAPIItem1ID).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"id":               publicAPIItem1ID.String(),
			publicAPIField1Key: "aaa",
			// publicAPIField2Key should be removed
		})

	// schema export json
	e.GET("/api/p/{project}/{model}/schema.json", publicAPIProjectAlias, id.RandomKey()).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/p/{project}/{model}/schema.json", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id": publicAPIModelID,
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

	// make the project private
	prj.Publication().SetScope(project.PublicationScopePrivate)
	lo.Must0(repos.Project.Save(ctx, prj))

	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	e.GET("/api/p/{project}/{model}/{item}", publicAPIProjectAlias, publicAPIModelKey, publicAPIItem1ID).
		Expect().
		Status(http.StatusNotFound).
		JSON().
		IsEqual(map[string]any{
			"error": "not found",
		})

	// make the project limited
	prj.Publication().SetScope(project.PublicationScopeLimited)
	prj.Publication().SetAssetPublic(true)
	prj.Publication().GenerateToken()
	token := prj.Publication().Token()
	lo.Must0(repos.Project.Save(ctx, prj))

	// invalid token
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		WithHeader("Origin", "https://example.com").
		WithHeader("Authorization", "secret_abc").
		WithHeader("Content-Type", "application/json").
		Expect().
		Status(http.StatusUnauthorized).
		JSON().
		IsEqual(map[string]interface{}{
			"error": "invalid token",
		})

	// valid token
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias, publicAPIModelKey).
		WithHeader("Origin", "https://example.com").
		WithHeader("Authorization", token).
		WithHeader("Content-Type", "application/json").
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"results": []map[string]any{
				{
					"id":               publicAPIItem1ID.String(),
					publicAPIField1Key: "aaa",
					publicAPIField2Key: map[string]any{
						"type": "asset",
						"id":   publicAPIAsset1ID.String(),
						"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
					},
				},
				{
					"id":               publicAPIItem2ID.String(),
					publicAPIField1Key: "bbb",
				},
				{
					"id":               publicAPIItem3ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					publicAPIField4Key: []any{
						map[string]any{
							"type": "asset",
							"id":   publicAPIAsset1ID.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
						},
					},
				},
				{
					"id":               publicAPIItem6ID.String(),
					publicAPIField1Key: "ccc",
					publicAPIField3Key: []string{"aaa", "bbb", "ccc"},
					publicAPIField4Key: []any{
						map[string]any{
							"type": "asset",
							"id":   publicAPIAsset1ID.String(),
							"url":  fmt.Sprintf("https://example.com/assets/%s/%s/aaa.zip", publicAPIAssetUUID[:2], publicAPIAssetUUID[2:]),
						},
					},
					publicAPIField5Key: "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
					publicAPIField6Key: "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
				},
				{
					"id":               publicAPIItem7ID.String(),
					publicAPIField1Key: "ccc",
				},
			},
			"totalCount": 5,
			"hasMore":    false,
			"limit":      50,
			"offset":     0,
			"page":       1,
		})

	// different project in the same workspace with the same token
	e.GET("/api/p/{project}/{model}", publicAPIProjectAlias2, publicAPIModelKey2).
		WithHeader("Origin", "https://example.com").
		WithHeader("Authorization", token).
		WithHeader("Content-Type", "application/json").
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		IsEqual(map[string]any{
			"error": "invalid project",
		})
}

func publicAPISeeder(ctx context.Context, r *repo.Container) error {
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	p1 := project.New().ID(publicAPIProjectID).Workspace(wid).Alias(publicAPIProjectAlias).Publication(
		project.NewPublication(project.PublicationScopePublic, true),
	).MustBuild()
	p2 := project.New().ID(publicAPIProjectID2).Workspace(wid).Alias(publicAPIProjectAlias2).Publication(
		project.NewPublicationWithToken(project.PublicationScopeLimited, true, "secret_abcdefghijklmnopqrstuvwxyz"),
	).MustBuild()

	a := asset.New().ID(publicAPIAsset1ID).Project(p1.ID()).CreatedByUser(uid).Size(1).Thread(id.NewThreadID().Ref()).
		FileName("aaa.zip").UUID(publicAPIAssetUUID).MustBuild()
	c := []*asset.File{asset.NewFile().Name("bbb.txt").Path("aaa/bbb.txt").Build(), asset.NewFile().Name("ccc.txt").Path("aaa/ccc.txt").Build()}
	af := asset.NewFile().Name("aaa.zip").Path("aaa.zip").ContentType("application/zip").Size(10).Children(c).Build()

	fid := id.NewFieldID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	s := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(fid).Name(publicAPIField1Key).Key(id.NewKey(publicAPIField1Key)).MustBuild(),
		schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(publicAPIField2Key).Key(id.NewKey(publicAPIField2Key)).MustBuild(),
		schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name(publicAPIField3Key).Key(id.NewKey(publicAPIField3Key)).Multiple(true).MustBuild(),
		schema.NewField(schema.NewAsset().TypeProperty()).NewID().Name(publicAPIField4Key).Key(id.NewKey(publicAPIField4Key)).Multiple(true).MustBuild(),
		schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name(publicAPIField5Key).Key(id.NewKey(publicAPIField5Key)).MustBuild(),
		schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name(publicAPIField6Key).Key(id.NewKey(publicAPIField6Key)).MustBuild(),
	}).TitleField(fid.Ref()).MustBuild()

	s2 := schema.New().NewID().Project(p1.ID()).Workspace(p1.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(fid).Name(publicAPIField1Key).Key(id.NewKey(publicAPIField1Key)).MustBuild(),
	}).MustBuild()

	m := model.New().ID(publicAPIModelID).Project(p1.ID()).Schema(s.ID()).Public(true).Key(id.NewKey(publicAPIModelKey)).MustBuild()
	// m2 is not a public model
	m2 := model.New().ID(publicAPIModelID).Project(p1.ID()).Schema(s.ID()).Name(publicAPIModelKey2).Key(id.NewKey(publicAPIModelKey2)).Public(false).MustBuild()
	m3 := model.New().ID(publicAPIModelID).Project(p1.ID()).Schema(s2.ID()).Name(publicAPIModelKey3).Key(id.NewKey(publicAPIModelKey3)).Public(true).MustBuild()
	m4 := model.New().ID(publicAPIModelID2).Project(p2.ID()).Schema(id.NewSchemaID()).Key(id.NewKey(publicAPIModelKey4)).Public(true).MustBuild()

	i1 := item.New().ID(publicAPIItem1ID).Model(m.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
		item.NewField(s.Fields()[1].ID(), value.TypeAsset.Value(a.ID()).AsMultiple(), nil),
	}).MustBuild()

	i2 := item.New().ID(publicAPIItem2ID).Model(m.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("bbb").AsMultiple(), nil),
	}).MustBuild()

	i3 := item.New().ID(publicAPIItem3ID).Model(m.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("ccc").AsMultiple(), nil),
		item.NewField(s.Fields()[1].ID(), value.TypeAsset.Value(publicAPIAsset2ID).AsMultiple(), nil),
		item.NewField(s.Fields()[2].ID(), value.NewMultiple(value.TypeText, []any{"aaa", "bbb", "ccc"}), nil),
		item.NewField(s.Fields()[3].ID(), value.TypeAsset.Value(a.ID()).AsMultiple(), nil),
	}).MustBuild()

	// not public
	i4 := item.New().ID(publicAPIItem4ID).Model(m.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("ddd").AsMultiple(), nil),
	}).MustBuild()
	// not public model
	i5 := item.New().ID(publicAPIItem1ID).Model(m2.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("aaa").AsMultiple(), nil),
		item.NewField(s.Fields()[1].ID(), value.TypeAsset.Value(a.ID()).AsMultiple(), nil),
	}).MustBuild()

	i6 := item.New().ID(publicAPIItem6ID).Model(m.ID()).Schema(s.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("ccc").AsMultiple(), nil),
		item.NewField(s.Fields()[1].ID(), value.TypeAsset.Value(publicAPIAsset2ID).AsMultiple(), nil),
		item.NewField(s.Fields()[2].ID(), value.NewMultiple(value.TypeText, []any{"aaa", "bbb", "ccc"}), nil),
		item.NewField(s.Fields()[3].ID(), value.TypeAsset.Value(a.ID()).AsMultiple(), nil),
		item.NewField(s.Fields()[4].ID(), value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}").AsMultiple(), nil),
		item.NewField(s.Fields()[5].ID(), value.TypeGeometryEditor.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil),
	}).MustBuild()

	i7 := item.New().ID(publicAPIItem7ID).Model(m3.ID()).Schema(s2.ID()).Project(p1.ID()).Thread(id.NewThreadID().Ref()).User(uid).Fields([]*item.Field{
		item.NewField(s.Fields()[0].ID(), value.TypeText.Value("ccc").AsMultiple(), nil),
	}).MustBuild()

	lo.Must0(r.Project.Save(ctx, p1))
	lo.Must0(r.Project.Save(ctx, p2))
	lo.Must0(r.Asset.Save(ctx, a))
	lo.Must0(r.AssetFile.Save(ctx, a.ID(), af))
	lo.Must0(r.Schema.Save(ctx, s))
	lo.Must0(r.Model.Save(ctx, m))
	lo.Must0(r.Model.Save(ctx, m4))
	lo.Must0(r.Item.Save(ctx, i1))
	lo.Must0(r.Item.Save(ctx, i2))
	lo.Must0(r.Item.Save(ctx, i3))
	lo.Must0(r.Item.Save(ctx, i4))
	lo.Must0(r.Item.Save(ctx, i5))
	lo.Must0(r.Item.Save(ctx, i6))
	lo.Must0(r.Item.Save(ctx, i7))
	lo.Must0(r.Item.UpdateRef(ctx, i1.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, i2.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, i3.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, i6.ID(), version.Public, version.Latest.OrVersion().Ref()))
	lo.Must0(r.Item.UpdateRef(ctx, i7.ID(), version.Public, version.Latest.OrVersion().Ref()))

	return nil
}
