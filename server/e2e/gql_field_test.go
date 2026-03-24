package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/stretchr/testify/assert"
)

func createField(e *httpexpect.Expect, mID, title, desc, key string, multiple, unique, isTitle, required bool, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateField($modelId: ID!, $type: SchemaFieldType!, $title: String!, $description: String, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  createField(input: {modelId: $modelId, type: $type, title: $title, description: $description, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"typeProperty": fTypeProp,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect()

	if res.Raw().StatusCode != http.StatusOK {
		res.JSON().IsNull()
	}

	json := res.JSON()
	return json.Path("$.data.createField.field.id").Raw().(string), json
}

func createFields(e *httpexpect.Expect, fields []map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `#graphql
		mutation CreateFields($input: [CreateFieldInput!]!) {
			createFields(input: $input) {
				fields {
					  id
					  title
					  key
					  type
					  description
					  multiple
					  unique
					  required
					  isTitle
					  __typename
					}
					__typename
			}
		}`,
		Variables: map[string]any{
			"input": fields,
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

func createMetaField(e *httpexpect.Expect, mID, title, desc, key string, multiple, unique, isTitle, required bool, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateField($modelId: ID!, $type: SchemaFieldType!, $metadata: Boolean, $title: String!, $description: String, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  createField(input: {modelId: $modelId, type: $type, metadata: $metadata, title: $title, description: $description, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"metadata":     true,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"typeProperty": fTypeProp,
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

	return res.Path("$.data.createField.field.id").Raw().(string), res
}

func updateField(e *httpexpect.Expect, mID, fID, title, desc, key string, multiple, unique, isTitle, required bool, order *int, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateField($modelId: ID!, $fieldId: ID!, $title: String!, $description: String, $order: Int, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  updateField(input: {modelId: $modelId, fieldId: $fieldId, title: $title, description: $description, order: $order, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"fieldId":      fID,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"order":        order,
			"typeProperty": fTypeProp,
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

	return res.Path("$.data.updateField.field.id").Raw().(string), res
}

func guessSchemaFields(e *httpexpect.Expect, assetId, modelId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `query GuessSchemaFields($input: GuessSchemaFieldsInput!) {
            guessSchemaFields(input: $input) {
                total_count
                fields {
                    name
                    key
                    type
                }
            }
        }`,
		Variables: map[string]any{
			"input": map[string]any{
				"assetId": assetId,
				"modelId": modelId,
			},
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

type fIds struct {
	textFId           string
	textAreaFId       string
	markdownFId       string
	assetFId          string
	boolFId           string
	selectFId         string
	integerFId        string
	numberFId         string
	urlFId            string
	dateFId           string
	tagFID            string
	checkFid          string
	geometryObjectFid string
	geometryEditorFid string
}

func createFieldOfEachType(t *testing.T, e *httpexpect.Expect, mId string) fIds {
	textFId, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})

	textAreaFId, _ := createField(e, mId, "textArea", "textArea", "textArea",
		false, false, false, false, "TextArea",
		map[string]any{
			"textArea": map[string]any{},
		})

	markdownFId, _ := createField(e, mId, "markdown", "markdown", "markdown",
		false, false, false, false, "MarkdownText",
		map[string]any{
			"markdownText": map[string]any{},
		})

	assetFId, _ := createField(e, mId, "asset", "asset", "asset",
		false, false, false, false, "Asset",
		map[string]any{
			"asset": map[string]any{},
		})

	boolFId, _ := createField(e, mId, "bool", "bool", "bool",
		false, false, false, false, "Bool",
		map[string]any{
			"bool": map[string]any{},
		})

	selectFId, _ := createField(e, mId, "select", "select", "select",
		false, false, false, false, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": nil,
				"values":       []any{"s1", "s2", "s3"},
			},
		})

	integerFId, _ := createField(e, mId, "integer", "integer", "integer",
		false, false, false, false, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": nil,
				"min":          nil,
				"max":          nil,
			},
		})

	numberFId, _ := createField(e, mId, "number", "number", "number",
		false, false, false, false, "Number",
		map[string]any{
			"number": map[string]any{
				"defaultValue": nil,
				"min":          nil,
				"max":          nil,
			},
		})

	urlFId, _ := createField(e, mId, "url", "url", "url",
		false, false, false, false, "URL",
		map[string]any{
			"url": map[string]any{},
		})

	dateFId, _ := createField(e, mId, "date", "date", "date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": nil,
			},
		})
	tagFId, _ := createField(e, mId, "tag", "tag", "m_tag",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"tags": []any{
					map[string]any{"name": "Tag1", "color": "RED"},
					map[string]any{"name": "Tag2", "color": "MAGENTA"},
					map[string]any{"name": "Tag3", "color": "GREEN"},
					map[string]any{"name": "Tag4", "color": "BLUE"},
					map[string]any{"name": "Tag5", "color": "GOLD"},
				},
			},
		})

	checkboxFId, _ := createField(e, mId, "checkbox", "checkbox", "m_checkbox",
		false, false, false, false, "Checkbox",
		map[string]any{
			"checkbox": map[string]any{},
		})

	geometryObjectFId, _ := createField(e, mId, "geometryObject", "geometryObject", "geometryObject",
		false, false, false, false, "GeometryObject",
		map[string]any{
			"geometryObject": map[string]any{
				"defaultValue":   nil,
				"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
			},
		})

	geometryEditorFId, _ := createField(e, mId, "geometryEditor", "geometryEditor", "geometryEditor",
		false, false, false, false, "GeometryEditor",
		map[string]any{
			"geometryEditor": map[string]any{
				"defaultValue":   nil,
				"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
			},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	ids := res.Path("$.data.node.schema.fields[:].id").Raw().([]any)

	assert.Equal(t, []any{
		textFId,
		textAreaFId,
		markdownFId,
		assetFId,
		boolFId,
		selectFId,
		integerFId,
		numberFId,
		urlFId,
		dateFId,
		tagFId,
		checkboxFId,
		geometryObjectFId,
		geometryEditorFId,
	}, ids)

	return fIds{
		textFId:           textFId,
		textAreaFId:       textAreaFId,
		markdownFId:       markdownFId,
		assetFId:          assetFId,
		boolFId:           boolFId,
		selectFId:         selectFId,
		integerFId:        integerFId,
		numberFId:         numberFId,
		urlFId:            urlFId,
		dateFId:           dateFId,
		tagFID:            tagFId,
		checkFid:          checkboxFId,
		geometryObjectFid: geometryObjectFId,
		geometryEditorFid: geometryEditorFId,
	}
}

type mfIds struct {
	tagFId      string
	boolFId     string
	checkboxFId string
	dateFId     string
	textFId     string
	urlFId      string
}

func createMetaFieldOfEachType(t *testing.T, e *httpexpect.Expect, mId string) mfIds {
	tagFId, _ := createMetaField(e, mId, "tag", "tag", "m_tag",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"tags": []any{
					map[string]any{"name": "Tag1", "color": "RED"},
					map[string]any{"name": "Tag2", "color": "MAGENTA"},
					map[string]any{"name": "Tag3", "color": "GREEN"},
					map[string]any{"name": "Tag4", "color": "BLUE"},
					map[string]any{"name": "Tag5", "color": "GOLD"},
				},
			},
		})

	boolFId, _ := createMetaField(e, mId, "bool", "bool", "m_bool",
		false, false, false, false, "Bool",
		map[string]any{
			"bool": map[string]any{},
		})

	checkboxFId, _ := createMetaField(e, mId, "checkbox", "checkbox", "m_checkbox",
		false, false, false, false, "Checkbox",
		map[string]any{
			"checkbox": map[string]any{},
		})

	dateFId, _ := createMetaField(e, mId, "date", "date", "m_date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{},
		})

	textFId, _ := createMetaField(e, mId, "text", "text", "m_text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})

	urlFId, _ := createMetaField(e, mId, "url", "url", "m_url",
		false, false, false, false, "URL",
		map[string]any{
			"url": map[string]any{},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	ids := res.Path("$.data.node.metadataSchema.fields[:].id").Raw().([]any)

	assert.Equal(t, []any{
		tagFId,
		boolFId,
		checkboxFId,
		dateFId,
		textFId,
		urlFId,
	}, ids)

	return mfIds{
		tagFId:      tagFId,
		boolFId:     boolFId,
		checkboxFId: checkboxFId,
		dateFId:     dateFId,
		textFId:     textFId,
		urlFId:      urlFId,
	}
}

func TestCreateField(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fId, _ := createField(e, mId, "test", "test", "test",
		true, true, true, true, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": []string{"s1", "s2"},
				"tags": []any{
					map[string]any{"id": nil, "name": "s1", "color": "RED"},
					map[string]any{"id": nil, "name": "s2", "color": "RED"},
					map[string]any{"id": nil, "name": "s3", "color": "RED"},
				},
			},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	tags := res.Path("$.data.node.schema.fields[0].typeProperty.tags").Raw().([]any)

	_, _ = updateField(e, mId, fId, "test", "test", "test",
		true, true, false, true, nil, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": []string{"s1", "s3"},
				"tags":         tags,
			},
		})

	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	title := res.Path("$.data.node.schema.fields[0].isTitle").Raw().(bool)
	assert.False(t, title)
	_, _ = createField(e, mId, "test2", "test2", "test2",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": "t1",
				"tags": []any{
					map[string]any{"id": nil, "name": "t1", "color": "RED"},
					map[string]any{"id": nil, "name": "t2", "color": "RED"},
					map[string]any{"id": nil, "name": "t3", "color": "RED"},
				},
			},
		})

	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

}

func TestCreateFields(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-2")
	mId1, _ := createModel(e, pId, "test1", "test", "test-1")

	res := createFields(e, []map[string]any{
		{
			"modelId":     mId1,
			"type":        "Text",
			"title":       "field1",
			"key":         "field-1",
			"description": "first field",
			"multiple":    false,
			"unique":      false,
			"required":    false,
			"isTitle":     false,
			"metadata":    false,
			"typeProperty": map[string]any{
				"text": map[string]any{
					"defaultValue": "",
					"maxLength":    100,
				},
			},
		},
		{
			"modelId":     mId1,
			"type":        "Number",
			"title":       "field2",
			"key":         "field-2",
			"description": "second field",
			"multiple":    false,
			"unique":      false,
			"required":    true,
			"isTitle":     false,
			"metadata":    false,
			"typeProperty": map[string]any{
				"number": map[string]any{
					"defaultValue": 0,
					"min":          0,
					"max":          100,
				},
			},
		},
	})

	f := res.Object().
		Value("data").Object().
		Value("createFields").Object().
		Value("fields").Array()
	f.Length().IsEqual(2)
	f.Value(0).Object().
		HasValue("title", "field1").
		HasValue("key", "field-1").
		HasValue("type", "Text"). // enum values are case-sensitive
		HasValue("description", "first field").
		HasValue("multiple", false).
		HasValue("unique", false).
		HasValue("required", false).
		HasValue("isTitle", false)
	f.Value(1).Object().
		HasValue("title", "field2").
		HasValue("key", "field-2").
		HasValue("type", "Number"). // enum values are case-sensitive
		HasValue("description", "second field").
		HasValue("multiple", false).
		HasValue("unique", false).
		HasValue("required", true).
		HasValue("isTitle", false)
}

func TestClearFieldDefaultValue(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	dateFId, _ := createField(e, mId, "date", "date", "m_date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": "2024-01-01T18:06:09+09:00",
			},
		})
	intFid, _ := createField(e, mId, "integer", "integer", "integer",
		false, false, false, false, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": 9,
				"min":          nil,
				"max":          nil,
			},
		})
	selectFId, _ := createField(e, mId, "select", "select", "select",
		false, false, false, false, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": "s1",
				"values":       []any{"s1", "s2", "s3"},
			},
		})
	_, _, res := getModel(e, mId)

	dv := res.Path("$.data.node.schema.fields[:].typeProperty.defaultValue").Raw().([]any)

	assert.Equal(t, []any{"2024-01-01T18:06:09+09:00", float64(9), "s1"}, dv)

	_, _ = updateField(e, mId, dateFId, "date", "date", "m_date",
		false, false, false, false, nil, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": "",
			},
		})
	_, _ = updateField(e, mId, intFid, "integer", "integer", "integer",
		false, false, false, false, nil, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": "",
			},
		})

	_, _ = updateField(e, mId, selectFId, "select", "select", "select",
		false, false, false, false, nil, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": "",
				"values":       []any{"s1", "s2", "s3"},
			},
		})
	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)
	dv = res.Path("$.data.node.schema.fields[:].typeProperty.defaultValue").Raw().([]any)

	assert.Equal(t, []any{nil, nil, nil}, dv)
}

func TestGuessSchemaFields(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	pId, _ := createProject(e, wId.String(), "test", "test", "test-schema-guess")
	mId, _ := createModel(e, pId, "test", "test", "test-schema-guess")

	// region Json input
	jsonContent := `[{"name": "Item 1", "count": 42, "active": true, "tags": ["tag1", "tag2"]}]`
	assetId := uploadAsset(e, wId.String(), pId, "./sample.json", jsonContent).Object().Value("id").String().Raw()

	res := guessSchemaFields(e, assetId, mId)

	res.Path("$.data.guessSchemaFields.total_count").Number().IsEqual(4)

	res.Path("$.data.guessSchemaFields.fields").
		Array().
		IsEqual([]map[string]any{
			{
				"key":  "name",
				"type": "text",
				"name": "name",
			},
			{
				"key":  "count",
				"type": "integer",
				"name": "count",
			},
			{
				"key":  "active",
				"type": "bool",
				"name": "active",
			},
			{
				"key":  "tags",
				"type": "text",
				"name": "tags",
			},
		})
	// endregion

	// region GeoJson input
	geojsonContent := `{
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"properties": {
					"name": "Point Example",
					"category": "landmark",
					"elevation": 100.5,
					"length": 15.2
				},
				"geometry": {
					"type": "Point",
					"coordinates": [125.6, 10.1]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"name": "Line Example",
					"category": "route"
				},
				"geometry": {
					"type": "LineString",
					"coordinates": [
						[102.0, 0.0],
						[103.0, 1.0],
						[104.0, 0.0],
						[105.0, 1.0]
					]
				}
			}
		]
	}`

	geoJsonAssetId := uploadAsset(e, wId.String(), pId, "./sample.geojson", geojsonContent).Object().Value("id").String().Raw()

	res = guessSchemaFields(e, geoJsonAssetId, mId)

	res.Path("$.data.guessSchemaFields.total_count").Number().IsEqual(5)

	res.Path("$.data.guessSchemaFields.fields").
		Array().
		IsEqual([]map[string]any{
			{
				"key":  "geometry",
				"type": "geometryObject",
				"name": "geometry",
			},
			{
				"key":  "name",
				"type": "text",
				"name": "name",
			},
			{
				"key":  "category",
				"type": "text",
				"name": "category",
			},
			{
				"key":  "elevation",
				"type": "number",
				"name": "elevation",
			},
			{
				"key":  "length",
				"type": "number",
				"name": "length",
			},
		})
	// endregion

	// Test with existing schema
	// Create a new model with predefined fields
	existingModelId, _ := createModel(e, pId, "existing", "existing model", "existing-model")

	// Create some fields in the model
	createField(e, existingModelId, "name", "name field", "name",
		false, false, true, true, "Text",
		map[string]any{
			"text": map[string]any{},
		})

	createField(e, existingModelId, "category", "category field", "category",
		false, false, false, false, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": nil,
				"values":       []any{"landmark", "route", "area"},
			},
		})

	// Upload JSON with both existing and new fields
	mixedContent := `[
		{
			"name": "Test Item",
			"category": "landmark",
			"rating": 4.5,
			"tags": ["new", "test"],
			"active": true
		}
	]`

	mixedAssetId := uploadAsset(e, wId.String(), pId, "./mixed.json", mixedContent).Object().Value("id").String().Raw()

	// Call GuessSchemaFields query for the mixed content
	res = guessSchemaFields(e, mixedAssetId, existingModelId)

	res.Path("$.data.guessSchemaFields.total_count").Number().IsEqual(3)
	res.Path("$.data.guessSchemaFields.fields").
		Array().
		IsEqual([]map[string]any{
			{
				"key":  "rating",
				"type": "number",
				"name": "rating",
			},
			{
				"key":  "tags",
				"type": "text",
				"name": "tags",
			},
			{
				"key":  "active",
				"type": "bool",
				"name": "active",
			},
		})

}
