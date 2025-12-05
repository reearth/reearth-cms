package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

func iAPIItemCommentList(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}, itemId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items/{itemId}/comments"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey, itemId)
}

func iAPIItemCommentCreate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}, itemId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items/{itemId}/comments"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey, itemId)
}

func iAPIItemCommentUpdate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}, itemId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items/{itemId}/comments/{commentId}"
	return e.PATCH(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey, itemId, commentId)
}

func iAPIItemCommentDelete(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}, itemId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items/{itemId}/comments/{commentId}"
	return e.DELETE(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey, itemId, commentId)
}

// Get|/items/{itemId}/comments
func TestIntegrationItemCommentListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIItemCommentList(e, wId0, pid, mId1, id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentList(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentList(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentList(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIItemCommentList(e, wId0, pid, mId1, itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().ContainsAll("comments")
	c := r.Value("comments").Array().Value(0).Object()
	c.Value("id").IsEqual(icId.String())
	c.Value("authorId").IsEqual(uId.String())
	c.Value("authorType").IsEqual(integrationapi.User)
	c.Value("content").IsEqual("test comment")
}

// Post|/items/{itemId}/comments
func TestIntegrationCreateItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIItemCommentCreate(e, wId0, pid, mId1, id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, wId0, pid, mId1, id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	c := iAPIItemCommentCreate(e, wId0, pid, mId1, itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "test",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	// c.Value("id").Equal(icId.String())
	c.Value("authorId").IsEqual(iId)
	c.Value("authorType").IsEqual(integrationapi.Integrtaion)
	c.Value("content").IsEqual("test")

	// item with no thread
	iAPIItemCommentCreate(e, wId0, pid, mId1, itmId7).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "test2",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Value("content").IsEqual("test2")
}

// Patch|/items/{itemId}/comments/{commentId}
func TestIntegrationUpdateItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIItemCommentUpdate(e, wId0, pid, mId1, id.NewItemID(), id.NewCommentID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, wId0, pid, mId1, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, wId0, pid, mId1, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, wId0, pid, mId1, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIItemCommentUpdate(e, wId0, pid, mId1, itmId1, icId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "updated content",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		ContainsAll("id", "authorId", "authorType", "content", "createdAt")
	r.Value("id").IsEqual(icId.String())
	r.Value("authorId").IsEqual(uId)
	r.Value("authorType").IsEqual(integrationapi.User)
	r.Value("content").IsEqual("updated content")
}

// Delete|/items/{itemId}/comments/{commentId}
func TestIntegrationDeleteItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIItemCommentDelete(e, wId0, pid, mId1, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentDelete(e, wId0, pid, mId1, itmId1, icId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	iAPIItemCommentList(e, wId0, pid, mId1, itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("comments").Array().IsEmpty()
}
