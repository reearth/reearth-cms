package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

func iAPIItemCommentsList(e *httpexpect.Expect, itemId interface{}) *httpexpect.Request {
	endpoint := "/api/items/{itemId}/comments"
	return e.GET(endpoint, itemId)
}

func iAPIItemCommentCreate(e *httpexpect.Expect, itemId interface{}) *httpexpect.Request {
	endpoint := "/api/items/{itemId}/comments"
	return e.POST(endpoint, itemId)
}

func iAPIItemCommentUpdate(e *httpexpect.Expect, itemId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/items/{itemId}/comments/{commentId}"
	return e.PATCH(endpoint, itemId, commentId)
}

func iAPIItemCommentDelete(e *httpexpect.Expect, itemId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/items/{itemId}/comments/{commentId}"
	return e.DELETE(endpoint, itemId, commentId)
}

// Get|/items/{itemId}/comments
func TestIntegrationItemCommentListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIItemCommentsList(e, id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentsList(e, id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentsList(e, id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentsList(e, id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIItemCommentsList(e, itmId1).
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

	iAPIItemCommentCreate(e, id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentCreate(e, id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	c := iAPIItemCommentCreate(e, itmId1).
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
	iAPIItemCommentCreate(e, itmId7).
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

	iAPIItemCommentUpdate(e, id.NewItemID(), id.NewCommentID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentUpdate(e, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIItemCommentUpdate(e, itmId1, icId).
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

	iAPIItemCommentDelete(e, id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIItemCommentDelete(e, itmId1, icId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	iAPIItemCommentsList(e, itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("comments").Array().IsEmpty()
}
