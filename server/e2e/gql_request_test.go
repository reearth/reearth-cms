package e2e

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/item"
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

func TestRequest(t *testing.T) {
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
	ver := i1.Path("$.data.createItem.item.version").Raw().(string)

	// Create request
	title := "test"
	description := "test"
	state := "DRAFT"
	reviewersId := []string{uId1.String()}
	itm1 := map[string]any{"itemId": iid1, "version": ver}
	items := []any{itm1}

	res := createRequest(e, pId, title, &description, &state, reviewersId, items)
	req := res.Path("$.data.createRequest.request").Object()
	rid := req.Value("id").String().Raw()

	req.Value("title").IsEqual(title)
	req.Value("description").IsEqual(description)
	req.Value("state").IsEqual(state)
	req.Value("reviewersId").IsEqual(reviewersId)

	req.Value("items").IsEqual([]any{map[string]any{"itemId": iid1, "ref": nil,  "version": ver}})

	// Update request
	title2 := "test2"
	description2 := "test2"
	state2 := "WAITING"
	reviewersId2 := []string{uId1.String(), uId4.String()}
	iid2 := item.NewID().String()
	ver2 := uuid.New().String()
	items2 := []any{itm1, map[string]any{"itemId": iid2, "version": ver2}}
	res2 := updateRequest(e, rid, title2, &description2, &state2, reviewersId2, items2)
	req2 := res2.Path("$.data.updateRequest.request").Object()

	req2.Value("title").IsEqual(title2)
	req2.Value("description").IsEqual(description2)
	req2.Value("state").IsEqual(state2)
	req2.Value("reviewersId").IsEqual(reviewersId2)
	req2.Value("items").Array().Length().IsEqual(2)
	req2.Value("items").IsEqual([]any{map[string]any{"itemId": iid1, "ref": nil,  "version": ver},map[string]any{"itemId": iid2, "ref": nil,  "version": ver2}})

	// Approve
	res3 := approveRequest(e, rid)
	req3 := res3.Path("$.data.approveRequest.request").Object()
	req3.Value("state").IsEqual("APPROVED")
	fmt.Println(req3)

	// Close All
	res4 := closeAllRequests(e, pId, []string{rid})
	req4 := res4.Path("$.data.deleteRequest.requests").Array()
	req4.Value(0).IsEqual(rid)
}
