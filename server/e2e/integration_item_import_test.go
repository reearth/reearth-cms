package e2e

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func IntegrationModelImportMultiPart(e *httpexpect.Expect, mId string, format string, strategy string, mutateSchema bool, geometryFieldKey string, content string) *httpexpect.Value {
	res := e.PUT("/api/models/{modelId}/import", mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		//WithHeader("Content-Type", "multipart/form-data").
		WithMultipart().
		WithFile("file", "./test.geojson", strings.NewReader(content)).
		WithFormField("format", format).
		WithFormField("strategy", strategy).
		WithFormField("mutateSchema", fmt.Sprintf("%t", mutateSchema)).
		WithFormField("geometryFieldKey", geometryFieldKey).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func IntegrationModelImportJSON(e *httpexpect.Expect, mId string, assetId string, format string, strategy string, mutateSchema bool, geometryFieldKey *string) *httpexpect.Value {
	res := e.PUT("/api/models/{modelId}/import", mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(map[string]any{
			"assetId":          assetId,
			"format":           format,
			"strategy":         strategy,
			"mutateSchema":     mutateSchema,
			"geometryFieldKey": geometryFieldKey,
		}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// POST /models/{modelId}/import //body: multipart
func TestIntegrationModelImportMultiPart(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)

	// strategy="insert" and mutateSchema=false
	fileContent1 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	res1 := IntegrationModelImportMultiPart(e, mId, "geoJson", "insert", false, fids.geometryObjectFid, fileContent1)
	res1.Object().Value("modelId").String().IsEqual(mId)
	res1.Object().Value("itemsCount").Number().IsEqual(1)
	res1.Object().Value("insertedCount").Number().IsEqual(1)
	res1.Object().Value("updatedCount").Number().IsEqual(0)
	res1.Object().Value("ignoredCount").Number().IsEqual(0)
	//newFields1 := res1.Object().Value("newFields").Array()
	//newFields1.Length().IsEqual(1)
	//field1 := newFields1.Value(0).Object()
	//field1.Value("key").String().IsEqual(fids.geometryObjectFid)
	items1 := IntegrationSearchItem(e, mId, 1, 10, "", "", "", nil)
	items1.Object().Value("items").Array().Length().IsEqual(1)

	// 	// strategy="insert" and mutateSchema=true
	// fileContent2 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	// res2 := IntegrationModelImport(e, mId, "geoJson", "insert", true, fids.geometryObjectFid, fileContent2)

	// // strategy="update" and mutateSchema=false
	// fileContent3 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	// res3 := IntegrationModelImport(e, mId, "geoJson", "update", false, fids.geometryObjectFid, fileContent3)

	// // strategy="update" and mutateSchema=true
	// fileContent4 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	// res4 := IntegrationModelImport(e, mId, "geoJson", "update", true, fids.geometryObjectFid, fileContent4)

	// // strategy="upsert" and mutateSchema=false
	// fileContent5 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	// res5 := IntegrationModelImport(e, mId, "geoJson", "upsert", false, fids.geometryObjectFid, fileContent5)

	// // strategy="upsert" and mutateSchema=true
	// fileContent6 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	// res6 := IntegrationModelImport(e, mId, "geoJson", "upsert", true, fids.geometryObjectFid, fileContent6)
}

// POST /models/{modelId}/import //body: json, content: geoJson
func TestIntegrationModelImportJSONWithGeoJsonInput(t *testing.T) {
	e := StartServer(t, &app.Config{Dev: true}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)

	// region strategy="insert" and mutateSchema=false

	fileContent1 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2", "bool": true}}]}`
	aId := uploadAsset(e, pId, "./test1.geojson", fileContent1).Object().Value("id").String().Raw()
	res := IntegrationModelImportJSON(e, mId, aId, "geoJson", "insert", false, &fids.geometryObjectFid)
	res.Object().Value("modelId").String().IsEqual(mId)
	res.Object().IsEqual(map[string]any{
		"modelId":       mId,
		"itemsCount":    1,
		"insertedCount": 1,
		"updatedCount":  0,
		"ignoredCount":  0,
		"newFields":     []any{},
	})

	obj := e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a := obj.Value("items").Array()
	a.Length().IsEqual(1)
	i := a.Value(0).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)

	// endregion

	mId, _ = createModel(e, pId, "test", "test", "test-2")
	geometryObjectFId, _ := createField(e, mId, "geometryObject", "geometryObject", "geometryObject",
		false, false, false, false, "GeometryObject",
		map[string]any{
			"geometryObject": map[string]any{
				"defaultValue":   nil,
				"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
			},
		})

	res = IntegrationModelImportJSON(e, mId, aId, "geoJson", "insert", true, &geometryObjectFId)
	res.Object().Value("modelId").String().IsEqual(mId)
	res.Object().ContainsSubset(map[string]any{
		"modelId":       mId,
		"itemsCount":    1,
		"insertedCount": 1,
		"updatedCount":  0,
		"ignoredCount":  0,
	})

	res.Object().Value("newFields").Array().Length().IsEqual(2)
	// insure the same order of fields
	res.Path("$.newFields[:].type").Array().IsEqual([]string{"text", "bool"})

	obj = e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().IsEqual(1)
	i = a.Value(0).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)

	//// strategy="insert" and mutateSchema=true
	//fileContent2 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [239.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	//id2 := uploadAsset(e, pId, "./test2.geojson", fileContent2).Object().Value("id").String().Raw()
	//res2 := IntegrationModelImportJSON(e, mId, id2, "geoJson", "insert", true, &fids.geometryObjectFid)
	//
	//// strategy="update" and mutateSchema=false
	//fileContent3 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	//id3 := uploadAsset(e, pId, "./test3.geojson", fileContent3).Object().Value("id").String().Raw()
	//res3 := IntegrationModelImportJSON(e, mId, id3, "geoJson", "update", false, fids.geometryObjectFid)
	//
	//// strategy="update" and mutateSchema=true
	//fileContent4 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	//id4 := uploadAsset(e, pId, "./test4.geojson", fileContent4).Object().Value("id").String().Raw()
	//res4 := IntegrationModelImportJSON(e, mId, id4, "geoJson", "update", true, fids.geometryObjectFid)
	//
	//// strategy="upsert" and mutateSchema=false
	//fileContent5 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	//id5 := uploadAsset(e, pId, "./test5.geojson", fileContent5).Object().Value("id").String().Raw()
	//res5 := IntegrationModelImportJSON(e, mId, id5, "geoJson", "upsert", false, fids.geometryObjectFid)
	//
	//// strategy="upsert" and mutateSchema=true
	//fileContent6 := `{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [139.28179282584915,36.58570985749664]}, "properties": {"text": "test2"}}]}`
	//id6 := uploadAsset(e, pId, "./test6.geojson", fileContent6).Object().Value("id").String().Raw()
	//res6 := IntegrationModelImportJSON(e, mId, id6, "geoJson", "upsert", true, fids.geometryObjectFid)
}

// POST /models/{modelId}/import //body: json, content: json, strategy="insert"
func TestIntegrationModelImportJSONWithJsonInput1(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	createFieldOfEachType(t, e, mId)

	// 3 items with predefined fields
	jsonContent := `[
	{"text": "test1", "bool": true, "number": 1.1, "text2": null},
	{"text": "test2", "bool": false, "number": 2},
	{"text": "test3", "bool": null, "number": null}]`
	aId := uploadAsset(e, pId, "./test1.json", jsonContent).Object().Value("id").String().Raw()

	// region strategy="insert" and mutateSchema=false
	res := IntegrationModelImportJSON(e, mId, aId, "json", "insert", false, nil)
	res.Object().IsEqual(map[string]any{
		"modelId":       mId,
		"itemsCount":    3,
		"insertedCount": 3,
		"updatedCount":  0,
		"ignoredCount":  0,
		"newFields":     []any{},
	})

	obj := e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 3)

	a := obj.Value("items").Array()
	a.Length().IsEqual(3)
	i := a.Value(0).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	i = a.Value(1).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	i = a.Value(2).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	// endregion

	// region strategy="insert" and mutateSchema=true
	mId, _ = createModel(e, pId, "test-2", "test-2", "test-2")

	// jsonContent = `[{"text": "test1", "bool": true, "integer": 1},{"text": "test2", "bool": false, "integer": 2}]`
	// aId = UploadAsset(e, pId, "./test1.json", jsonContent).Object().Value("id").String().Raw()
	res = IntegrationModelImportJSON(e, mId, aId, "json", "insert", true, nil)
	res.Object().ContainsSubset(map[string]any{
		"modelId":       mId,
		"itemsCount":    3,
		"insertedCount": 3,
		"updatedCount":  0,
		"ignoredCount":  0,
	})
	res.Object().Value("newFields").Array().Length().IsEqual(4)
	// insure the same order of fields
	res.Path("$.newFields[:].key").Array().IsEqual([]string{"text", "bool", "number", "text2"})
	res.Path("$.newFields[:].type").Array().IsEqual([]string{"text", "bool", "number", "text"})

	obj = e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 3)

	a = obj.Value("items").Array()
	a.Length().IsEqual(3)
	i = a.Value(0).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(4)
	i = a.Value(1).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	i = a.Value(2).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	// endregion
}

// POST /models/{modelId}/import //body: json, content: json, strategy="upsert"
func TestIntegrationModelImportJSONWithJsonInput2(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// region strategy="upsert" and mutateSchema=true
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	f := createFieldOfEachType(t, e, mId)

	r := e.POST("/api/models/{modelId}/items", mId).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    f.textFId,
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	iId := r.Value("id").String().Raw()

	jsonContent := `[{"id": "` + iId + `","text": "test1", "bool": true, "number": 1.1},{"text": "test2", "bool": false, "number": 2},{"text": "test3", "bool": null, "number": null}]`
	aId := uploadAsset(e, pId, "./test1.json", jsonContent).Object().Value("id").String().Raw()
	res := IntegrationModelImportJSON(e, mId, aId, "json", "upsert", true, nil)
	res.Object().IsEqual(map[string]any{
		"modelId":       mId,
		"itemsCount":    3,
		"insertedCount": 2,
		"updatedCount":  1,
		"ignoredCount":  0,
		"newFields":     []any{},
	})

	obj := e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 3)

	a := obj.Value("items").Array()
	a.Length().IsEqual(3)
	i := a.Value(0).Object()
	i.Value("id").NotNull().IsEqual(iId)
	i.Value("fields").Array().Length().IsEqual(3)
	i = a.Value(1).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	i = a.Value(2).Object()
	i.Value("id").NotNull()
	i.Value("fields").Array().Length().IsEqual(3)
	// endregion
}

// POST /models/{modelId}/import //body: json, content: json, strategy="upsert"
func TestIntegrationModelImportJSONWithJsonInput3(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// region strategy="update" and mutateSchema=true
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")

	f := createFieldOfEachType(t, e, mId)

	r := e.POST("/api/models/{modelId}/items", mId).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    f.textFId,
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	iId := r.Value("id").String().Raw()

	jsonContent := `[{"id": "` + iId + `","text": "test1", "bool": true, "number": 1.1},{"text": "test2", "bool": false, "number": 2},{"text": "test3", "bool": null, "number": null}]`
	aId := uploadAsset(e, pId, "./test1.json", jsonContent).Object().Value("id").String().Raw()
	res := IntegrationModelImportJSON(e, mId, aId, "json", "update", true, nil)
	res.Object().IsEqual(map[string]any{
		"modelId":       mId,
		"itemsCount":    3,
		"insertedCount": 0,
		"updatedCount":  1,
		"ignoredCount":  2,
		"newFields":     []any{},
	})

	obj := e.GET("/api/models/{modelId}/items", mId).
		// WithHeader("authorization", "Bearer "+secret).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a := obj.Value("items").Array()
	a.Length().IsEqual(1)
	i := a.Value(0).Object()
	i.Value("id").NotNull().IsEqual(iId)
	i.Value("fields").Array().Length().IsEqual(3)
	i.Value("fields").Array().IsEqual([]map[string]any{
		{
			"id":    f.textFId,
			"key":   "text",
			"type":  "text",
			"value": "test1",
		},
		{
			"id":    f.boolFId,
			"key":   "bool",
			"type":  "bool",
			"value": true,
		},
		{
			"id":    f.numberFId,
			"key":   "number",
			"type":  "number",
			"value": 1.1,
		},
	})

	// endregion
}

func uploadAsset(e *httpexpect.Expect, pId string, path string, content string) *httpexpect.Value {
	res := e.POST("/api/projects/{projectId}/assets", pId).
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithMultipart().
		WithFile("file", path, strings.NewReader(content)).
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}
