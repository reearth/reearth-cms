package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

func iAPIAssetCommentList(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/comments"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

func iAPIAssetCommentCreate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/comments"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

func iAPIAssetCommentUpdate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/comments/{commentId}"
	return e.PATCH(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId, commentId)
}

func iAPIAssetCommentDelete(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}, commentId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/comments/{commentId}"
	return e.DELETE(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId, commentId)
}

// GET|/assets/{assetId}/comments
func TestIntegrationGetAssetCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetCommentList(e, wId0, pid, id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentList(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentList(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentList(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIAssetCommentList(e, wId0, pid, aid1).
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

	iAPIAssetCommentCreate(e, wId0, pid, id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentCreate(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	c := iAPIAssetCommentCreate(e, wId0, pid, aid1).
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
	iAPIAssetCommentCreate(e, wId0, pid, aid3).
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

	iAPIAssetCommentUpdate(e, wId0, pid, id.NewAssetID(), id.NewCommentID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, wId0, pid, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, wId0, pid, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentUpdate(e, wId0, pid, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIAssetCommentUpdate(e, wId0, pid, aid1, icId).
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

	iAPIAssetCommentDelete(e, wId0, pid, id.NewAssetID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCommentDelete(e, wId0, pid, aid1, icId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	iAPIAssetCommentList(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("comments").Array().IsEmpty()
}
