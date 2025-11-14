package e2e

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createItem(e *httpexpect.Expect, mID, sID string, metaId *string, fields []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateItem($modelId: ID!, $schemaId: ID!, $metadataId: ID, $fields: [ItemFieldInput!]!) {
				  createItem(
					input: {modelId: $modelId, schemaId: $schemaId, metadataId: $metadataId, fields: $fields}
				  ) {
					item {
					  id
						version
					  schemaId
              isMetadata
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
			"metadataId": metaId,
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
					  referencedItems {
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

func SearchItem(e *httpexpect.Expect, query, sort, filter, pagination map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `query SearchItem($query: ItemQueryInput!, $sort: ItemSortInput, $filter: ConditionInput, $pagination: Pagination) {
				  searchItem(input:{query: $query, sort: $sort, filter: $filter, pagination: $pagination}) {
					nodes {
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
					totalCount
					pageInfo {
					  hasNextPage
					  hasPreviousPage
					  startCursor
					  endCursor	
					  __typename
					}
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
			"query":      query,
			"sort":       sort,
			"filter":     filter,
			"pagination": pagination,
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

func updateItem(e *httpexpect.Expect, iID, version string, fields []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateItem($itemId: ID!, $fields: [ItemFieldInput!]!, $metadataId: ID, $version: String!) {
				  updateItem(
					input: {itemId: $itemId, fields: $fields, metadataId: $metadataId, version: $version}
				  ) {
					item {
					  id
					  schemaId
					  version
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

func batchDeleteItems(e *httpexpect.Expect, itemIDs []string) ([]string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation DeleteItems($itemIds: [ID!]!) {
				  deleteItems(input: {itemIds: $itemIds}) {
					itemIds
					__typename
				  }
				}`,
		Variables: map[string]any{
			"itemIds": itemIDs,
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

	deletedIDs := res.Path("$.data.deleteItems.itemIds").Raw().([]any)
	result := make([]string, 0, len(deletedIDs))
	for _, id := range deletedIDs {
		if str, ok := id.(string); ok {
			result = append(result, str)
		}
	}
	return result, res
}

func TestBatchDeleteItems(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "batch-delete-test", "Batch Delete Test", "batch-delete-test")
	mId, _ := createModel(e, pId, "test-model", "Test Model", "test-model")
	fids := createFieldOfEachType(t, e, mId)
	sId, _, _ := getModel(e, mId)

	// Test case 1: Create multiple items and batch delete them
	t.Run("success - batch delete multiple items", func(t *testing.T) {

		iid1, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "item1", "type": "Text"},
		})
		iid2, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "item2", "type": "Text"},
		})
		iid3, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "item3", "type": "Text"},
		})

		_, res1 := getItem(e, iid1)
		res1.Path("$.data.node.id").IsEqual(iid1)
		_, res2 := getItem(e, iid2)
		res2.Path("$.data.node.id").IsEqual(iid2)
		_, res3 := getItem(e, iid3)
		res3.Path("$.data.node.id").IsEqual(iid3)

		deletedIDs, deleteRes := batchDeleteItems(e, []string{iid1, iid2, iid3})

		assert.Len(t, deletedIDs, 3)
		assert.Contains(t, deletedIDs, iid1)
		assert.Contains(t, deletedIDs, iid2)
		assert.Contains(t, deletedIDs, iid3)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(3)

		e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query:     `query GetItem($id: ID!) { node(id: $id, type: Item) { id } }`,
				Variables: map[string]any{"id": iid1},
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Path("$.data.node").IsNull()
	})

	// Test case 2: Batch delete single item
	t.Run("success - batch delete single item", func(t *testing.T) {

		iid, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "single-item", "type": "Text"},
		})

		_, res := getItem(e, iid)
		res.Path("$.data.node.id").IsEqual(iid)

		deletedIDs, deleteRes := batchDeleteItems(e, []string{iid})

		assert.Len(t, deletedIDs, 1)
		assert.Equal(t, iid, deletedIDs[0])
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(1)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Value(0).IsEqual(iid)
	})

	// Test case 3: Empty item list
	t.Run("error - empty item list", func(t *testing.T) {

		e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query: `mutation DeleteItems($itemIds: [ID!]!) {
					deleteItems(input: {itemIds: $itemIds}) {
						itemIds
					}
				}`,
				Variables: map[string]any{
					"itemIds": []string{},
				},
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Path("$.errors").Array().Length().Gt(0) // Expect error for empty list
	})

	// Test case 4: Partial not found (some items exist, some don't)
	t.Run("error - partial not found", func(t *testing.T) {

		iid, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "existing-item", "type": "Text"},
		})

		nonExistentID := id.NewItemID().String()

		e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query: `mutation DeleteItems($itemIds: [ID!]!) {
					deleteItems(input: {itemIds: $itemIds}) {
						itemIds
					}
				}`,
				Variables: map[string]any{
					"itemIds": []string{iid, nonExistentID},
				},
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Path("$.errors").Array().Length().Gt(0) // Expect error for partial not found

		deleteItem(e, iid)
	})

	// Test case 5: Large batch delete
	t.Run("success - large batch delete", func(t *testing.T) {
		// Create 10 items
		itemIDs := make([]string, 10)
		for i := 0; i < 10; i++ {
			iid, _ := createItem(e, mId, sId, nil, []map[string]any{
				{"schemaFieldId": fids.textFId, "value": fmt.Sprintf("batch-item-%d", i), "type": "Text"},
			})
			itemIDs[i] = iid
		}

		deletedIDs, deleteRes := batchDeleteItems(e, itemIDs)

		assert.Len(t, deletedIDs, 10)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(10)

		for _, itemID := range itemIDs {
			assert.Contains(t, deletedIDs, itemID)
		}
	})

	// Test case 6: Batch delete items with one-way reference fields
	t.Run("success - batch delete with one-way reference fields", func(t *testing.T) {

		refMId, _ := createModel(e, pId, "ref-model", "Reference Model", "ref-model")
		refFids := createFieldOfEachType(t, e, refMId)
		refSId, _, _ := getModel(e, refMId)

		refFieldId, _ := createField(e, mId, "one_way_ref", "One Way Reference", "one-way-ref",
			false, false, false, false, "Reference",
			map[string]any{
				"reference": map[string]any{
					"modelId":            refMId,
					"schemaId":           refSId,
					"correspondingField": nil, // One-way reference
				},
			})

		refItem1, _ := createItem(e, refMId, refSId, nil, []map[string]any{
			{"schemaFieldId": refFids.textFId, "value": "referenced-item-1", "type": "Text"},
		})
		refItem2, _ := createItem(e, refMId, refSId, nil, []map[string]any{
			{"schemaFieldId": refFids.textFId, "value": "referenced-item-2", "type": "Text"},
		})

		mainItem1, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "main-item-1", "type": "Text"},
			{"schemaFieldId": refFieldId, "value": refItem1, "type": "Reference"},
		})
		mainItem2, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "main-item-2", "type": "Text"},
			{"schemaFieldId": refFieldId, "value": refItem2, "type": "Reference"},
		})

		deletedIDs, deleteRes := batchDeleteItems(e, []string{mainItem1, mainItem2})

		assert.Len(t, deletedIDs, 2)
		assert.Contains(t, deletedIDs, mainItem1)
		assert.Contains(t, deletedIDs, mainItem2)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(2)

		_, refRes1 := getItem(e, refItem1)
		refRes1.Path("$.data.node.id").IsEqual(refItem1)
		_, refRes2 := getItem(e, refItem2)
		refRes2.Path("$.data.node.id").IsEqual(refItem2)

		deleteItem(e, refItem1)
		deleteItem(e, refItem2)
	})

	// Test case 7: Batch delete items with two-way reference fields
	t.Run("success - batch delete with two-way reference fields", func(t *testing.T) {

		twoWayMId, _ := createModel(e, pId, "two-way-model", "Two Way Model", "two-way-model")
		twoWayFids := createFieldOfEachType(t, e, twoWayMId)
		twoWaySId, _, _ := getModel(e, twoWayMId)

		twoWayRefFieldId, _ := createField(e, mId, "two_way_ref", "Two Way Reference", "two-way-ref",
			false, false, false, false, "Reference",
			map[string]any{
				"reference": map[string]any{
					"modelId":  twoWayMId,
					"schemaId": twoWaySId,
					"correspondingField": map[string]any{
						"title":       "Back Reference",
						"key":         "back-ref",
						"description": "Back reference field",
						"required":    false,
					},
				},
			})

		twoWayRefItem1, _ := createItem(e, twoWayMId, twoWaySId, nil, []map[string]any{
			{"schemaFieldId": twoWayFids.textFId, "value": "two-way-ref-1", "type": "Text"},
		})
		twoWayRefItem2, _ := createItem(e, twoWayMId, twoWaySId, nil, []map[string]any{
			{"schemaFieldId": twoWayFids.textFId, "value": "two-way-ref-2", "type": "Text"},
		})

		twoWayMainItem1, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "two-way-main-1", "type": "Text"},
			{"schemaFieldId": twoWayRefFieldId, "value": twoWayRefItem1, "type": "Reference"},
		})
		twoWayMainItem2, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "two-way-main-2", "type": "Text"},
			{"schemaFieldId": twoWayRefFieldId, "value": twoWayRefItem2, "type": "Reference"},
		})

		// Verify two-way references are established
		_, mainRes1 := getItem(e, twoWayMainItem1)
		// Find the reference field in main item by iterating through fields
		mainFields := mainRes1.Path("$.data.node.fields").Array().Raw()
		var mainRefField interface{}
		for _, field := range mainFields {
			fieldMap := field.(map[string]interface{})
			if fieldMap["schemaFieldId"] == twoWayRefFieldId {
				mainRefField = fieldMap["value"]
				break
			}
		}
		assert.Equal(t, twoWayRefItem1, mainRefField)

		_, refRes1 := getItem(e, twoWayRefItem1)
		// Find the back-reference field in referenced item (last field added automatically)
		backRefValue := refRes1.Path("$.data.node.fields[-1:].value").Array().Raw()
		assert.Len(t, backRefValue, 1)
		assert.Equal(t, twoWayMainItem1, backRefValue[0])

		deletedIDs, deleteRes := batchDeleteItems(e, []string{twoWayMainItem1, twoWayMainItem2})

		assert.Len(t, deletedIDs, 2)
		assert.Contains(t, deletedIDs, twoWayMainItem1)
		assert.Contains(t, deletedIDs, twoWayMainItem2)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(2)

		_, refRes1After := getItem(e, twoWayRefItem1)
		refRes1After.Path("$.data.node.id").IsEqual(twoWayRefItem1)

		// Check if back-reference is cleared (should be null after main item deletion)
		backRefValueAfter := refRes1After.Path("$.data.node.fields[-1:].value").Array().Raw()
		assert.Len(t, backRefValueAfter, 1)
		// Reference should be cleared to null after main item deletion
		assert.Nil(t, backRefValueAfter[0])

		_, refRes2After := getItem(e, twoWayRefItem2)
		refRes2After.Path("$.data.node.id").IsEqual(twoWayRefItem2)

		deleteItem(e, twoWayRefItem1)
		deleteItem(e, twoWayRefItem2)
	})

	// Test case 8: Batch delete referenced items (should clear references in referring items)
	t.Run("success - batch delete referenced items clears references", func(t *testing.T) {
		// Create referenced items
		targetItem1, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "target-item-1", "type": "Text"},
		})
		targetItem2, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "target-item-2", "type": "Text"},
		})

		selfRefFieldId, _ := createField(e, mId, "self_ref", "Self Reference", "self-ref",
			false, false, false, false, "Reference",
			map[string]any{
				"reference": map[string]any{
					"modelId":            mId,
					"schemaId":           sId,
					"correspondingField": nil, // One-way self-reference
				},
			})

		referringItem1, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "referring-item-1", "type": "Text"},
			{"schemaFieldId": selfRefFieldId, "value": targetItem1, "type": "Reference"},
		})
		referringItem2, _ := createItem(e, mId, sId, nil, []map[string]any{
			{"schemaFieldId": fids.textFId, "value": "referring-item-2", "type": "Text"},
			{"schemaFieldId": selfRefFieldId, "value": targetItem2, "type": "Reference"},
		})

		_, refRes1 := getItem(e, referringItem1)

		// Find the self-reference field value by iterating through fields
		refFields1 := refRes1.Path("$.data.node.fields").Array().Raw()
		var selfRefValue1 interface{}
		for _, field := range refFields1 {
			fieldMap := field.(map[string]interface{})
			if fieldMap["schemaFieldId"] == selfRefFieldId {
				selfRefValue1 = fieldMap["value"]
				break
			}
		}
		assert.Equal(t, targetItem1, selfRefValue1)

		_, refRes2 := getItem(e, referringItem2)
		refFields2 := refRes2.Path("$.data.node.fields").Array().Raw()
		var selfRefValue2 interface{}
		for _, field := range refFields2 {
			fieldMap := field.(map[string]interface{})
			if fieldMap["schemaFieldId"] == selfRefFieldId {
				selfRefValue2 = fieldMap["value"]
				break
			}
		}
		assert.Equal(t, targetItem2, selfRefValue2)

		deletedIDs, deleteRes := batchDeleteItems(e, []string{targetItem1, targetItem2})

		assert.Len(t, deletedIDs, 2)
		assert.Contains(t, deletedIDs, targetItem1)
		assert.Contains(t, deletedIDs, targetItem2)
		deleteRes.Path("$.data.deleteItems.itemIds").Array().Length().IsEqual(2)

		// Verify referring items still exist and check reference field behavior
		_, referringRes1After := getItem(e, referringItem1)
		referringRes1After.Path("$.data.node.id").IsEqual(referringItem1)

		// Check self-reference field - should be cleared to null when target is deleted
		selfRefFields1After := referringRes1After.Path("$.data.node.fields").Array().Raw()
		var selfRefValueAfter1 interface{}
		for _, field := range selfRefFields1After {
			fieldMap := field.(map[string]interface{})
			if fieldMap["schemaFieldId"] == selfRefFieldId {
				selfRefValueAfter1 = fieldMap["value"]
				break
			}
		}

		assert.Nil(t, selfRefValueAfter1)

		_, referringRes2After := getItem(e, referringItem2)
		referringRes2After.Path("$.data.node.id").IsEqual(referringItem2)

		selfRefFields2After := referringRes2After.Path("$.data.node.fields").Array().Raw()
		var selfRefValueAfter2 interface{}
		for _, field := range selfRefFields2After {
			fieldMap := field.(map[string]interface{})
			if fieldMap["schemaFieldId"] == selfRefFieldId {
				selfRefValueAfter2 = fieldMap["value"]
				break
			}
		}

		assert.Nil(t, selfRefValueAfter2)

		deleteItem(e, referringItem1)
		deleteItem(e, referringItem2)
	})
}

func TestCreateItem(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fids := createFieldOfEachType(t, e, mId)

	sId, _, _ := getModel(e, mId)

	createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s1", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 1, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.1s.com", "type": "URL"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryEditor"},
	})

}

func TestClearItemValues(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fids := createFieldOfEachType(t, e, mId)

	sId, _, res := getModel(e, mId)
	tagIds := res.Path("$.data.node.schema.fields[:].typeProperty.tags[:].id").Raw().([]any)

	aid := id.NewAssetID()

	iid, r1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "Text", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "TextArea", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "MarkdownText", "type": "MarkdownText"},
		{"schemaFieldId": fids.assetFId, "value": aid.String(), "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s1", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 1, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.1s.com", "type": "URL"},
		{"schemaFieldId": fids.dateFId, "value": "2023-01-01T00:00:00Z", "type": "Date"},
		{"schemaFieldId": fids.tagFID, "value": tagIds[0], "type": "Tag"},
		{"schemaFieldId": fids.checkFid, "value": true, "type": "Checkbox"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryEditor"},
	})
	fields := r1.Path("$.data.createItem.item.fields[:].value").Raw().([]any)
	assert.Equal(t, []any{
		"Text", "TextArea", "MarkdownText", aid.String(), true, "s1", float64(1), nil, "https://www.1s.com", "2023-01-01T00:00:00Z", tagIds[0], true, "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
	}, fields)
	i1ver, _ := getItem(e, iid)
	_, r2 := updateItem(e, iid, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "", "type": "MarkdownText"},
		{"schemaFieldId": fids.assetFId, "value": "", "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": "", "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": "", "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "", "type": "URL"},
		{"schemaFieldId": fids.dateFId, "value": "", "type": "Date"},
		{"schemaFieldId": fids.tagFID, "value": "", "type": "Tag"},
		{"schemaFieldId": fids.checkFid, "value": "", "type": "Checkbox"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "", "type": "GeometryEditor"},
	})
	fields = r2.Path("$.data.updateItem.item.fields[:].value").Raw().([]any)
	assert.Equal(t, []any{
		nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil,
	}, fields)

	iid2, _ := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "", "type": "MarkdownText"},
		{"schemaFieldId": fids.assetFId, "value": "", "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": "", "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": "", "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "", "type": "URL"},
		{"schemaFieldId": fids.dateFId, "value": "", "type": "Date"},
		{"schemaFieldId": fids.tagFID, "value": "", "type": "Tag"},
		{"schemaFieldId": fids.checkFid, "value": "", "type": "Checkbox"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "", "type": "GeometryEditor"},
	})
	_, r3 := getItem(e, iid2)
	fields2 := r3.Path("$.data.node.fields[:].value").Raw().([]any)
	assert.Equal(t, []any{
		nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil,
	}, fields2)

}

func TestOneWayReferenceFields(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	m1Id, _ := createModel(e, pId, "test1", "test1", "test-1")

	m1fids := createFieldOfEachType(t, e, m1Id)

	s1Id, _, _ := getModel(e, m1Id)

	m2Id, _ := createModel(e, pId, "test2", "test2", "test-2")

	m2fids := createFieldOfEachType(t, e, m2Id)

	s2Id, _, _ := getModel(e, m2Id)

	m2refFId, _ := createField(e, m2Id, "ref", "ref", "ref",
		false, false, false, false, "Reference",
		map[string]any{
			"reference": map[string]any{
				"modelId":            m1Id,
				"schemaId":           s1Id,
				"correspondingField": nil,
			},
		})

	m1i1id, _ := createItem(e, m1Id, s1Id, nil, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "test1", "type": "Text"},
	})

	m2i1id, _ := createItem(e, m2Id, s2Id, nil, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	m2i1ver, _ /*res*/ := getItem(e, m2i1id)
	// test skipped cause of: "Filters are not (yet) implemented" error
	// res.Path(fmt.Sprintf("$.data.node.fields[?(@.schemaFieldId == '%s')].value", m1i1id)).Array().IsEqual([]string{m1i1id})

	deleteItem(e, m1i1id)

	updateItem(e, m2i1id, m2i1ver, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test edited", "type": "Text"},
	})

	_, _ /*res*/ = getItem(e, m2i1id)
	// test skipped cause of: "Filters are not (yet) implemented" error
	// res.Path(fmt.Sprintf("$.data.node.fields[?(@.schemaFieldId == '%s')].value", m2fids.textFId)).Array().IsEqual([]any{"test edited"})

	deleteItem(e, m2i1id)
}

func TestTwoWayReferenceFields(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	m1Id, _ := createModel(e, pId, "test1", "test1", "test-1")

	m1fids := createFieldOfEachType(t, e, m1Id)

	s1Id, _, _ := getModel(e, m1Id)

	m2Id, _ := createModel(e, pId, "test2", "test2", "test-2")

	m2fids := createFieldOfEachType(t, e, m2Id)

	s2Id, _, _ := getModel(e, m2Id)

	m2refFId, _ := createField(e, m2Id, "ref", "ref", "ref",
		false, false, false, false, "Reference",
		map[string]any{
			"reference": map[string]any{
				"modelId":  m1Id,
				"schemaId": s1Id,
				"correspondingField": map[string]any{
					"title":       "Ref to test 1",
					"key":         "test-1-ref",
					"description": "",
					"required":    false,
				},
			},
		})

	m1i1id, _ := createItem(e, m1Id, s1Id, nil, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "test1", "type": "Text"},
	})

	m2i1id, _ := createItem(e, m2Id, s2Id, nil, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res := getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	refs := res.Path("$.data.node.referencedItems[:].id").Raw().([]any)
	assert.Equal(t, []any{m2i1id}, refs)
	m2i1ver, res := getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})

	m1i2id, _ := createItem(e, m1Id, s1Id, nil, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "test2", "type": "Text"},
	})

	m2i2id, _ := createItem(e, m2Id, s2Id, nil, []map[string]any{
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

	m1i1id, _ = createItem(e, m1Id, s1Id, nil, []map[string]any{
		{"schemaFieldId": m1fids.textFId, "value": "M1-I1", "type": "Text"},
	})

	m2i1id, _ = createItem(e, m2Id, s2Id, nil, []map[string]any{
		{"schemaFieldId": m2fids.textFId, "value": "M2-I1", "type": "Text"},
		{"schemaFieldId": m2refFId, "value": m1i1id, "type": "Reference"},
	})

	_, res = getItem(e, m1i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m2i1id})
	_, res = getItem(e, m2i1id)
	res.Path("$.data.node.fields[-1:].value").Array().IsEqual([]string{m1i1id})

	m2i2id, _ = createItem(e, m2Id, s2Id, nil, []map[string]any{
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

func TestSearchItem(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// region init
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fids := createFieldOfEachType(t, e, mId)
	mfids := createMetaFieldOfEachType(t, e, mId)

	sId, msID, res := getModel(e, mId)
	tagIds := res.Path("$.data.node.metadataSchema.fields[:].typeProperty.tags[:].id").Raw().([]any)

	mi1Id, _ := createItem(e, mId, msID, nil, []map[string]any{
		{"schemaFieldId": mfids.tagFId, "value": tagIds[0], "type": "Tag"},
		{"schemaFieldId": mfids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": mfids.checkboxFId, "value": true, "type": "Checkbox"},
		{"schemaFieldId": mfids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": mfids.urlFId, "value": "https://www.test1.com", "type": "URL"},
		{"schemaFieldId": mfids.dateFId, "value": "2023-01-01T00:00:00.000Z", "type": "Date"},
	})

	i1Id, r1 := createItem(e, mId, sId, &mi1Id, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test1", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test1", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s1", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 1, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.test1.com", "type": "URL"},
		{"schemaFieldId": fids.dateFId, "value": "2023-01-01T00:00:00.000Z", "type": "Date"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryEditor"},
	})
	r1.Path("$.data.createItem.item.isMetadata").IsEqual(false)

	i1ver, _ := getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1 updated", "type": "Text"},
	})

	mi2Id, r2 := createItem(e, mId, msID, nil, []map[string]any{
		{"schemaFieldId": mfids.tagFId, "value": tagIds[2], "type": "Tag"},
		{"schemaFieldId": mfids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": mfids.checkboxFId, "value": true, "type": "Checkbox"},
		{"schemaFieldId": mfids.textFId, "value": "test2", "type": "Text"},
		{"schemaFieldId": mfids.urlFId, "value": "https://www.test2.com", "type": "URL"},
		{"schemaFieldId": mfids.dateFId, "value": "2023-01-02T00:00:00.000Z", "type": "Date"},
	})
	r2.Path("$.data.createItem.item.isMetadata").IsEqual(true)
	i2Id, _ := createItem(e, mId, sId, &mi2Id, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test2", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test2", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test2", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": false, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s2", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 2, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.test2.com", "type": "URL"},
		{"schemaFieldId": fids.dateFId, "value": "2023-01-02T00:00:00.000Z", "type": "Date"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\n\t\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}", "type": "GeometryEditor"},
	})
	// endregion

	// region search by id
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       i1Id,
	}, nil, nil, map[string]any{
		"first": 10,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       i2Id,
	}, nil, nil, map[string]any{
		"first": 10,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})
	// endregion

	// region fetch by schema
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, nil, nil, map[string]any{
		"first": 10,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region fetch by schema with sort
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, map[string]any{
		"field": map[string]any{
			"id":   nil,
			"type": "ID",
		},
		"direction": "DESC",
	}, nil, map[string]any{
		"first": 2,
	},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id, i1Id})

	// fetch by schema with sort
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, map[string]any{
		"field": map[string]any{
			"id":   fids.textFId,
			"type": "FIELD",
		},
		"direction": "DESC",
	}, nil, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id, i1Id})
	// endregion

	// region fetch by model
	// res = SearchItem(e, map[string]any{
	// 	"project": pId,
	// 	"model":   mId1,
	// }, nil, nil, map[string]any{
	// 	"first": 2,
	// })
	//
	// res.Path("$.data.searchItem.totalCount").Number().IsEqual(3)
	// res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, mi1Id, i2Id})
	//
	// // fetch by model with search
	// res = SearchItem(e, map[string]any{
	// 	"project": pId,
	// 	"model":   mId1,
	// 	"schema":  sId,
	// 	"q":       "updated",
	// }, nil, nil, map[string]any{
	// 	"first": 2,
	// })
	//
	// res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	// res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filter basic
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "EQUALS",
				"value":    "test1 updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "NOT_EQUALS",
				"value":    "test1 updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	// user
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_USER",
				},
				"operator": "EQUALS",
				"value":    uId1.String(),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_USER",
				},
				"operator": "NOT_EQUALS",
				"value":    uId1.String(),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(0)
	res.Path("$.data.searchItem.nodes").Array().IsEmpty()

	// date
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_DATE",
				},
				"operator": "EQUALS",
				"value":    time.Now(),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_DATE",
				},
				"operator": "NOT_EQUALS",
				"value":    time.Now(),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(0)
	res.Path("$.data.searchItem.nodes").Array().IsEmpty()
	// endregion

	// region filter nullable
	i1ver, _ = getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "", "type": "Text"},
	})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"nullable": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "EMPTY",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"nullable": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "NOT_EMPTY",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	i1ver, _ = getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1 updated", "type": "Text"},
	})
	// endregion

	// region filters number
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.integerFId,
					"type": "FIELD",
				},
				"operator": "LESS_THAN",
				"value":    2,
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.integerFId,
					"type": "FIELD",
				},
				"operator": "LESS_THAN_OR_EQUAL_TO",
				"value":    2,
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.integerFId,
					"type": "FIELD",
				},
				"operator": "GREATER_THAN",
				"value":    1,
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.integerFId,
					"type": "FIELD",
				},
				"operator": "GREATER_THAN_OR_EQUAL_TO",
				"value":    1,
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters text
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "CONTAINS",
				"value":    "updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "NOT_CONTAINS",
				"value":    "updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "STARTS_WITH",
				"value":    "test",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "NOT_STARTS_WITH",
				"value":    "test",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(0)
	res.Path("$.data.searchItem.nodes").Array().IsEmpty()

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "ENDS_WITH",
				"value":    "updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.textFId,
					"type": "FIELD",
				},
				"operator": "NOT_ENDS_WITH",
				"value":    "updated",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})
	// endregion

	// region filters boolean
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	}, nil, map[string]any{
		"bool": map[string]any{
			"fieldId": map[string]any{
				"id":   fids.boolFId,
				"type": "FIELD",
			},
			"operator": "EQUALS",
			"value":    false,
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	}, nil, map[string]any{
		"bool": map[string]any{
			"fieldId": map[string]any{
				"id":   fids.boolFId,
				"type": "FIELD",
			},
			"operator": "NOT_EQUALS",
			"value":    false,
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filters select
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, nil, map[string]any{
		"multiple": map[string]any{
			"fieldId": map[string]any{
				"id":   fids.selectFId,
				"type": "FIELD",
			},
			"operator": "INCLUDES_ANY",
			"value":    []string{"s1", "s2", "s3"},
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, nil, map[string]any{
		"multiple": map[string]any{
			"fieldId": map[string]any{
				"id":   fids.selectFId,
				"type": "FIELD",
			},
			"operator": "INCLUDES_ANY",
			"value":    []string{"s1", "s3"},
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
	}, nil, map[string]any{
		"multiple": map[string]any{
			"fieldId": map[string]any{
				"id":   fids.selectFId,
				"type": "FIELD",
			},
			"operator": "NOT_INCLUDES_ANY",
			"value":    []string{"s1", "s2", "s3"},
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(0)
	res.Path("$.data.searchItem.nodes").Array().IsEmpty()
	// endregion

	// region filters and
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       "",
	}, nil, map[string]any{
		"and": map[string]any{
			"conditions": []map[string]any{
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"id":   fids.textFId,
							"type": "FIELD",
						},
						"operator": "STARTS_WITH",
						"value":    "test",
					},
				},
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"id":   fids.textFId,
							"type": "FIELD",
						},
						"operator": "ENDS_WITH",
						"value":    "updated",
					},
				},
			},
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filters or
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       "",
	}, nil, map[string]any{
		"or": map[string]any{
			"conditions": []map[string]any{
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"id":   fids.textFId,
							"type": "FIELD",
						},
						"operator": "STARTS_WITH",
						"value":    "test1",
					},
				},
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"id":   fids.textFId,
							"type": "FIELD",
						},
						"operator": "STARTS_WITH",
						"value":    "test2",
					},
				},
			},
		},
	}, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters date
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.dateFId,
					"type": "FIELD",
				},
				"operator": "AFTER",
				"value":    "2023-01-01T00:00:00.000Z",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i2Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   fids.dateFId,
					"type": "FIELD",
				},
				"operator": "EQUALS",
				"value":    "2023-01-01T00:00:00.000Z",
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_DATE",
				},
				"operator": "AFTER",
				"value":    time.Now().Format(time.RFC3339),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(0)
	res.Path("$.data.searchItem.nodes").Array().IsEmpty()

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"id":   nil,
					"type": "CREATION_DATE",
				},
				"operator": "AFTER",
				"value":    time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters Metadata tags
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"schema":  sId,
		"q":       nil,
	},
		nil,
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"id":   mfids.tagFId,
					"type": "META_FIELD",
				},
				"operator": "EQUALS",
				"value":    tagIds[0],
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})
	// endregion
}
