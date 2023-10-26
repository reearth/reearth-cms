package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createItem(e *httpexpect.Expect, mID, sID string, fields []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateItem($modelId: ID!, $schemaId: ID!, $metadataId: ID, $fields: [ItemFieldInput!]!) {
				  createItem(
					input: {modelId: $modelId, schemaId: $schemaId, metadataId: $metadataId, fields: $fields}
				  ) {
					item {
					  id
					  schemaId
					  fields {
						value
						type
						schemaFieldId
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":    mID,
			"schemaId":   sID,
			"fields":     fields,
			"metadataId": nil,
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

	return res.Path("$.data.createItem.item.id").Raw().(string), res
}

func getItem(e *httpexpect.Expect, iID string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `query GetItem($id: ID!) {
				  node(id: $id, type: Item) {
					... on Item {
					  id
					  title
					  schemaId
					  createdAt
					  updatedAt
					  status
					  version
					  assets {
						id
						url
						__typename
					  }
					  createdBy {
						... on Integration {
						  name
						  __typename
						}
						... on User {
						  name
						  __typename
						}
						__typename
					  }
					  updatedBy {
						... on Integration {
						  name
						  __typename
						}
						... on User {
						  name
						  __typename
						}
						__typename
					  }
					  fields {
						schemaFieldId
						type
						value
						__typename
					  }
					  metadata {
						id
						fields {
						  schemaFieldId
						  type
						  value
						  __typename
						}
						__typename
					  }
					  thread {
						...threadFragment
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}
				
				fragment threadFragment on Thread {
				  id
				  workspaceId
				  comments {
					id
					author {
					  ... on User {
						id
						name
						email
						__typename
					  }
					  ... on Integration {
						id
						name
						__typename
					  }
					  __typename
					}
					authorId
					content
					createdAt
					__typename
				  }
				  __typename
				}`,
		Variables: map[string]any{
			"id": iID,
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

	return res.Path("$.data.node.version").Raw().(string), res
}

func updateItem(e *httpexpect.Expect, iID, version string, fields []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateItem($itemId: ID!, $fields: [ItemFieldInput!]!, $metadataId: ID, $version: String!) {
				  updateItem(
					input: {itemId: $itemId, fields: $fields, metadataId: $metadataId, version: $version}
				  ) {
					item {
					  id
					  schemaId
					  fields {
						value
						type
						schemaFieldId
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"itemId":  iID,
			"version": version,
			"fields":  fields,
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

	return res.Path("$.data.updateItem.item.id").Raw().(string), res
}

func deleteItem(e *httpexpect.Expect, iID string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation DeleteItem($itemId: ID!) {
				  deleteItem(input: {itemId: $itemId}) {
					itemId
					__typename
				  }
				}`,
		Variables: map[string]any{
			"itemId": iID,
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

	return res.Path("$.data.deleteItem.itemId").Raw().(string), res
}

func TestCreateItem(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fids := createFieldOfEachType(t, e, mId)

	sId, _ := getModel(e, mId)

	createItem(e, mId, sId, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s1", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 1, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.1s.com", "type": "URL"},
	})

}

func TestTwoWayReferenceFields(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	m1Id, _ := createModel(e, pId, "test1", "test1", "test-1")

	m1fids := createFieldOfEachType(t, e, m1Id)

	s1Id, _ := getModel(e, m1Id)

	m2Id, _ := createModel(e, pId, "test2", "test2", "test-2")

	m2fids := createFieldOfEachType(t, e, m2Id)

	s2Id, _ := getModel(e, m2Id)

	m2refFId, _ := createField(e, m2Id, "ref", "ref", "ref",
		false, false, false, false, "Reference",
		map[string]any{
			"reference": map[string]any{
				"modelId": m1Id,
				"correspondingField": map[string]any{
					"title":       "Ref to test 1",
					"key":         "test-1-ref",
					"description": "",
					"required":    false,
				},
			},
		})

	m1i1id, _ := createItem(e, m1Id, s1Id, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "test1", "type": "Text"},
	})

	m2i1id, _ := createItem(e, m2Id, s2Id, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res := getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	m2i1ver, res := getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})

	m1i2id, _ := createItem(e, m1Id, s1Id, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "test2", "type": "Text"},
	})

	m2i2id, _ := createItem(e, m2Id, s2Id, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test2", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i2id, "type": "Reference"},
	})

	_, res = getItem(e, m1i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i2id})
	_, res = getItem(e, m2i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i2id})

	updateItem(e, m2i1id, m2i1ver, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i2id, "type": "Reference"},
	})

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})
	m2i1ver, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i2id})
	_, res = getItem(e, m1i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	_, res = getItem(e, m2i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})

	updateItem(e, m2i1id, m2i1ver, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": "", "type": "Reference"},
	})

	m2i1ver, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})
	_, res = getItem(e, m1i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})

	updateItem(e, m2i1id, m2i1ver, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	_, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})

	deleteItem(e, m2i1id)

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})

	deleteItem(e, m2i2id)
	deleteItem(e, m1i1id)
	deleteItem(e, m1i2id)

	m1i1id, _ = createItem(e, m1Id, s1Id, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "M1-I1", "type": "Text"},
	})

	m2i1id, _ = createItem(e, m2Id, s2Id, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "M2-I1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	_, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})

	m2i2id, _ = createItem(e, m2Id, s2Id, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "M2-I2", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i2id})
	_, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]any{nil})
	_, res = getItem(e, m2i2id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})
}
