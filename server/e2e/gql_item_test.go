package e2e

import (
	"net/http"
	"testing"
	"time"

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

func TestSearchItem(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	// region init
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fids := createFieldOfEachType(t, e, mId)

	sId, _ := getModel(e, mId)

	i1Id, _ := createItem(e, mId, sId, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test1", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test1", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": true, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s1", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 1, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.test1.com", "type": "URL"},
	})

	i1ver, _ := getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1 updated", "type": "Text"},
	})

	i2Id, _ := createItem(e, mId, sId, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test2", "type": "Text"},
		{"schemaFieldId": fids.textAreaFId, "value": "test2", "type": "TextArea"},
		{"schemaFieldId": fids.markdownFId, "value": "test2", "type": "MarkdownText"},
		// {"schemaFieldId": fids.assetFId, "value": nil, "type": "Asset"},
		{"schemaFieldId": fids.boolFId, "value": false, "type": "Bool"},
		{"schemaFieldId": fids.selectFId, "value": "s2", "type": "Select"},
		{"schemaFieldId": fids.integerFId, "value": 2, "type": "Integer"},
		{"schemaFieldId": fids.urlFId, "value": "https://www.test2.com", "type": "URL"},
	})
	// endregion

	// region fetch by schema
	res := SearchItem(e, map[string]any{
		"project": pId,
		// "schema":  sId,
		"model": mId,
	}, nil, nil, map[string]any{
		"first": 10,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region fetch by schema with sort
	res = SearchItem(e, map[string]any{
		"project": pId,
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
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
	}, nil, nil, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})

	// fetch by model with search
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
		"q":       "updated",
	}, nil, nil, map[string]any{
		"first": 2,
	})

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(1)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filter basic
	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
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
	// endregion

	// region filter nullable
	i1ver, _ = getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "", "type": "Text"},
	})

	res = SearchItem(e, map[string]any{
		"project": pId,
		"model":   mId,
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
				"value":    time.Now().Add(-1 * time.Hour).Format(time.RFC3339),
			},
		},
		map[string]any{
			"first": 2,
		},
	)

	res.Path("$.data.searchItem.totalCount").Number().IsEqual(2)
	res.Path("$.data.searchItem.nodes[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion
}
