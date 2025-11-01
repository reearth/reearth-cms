package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

func iAPIAssetCommentsList(e *httpexpect.Expect, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/assets/{assetId}/comments"
	return e.GET(endpoint, assetId)
}

func iAPIAssetCommentCreate(e *httpexpect.Expect, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/assets/{assetId}/comments"
	return e.POST(endpoint, assetId)
}

func iAPIAssetCommentUpdate(e *httpexpect.Expect, assetId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/assets/{assetId}/comments/{commentId}"
	return e.PATCH(endpoint, assetId, commentId)
}

func iAPIAssetCommentDelete(e *httpexpect.Expect, assetId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/assets/{assetId}/comments/{commentId}"
	return e.DELETE(endpoint, assetId, commentId)
}

// GET|/assets/{assetId}/comments
func TestIntegrationGetAssetCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetCommentsList(e, id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentsList(e, id.NewAssetID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentsList(e, id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentsList(e, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIAssetCommentsList(e, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().ContainsAny("comments")
	c := r.Value("comments").Array().Value(0).Object()
	c.Value("id").IsEqual(icId.String())
	c.Value("authorId").IsEqual(uId.String())
	c.Value("authorType").IsEqual(integrationapi.User)
	c.Value("content").IsEqual("test comment")
}

// POST|/assets/{assetId}/comments
func TestIntegrationCreateAssetCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetCommentCreate(e, id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, id.NewAssetID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	c := iAPIAssetCommentCreate(e, aid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "test",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	c.Value("authorId").IsEqual(iId)
	c.Value("authorType").IsEqual(integrationapi.Integrtaion)
	c.Value("content").IsEqual("test")

	// asset with no thread
	iAPIAssetCommentCreate(e, aid3).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "test2",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Value("content").IsEqual("test2")
}

// PATCH|/assets/{assetId}/comments/{commentId}
func TestIntegrationUpdateAssetCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetCommentUpdate(e, id.NewAssetID(), id.NewCommentID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIAssetCommentUpdate(e, aid1, icId).
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

// DELETE|/assets/{assetId}/comments/{commentId}
func TestIntegrationDeleteAssetCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetCommentDelete(e, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentDelete(e, aid1, icId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	iAPIAssetCommentsList(e, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("comments").Array().IsEmpty()
}
