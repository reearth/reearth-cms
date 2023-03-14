package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items
func TestIntegrationItemListWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, mId).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	obj.Value("page").Equal(1)
	obj.Value("perPage").Equal(5)
	obj.Value("totalCount").Equal(1)

	a := obj.Value("items").Array()
	a.Length().Equal(1)
	assertItem(a.First(), false)

	// model key can be also usable
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		ValueEqual("page", 1).
		ValueEqual("perPage", 5).
		ValueEqual("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().Equal(1)
	assertItem(a.First(), false)

	// project alias can be also usable
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", palias, ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		ValueEqual("page", 1).
		ValueEqual("perPage", 5).
		ValueEqual("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().Equal(1)
	assertItem(a.First(), false)

	// asset embeded
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, mId).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		WithQuery("asset", "true").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		ValueEqual("page", 1).
		ValueEqual("perPage", 5).
		ValueEqual("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().Equal(1)
	assertItem(a.First(), true)

	// invalid key
	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, "xxx").
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	// invalid project
	e.GET("/api/projects/{projectId}/models/{modelId}/items", id.NewProjectID(), ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)
}

// POST /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items
func TestIntegrationCreateItemWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	r := e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId.String(),
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		Contains("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	r.Value("fields").Equal([]any{
		map[string]string{
			"id":    fId.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey.String(),
		},
	})
	r.Value("modelId").Equal(mId.String())
	r.Value("refs").Equal([]string{"latest"})

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey.String(),
					"value": "test value 2",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("fields").
		Equal([]any{
			map[string]string{
				"id":    fId.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey.String(),
			},
		})
}
