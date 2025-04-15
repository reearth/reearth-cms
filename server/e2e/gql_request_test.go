package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/samber/lo"
)

func createRequest(e *httpexpect.Expect, projectId, title string, description, state *string, reviewersId []string, items []any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation CreateRequest($projectId: ID!, $title: String!, $description: String, $state: RequestState, $reviewersId: [ID!], $items: [RequestItemInput!]!) {
    createRequest(
      input: {projectId: $projectId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items}
    ) {
      request {
				id
				items {
					itemId
					version
					ref
				}
				title
				description
				createdBy {
					id
					name
					email
				}
				workspaceId
				projectId
				threadId
				reviewersId
				state
				createdAt
				updatedAt
				approvedAt
				closedAt
			}
		}		
  }`,
		Variables: map[string]any{
			"projectId":   projectId,
			"title":       title,
			"description": description,
			"state":       state,
			"reviewersId": reviewersId,
			"items":       items,
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

func updateRequest(e *httpexpect.Expect, requestId, title string, description, state *string, reviewersId []string, items []any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateRequest($requestId: ID!,$title: String,$description: String,$state: RequestState,$reviewersId: [ID!],$items: [RequestItemInput!]) {
    updateRequest(
      input: {
        requestId: $requestId,
        title: $title,
        description: $description,
        state: $state,
        reviewersId: $reviewersId,
        items: $items,
      }
    ) {
      request {
				id
				items {
					itemId
					version
					ref
				}
				title
				description
				createdBy {
					id
					name
					email
				}
				workspaceId
				projectId
				threadId
				reviewersId
				state
				createdAt
				updatedAt
				approvedAt
				closedAt
      }
    }
  }
`,
		Variables: map[string]any{
			"requestId":   requestId,
			"title":       title,
			"description": description,
			"state":       state,
			"reviewersId": reviewersId,
			"items":       items,
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

func approveRequest(e *httpexpect.Expect, requestId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation ApproveRequest($requestId: ID!) {
    approveRequest(input: { requestId: $requestId }) {
      request {
				id
				state
      }
    }
  }
`,
		Variables: map[string]any{
			"requestId": requestId,
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

func closeAllRequests(e *httpexpect.Expect, projectId string, requestsId []string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation DeleteRequest($projectId: ID!, $requestsId: [ID!]!) {
    deleteRequest(input: { projectId: $projectId, requestsId: $requestsId }) {
      requests
    }
  }

`,
		Variables: map[string]any{
			"projectId":  projectId,
			"requestsId": requestsId,
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

func TestCreateRequest(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fid, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)
	iid1, i1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fid, "value": "test", "type": "Text"},
	})
	ver1 := i1.Path("$.data.createItem.item.version").Raw().(string)

	res := createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("DRAFT"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver1}})
	req := res.Path("$.data.createRequest.request").Object()

	req.Value("title").IsEqual("test")
	req.Value("description").IsEqual("test")
	req.Value("state").IsEqual("DRAFT")
	req.Value("reviewersId").IsEqual([]string{uId1.String()})
	req.Value("items").IsEqual([]any{map[string]any{"itemId": iid1, "ref": nil, "version": ver1}})
}

func TestUpdateRequest(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fid, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)
	iid1, i1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fid, "value": "test", "type": "Text"},
	})
	ver1 := i1.Path("$.data.createItem.item.version").Raw().(string)

	res := createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("DRAFT"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver1}})
	req := res.Path("$.data.createRequest.request").Object()
	rid := req.Value("id").String().Raw()

	iid2 := item.NewID().String()
	ver2 := uuid.New().String()
	res2 := updateRequest(e, rid, "test2", lo.ToPtr("test2"), lo.ToPtr("WAITING"), []string{uId1.String(), uId4.String()}, []any{map[string]any{"itemId": iid1, "version": ver1}, map[string]any{"itemId": iid2, "version": ver2}})
	req2 := res2.Path("$.data.updateRequest.request").Object()

	req2.Value("title").IsEqual("test2")
	req2.Value("description").IsEqual("test2")
	req2.Value("state").IsEqual("WAITING")
	req2.Value("reviewersId").IsEqual([]string{uId1.String(), uId4.String()})
	req2.Value("items").Array().Length().IsEqual(2)
	req2.Value("items").IsEqual([]any{map[string]any{"itemId": iid1, "ref": nil, "version": ver1}, map[string]any{"itemId": iid2, "ref": nil, "version": ver2}})
}

func TestApproveRequest(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fid, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)
	iid1, i1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fid, "value": "test", "type": "Text"},
	})
	ver1 := i1.Path("$.data.createItem.item.version").Raw().(string)

	res := createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("WAITING"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver1}})
	req := res.Path("$.data.createRequest.request").Object()
	rid := req.Value("id").String().Raw()

	res2 := approveRequest(e, rid)
	req2 := res2.Path("$.data.approveRequest.request").Object()
	req2.Value("id").IsEqual(rid)
	req2.Value("state").IsEqual("APPROVED")

	_, itm_public := getItem(e, iid1)
	itm_public.Path("$.data.node").Object().Value("version").IsEqual(ver1)
	itm_public.Path("$.data.node").Object().Value("status").IsEqual("PUBLIC")
}

func TestCloseRequest(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fid, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)
	iid1, i1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fid, "value": "test", "type": "Text"},
	})
	ver1 := i1.Path("$.data.createItem.item.version").Raw().(string)

	res := createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("DRAFT"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver1}})
	req := res.Path("$.data.createRequest.request").Object()
	rid := req.Value("id").String().Raw()

	res2 := closeAllRequests(e, pId, []string{rid})
	res2.Path("$.data.deleteRequest.requests").Array().Value(0).IsEqual(rid)

	_, itm_closed := getItem(e, iid1)
	itm_closed.Path("$.data.node").Object().Value("version").IsEqual(ver1)
}

func TestRequestFlow(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// 1- create public project
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	updateProject(e, pId, "test", "test", "test-1", "PUBLIC", true)

	// 2- create public model
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	updateModel(e, mId, lo.ToPtr("test"), lo.ToPtr("test"), lo.ToPtr("test-1"), true)

	fid, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)

	// 3- create item with version 1
	iid1, i1 := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fid, "value": "v1", "type": "Text"},
	})
	ver1 := i1.Path("$.data.createItem.item.version").Raw().(string)

	// 4- update item to version 2
	iid1, i1 = updateItem(e, iid1, ver1, []map[string]any{
		{"schemaFieldId": fid, "value": "v2", "type": "Text"},
	})
	ver2 := i1.Path("$.data.updateItem.item.version").Raw().(string)

	// check public item: should return no results
	res := e.GET("/api/p/{project}/{model}", "test-1", "test-1").
		Expect().
		Status(http.StatusOK).
		JSON()
	res.IsEqual(map[string]any{
		"results":    []map[string]any{},
		"totalCount": 0,
		"hasMore":    false,
		"limit":      50,
		"offset":     0,
		"page":       1,
	})

	// 5- create request with version 2
	res = createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("WAITING"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver2}})
	req := res.Path("$.data.createRequest.request").Object()
	rid := req.Value("id").String().Raw()

	// 6- update item to version 3
	iid1, i1 = updateItem(e, iid1, ver2, []map[string]any{
		{"schemaFieldId": fid, "value": "v3", "type": "Text"},
	})
	ver3 := i1.Path("$.data.updateItem.item.version").Raw().(string)

	// 7- approve request
	res = approveRequest(e, rid)
	req = res.Path("$.data.approveRequest.request").Object()
	req.Value("id").IsEqual(rid)
	req.Value("state").IsEqual("APPROVED")

	// check item and its status
	_, itm := getItem(e, iid1)
	itm.Path("$.data.node").Object().Value("version").IsEqual(ver3)
	itm.Path("$.data.node").Object().Value("status").IsEqual("PUBLIC_DRAFT")

	// check public item: should return version 2
	res = e.GET("/api/p/{project}/{model}", "test-1", "test-1").
		Expect().
		Status(http.StatusOK).
		JSON()
	res.IsEqual(map[string]any{
		"results": []map[string]any{
			{
				"id":   iid1,
				"text": "v2",
			},
		},
		"totalCount": 1,
		"hasMore":    false,
		"limit":      50,
		"offset":     0,
		"page":       1,
	})

	// 8- create request with version 3
	res = createRequest(e, pId, "test", lo.ToPtr("test"), lo.ToPtr("WAITING"), []string{uId1.String()}, []any{map[string]any{"itemId": iid1, "version": ver3}})
	req = res.Path("$.data.createRequest.request").Object()
	rid = req.Value("id").String().Raw()

	// check item and its status
	_, itm = getItem(e, iid1)
	itm.Path("$.data.node").Object().Value("version").IsEqual(ver3)
	itm.Path("$.data.node").Object().Value("status").IsEqual("PUBLIC_REVIEW")

	// 9- approve request
	res = approveRequest(e, rid)
	req = res.Path("$.data.approveRequest.request").Object()
	req.Value("id").IsEqual(rid)
	req.Value("state").IsEqual("APPROVED")

	// check item and its status
	_, itm = getItem(e, iid1)
	itm.Path("$.data.node").Object().Value("version").IsEqual(ver3)
	itm.Path("$.data.node").Object().Value("status").IsEqual("PUBLIC")

	// check public item: should return version 3
	res = e.GET("/api/p/{project}/{model}", "test-1", "test-1").
		Expect().
		Status(http.StatusOK).
		JSON()
	res.IsEqual(map[string]any{
		"results": []map[string]any{
			{
				"id":   iid1,
				"text": "v3",
			},
		},
		"totalCount": 1,
		"hasMore":    false,
		"limit":      50,
		"offset":     0,
		"page":       1,
	})
}
