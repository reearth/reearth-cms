package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
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
			"modelId":      &mID,
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
			"modelId":      &mID,
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

func TestCreateField(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

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

	_, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		ValueEqual("id", mId)

	tags := res.Path("$.data.node.schema.fields[0].typeProperty.tags").Raw().([]any)

	_, _ = updateField(e, mId, fId, "test", "test", "test",
		true, true, true, true, nil, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": []string{"s1", "s3"},
				"tags":         tags,
			},
		})

	_, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		ValueEqual("id", mId)

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

	_, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		ValueEqual("id", mId)

}
