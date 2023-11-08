package e2e

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var (
	secret = "secret_1234567890"
	uId    = accountdomain.NewUserID()
	iId    = id.NewIntegrationID()
	mId    = id.NewModelID()
	mId2   = id.NewModelID()
	aid    = id.NewAssetID()
	auuid  = uuid.NewString()
	itmId  = id.NewItemID()
	itmId2 = id.NewItemID()
	fId    = id.NewFieldID()
	fId2   = id.NewFieldID()
	fId3   = id.NewFieldID()
	thId   = id.NewThreadID()
	thId2  = id.NewThreadID()
	icId   = id.NewCommentID()
	ikey   = key.Random()
	ikey2  = key.Random()
	pid    = id.NewProjectID()
	sid    = id.NewSchemaID()
	sid2   = id.NewSchemaID()
	palias = "PROJECT_ALIAS"
	sfKey  = key.Random()
	sfKey2 = id.NewKey("asset")
	sfKey3 = key.Random()

	now = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)
)

func baseSeeder(ctx context.Context, r *repo.Container) error {
	defer util.MockNow(now)()

	u := user.New().ID(uId).
		Name("e2e").
		Email("e2e@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}

	i := integration.New().ID(iId).
		Type(integration.TypePublic).
		Name("i1").
		Description("i1 desc").
		LogoUrl(lo.Must(url.Parse("https://test.com"))).
		Token(secret).
		Developer(accountdomain.NewUserID()).
		MustBuild()
	if err := r.Integration.Save(ctx, i); err != nil {
		return err
	}

	iid, err := accountdomain.IntegrationIDFrom(i.ID().String())
	if err != nil {
		return err
	}

	w := workspace.New().NewID().
		Name("e2e").
		Personal(false).
		Members(map[accountdomain.UserID]workspace.Member{uId: {Role: workspace.RoleOwner, InvitedBy: u.ID()}}).
		Integrations(map[workspace.IntegrationID]workspace.Member{iid: {Role: workspace.RoleOwner, InvitedBy: u.ID()}}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	p := project.New().ID(pid).
		Name("p1").
		Description("p1 desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		Alias(palias).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	sf := schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId).Key(sfKey).MustBuild()
	sf2 := schema.NewField(schema.NewAsset().TypeProperty()).ID(fId2).Key(sfKey2).MustBuild()
	sf3 := schema.NewField(schema.NewReference(mId, nil, nil, nil).TypeProperty()).ID(fId3).Key(sfKey3).MustBuild()
	s := schema.New().ID(sid).
		Workspace(w.ID()).
		Project(p.ID()).
		Fields([]*schema.Field{sf, sf2}).
		TitleField(sf.ID().Ref()).
		MustBuild()
	if err := r.Schema.Save(ctx, s); err != nil {
		return err
	}
	s2 := schema.New().ID(sid2).
		Workspace(w.ID()).
		Project(p.ID()).
		Fields([]*schema.Field{sf3}).
		MustBuild()
	if err := r.Schema.Save(ctx, s2); err != nil {
		return err
	}

	m := model.New().
		ID(mId).
		Name("m1").
		Description("m1 desc").
		Public(true).
		Key(ikey).
		Project(p.ID()).
		Schema(s.ID()).
		MustBuild()
	if err := r.Model.Save(ctx, m); err != nil {
		return err
	}

	m2 := model.New().
		ID(mId2).
		Name("m2").
		Description("m2 desc").
		Public(true).
		Key(ikey2).
		Project(p.ID()).
		Schema(s2.ID()).
		MustBuild()
	if err := r.Model.Save(ctx, m2); err != nil {
		return err
	}

	itm := item.New().ID(itmId).
		Schema(s.ID()).
		Model(m.ID()).
		Project(p.ID()).
		Thread(thId).
		Fields([]*item.Field{
			item.NewField(fId2, value.TypeAsset.Value(aid).AsMultiple(), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm); err != nil {
		return err
	}

	itm2 := item.New().ID(itmId2).
		Schema(s2.ID()).
		Model(m2.ID()).
		Project(p.ID()).
		Thread(thId2).
		Fields([]*item.Field{
			item.NewField(fId3, value.TypeReference.Value(itmId).AsMultiple(), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm2); err != nil {
		return err
	}

	cmt := thread.NewComment(icId, operator.OperatorFromUser(u.ID()), "test comment")
	th := thread.New().ID(thId).Workspace(w.ID()).Comments([]*thread.Comment{cmt}).MustBuild()
	if err := r.Thread.Save(ctx, th); err != nil {
		return err
	}

	f := asset.NewFile().Name("aaa.jpg").Size(1000).ContentType("image/jpg").Build()
	a := asset.New().ID(aid).
		Project(p.ID()).
		CreatedByUser(u.ID()).
		FileName("aaa.jpg").
		Size(1000).
		UUID(auuid).
		Thread(thId).
		MustBuild()

	if err := r.Asset.Save(ctx, a); err != nil {
		return err
	}

	if err := r.AssetFile.Save(ctx, a.ID(), f); err != nil {
		return err
	}

	return nil
}

// GET /models/{modelId}/items
func TestIntegrationItemListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/models/{modelId}/items", id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}/items", id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}/items", id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}/items", id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := e.GET("/api/models/{modelId}/items", mId).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a := obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), false)

	// asset embeded
	obj = e.GET("/api/models/{modelId}/items", mId).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		WithQuery("asset", "true").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), true)

	// key cannot be used
	e.GET("/api/models/{modelId}/items", ikey).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusBadRequest)

	r2 := e.POST("/api/models/{modelId}/items", mId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r2.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId3.String(),
				"type":  "reference",
				"value": itmId.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId.String()
	raw["modelId"] = mId.String()
}

// POST /models/{modelId}/items
func TestIntegrationCreateItemAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST("/api/models/{modelId}/items", id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/models/{modelId}/items", id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/models/{modelId}/items", id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/models/%s/items", id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	e.POST("/api/models/{modelId}/items", ikey).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	r := e.POST("/api/models/{modelId}/items", mId).
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
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	r.Value("fields").IsEqual([]any{
		map[string]string{
			"id":    fId.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey.String(),
		},
	})
	r.Value("modelId").IsEqual(mId.String())
	r.Value("refs").IsEqual([]string{"latest"})

	e.POST("/api/models/{modelId}/items", mId).
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
		IsEqual([]any{
			map[string]string{
				"id":    fId.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey.String(),
			},
		})

	r2 := e.POST("/api/models/{modelId}/items", mId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r2.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId3.String(),
				"type":  "reference",
				"value": itmId.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId.String()
	raw["modelId"] = mId.String()
}

// PATCH /items/{itemId}
func TestIntegrationUpdateItemAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.PATCH("/api/items/{itemId}", id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH("/api/items/{itemId}", id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH("/api/items/{itemId}", id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	r := e.PATCH("/api/items/{itemId}", itmId).
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
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	r.Value("fields").IsEqual([]interface{}{
		map[string]string{
			"id":    fId2.String(),
			"key":   "asset",
			"type":  "asset",
			"value": aid.String(),
		},
		map[string]string{
			"id":    fId.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey.String(),
		},
	})
	r.Value("modelId").IsEqual(mId.String())
	r.Value("refs").IsEqual([]string{"latest"})

	e.PATCH("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId2.String(),
					"key":   "asset",
					"type":  "asset",
					"value": aid.String(),
				},
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
		IsEqual([]any{
			map[string]string{
				"id":    fId2.String(),
				"key":   "asset",
				"type":  "asset",
				"value": aid.String(),
			},
			map[string]string{
				"id":    fId.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey.String(),
			},
		})

	r2 := e.POST("/api/models/{modelId}/items", mId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r2.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId3.String(),
				"type":  "reference",
				"value": itmId.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId.String()
	raw["modelId"] = mId.String()
}

// GET /items/{itemId}
func TestIntegrationGetItemAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/items/{itemId}", id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}", id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}", id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}", id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")

	r2 := e.POST("/api/models/{modelId}/items", mId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r2.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId3.String(),
				"type":  "reference",
				"value": itmId.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId.String()
	raw["modelId"] = mId.String()
}

// DELETE /items/{itemId}
func TestIntegrationDeleteItemAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")

	e.DELETE("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	e.GET("/api/items/{itemId}", itmId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func assertItem(v *httpexpect.Value, assetEmbeded bool) {
	o := v.Object()
	o.Value("id").IsEqual(itmId.String())
	if assetEmbeded {
		a := o.Value("fields").Array()
		a.Length().IsEqual(1)
		a.Value(0).Object().Value("value").Object().
			HasValue("id", aid.String()).
			NotContainsKey("contentType").
			NotContainsKey("file").
			NotContainsKey("name").
			HasValue("previewType", "unknown").
			HasValue("projectId", pid.String()).
			HasValue("totalSize", 1000).
			HasValue("url", fmt.Sprintf("https://example.com/assets/%s/%s/aaa.jpg", auuid[0:2], auuid[2:]))
	} else {
		o.Value("fields").IsEqual([]map[string]any{
			{
				"id":    fId2.String(),
				"key":   "asset",
				"type":  "asset",
				"value": aid.String(),
			},
		})
	}
	o.Value("parents").IsEqual([]any{})
	o.Value("refs").IsEqual([]string{"latest"})
}
