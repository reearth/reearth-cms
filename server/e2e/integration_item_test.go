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
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
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
	"github.com/stretchr/testify/assert"
	"golang.org/x/exp/slices"
)

var (
	secret = "secret_1234567890"
	wId0   = accountdomain.NewWorkspaceID()
	uId    = accountdomain.NewUserID()
	iId    = id.NewIntegrationID()
	mId0   = id.NewModelID()
	mId1   = id.NewModelID()
	mId2   = id.NewModelID()
	mId3   = id.NewModelID()
	mId4   = id.NewModelID()
	mId5   = id.NewModelID()
	dvmId  = id.NewModelID()
	aid1   = id.NewAssetID()
	aid2   = id.NewAssetID()
	aid3   = id.NewAssetID() // no thread
	auuid1 = uuid.NewString()
	auuid2 = uuid.NewString()
	itmId1 = id.NewItemID()
	itmId2 = id.NewItemID()
	itmId3 = id.NewItemID()
	itmId4 = id.NewItemID()
	itmId5 = id.NewItemID()
	itmId6 = id.NewItemID()
	itmId7 = id.NewItemID() // no thread
	fId1   = id.NewFieldID()
	fId2   = id.NewFieldID()
	fId3   = id.NewFieldID()
	fId4   = id.NewFieldID()
	fId5   = id.NewFieldID()
	fId6   = id.NewFieldID()
	fId7   = id.NewFieldID()
	fId8   = id.NewFieldID()
	fId9   = id.NewFieldID()
	dvsfId = id.NewFieldID()
	thId1  = id.NewThreadID()
	thId2  = id.NewThreadID()
	thId3  = id.NewThreadID()
	thId4  = id.NewThreadID()
	thId5  = id.NewThreadID()
	thId6  = id.NewThreadID()
	icId   = id.NewCommentID()
	ikey0  = id.RandomKey()
	ikey1  = id.RandomKey()
	ikey2  = id.RandomKey()
	ikey3  = id.RandomKey()
	ikey4  = id.RandomKey()
	ikey5  = id.RandomKey()
	pid    = id.NewProjectID()
	sid0   = id.NewSchemaID()
	sid1   = id.NewSchemaID()
	sid2   = id.NewSchemaID()
	sid3   = id.NewSchemaID()
	palias = "PROJECT_ALIAS"
	sfKey1 = id.RandomKey()
	sfKey2 = id.NewKey("asset")
	sfKey3 = id.RandomKey()
	sfKey4 = id.RandomKey()
	sfKey5 = id.NewKey("asset-key")
	sfKey6 = id.NewKey("group-key")
	sfKey7 = id.NewKey("geometry-key")
	sfKey8 = id.NewKey("geometry-editor-key")
	sfkey9 = id.NewKey("number-key")
	gKey1  = id.RandomKey()
	gId1   = id.NewItemGroupID()
	gId2   = id.NewItemGroupID()
	gId3   = id.NewItemGroupID()

	now = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)
)

func baseSeeder(ctx context.Context, r *repo.Container) error {
	defer util.MockNow(now)()

	// region user & integration & workspace & project
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

	w := workspace.New().
		ID(wId0).
		Name("e2e").
		Personal(false).
		Members(map[accountdomain.UserID]workspace.Member{uId: {Role: workspace.RoleOwner, InvitedBy: u.ID()}}).
		Integrations(map[workspace.IntegrationID]workspace.Member{iid: {Role: workspace.RoleOwner, InvitedBy: u.ID()}}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	p := project.New().
		ID(pid).
		Name("p1").
		Description("p1 desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		Alias(palias).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	// endregion

	// region schema & model
	sf1 := schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(sfKey1).MustBuild()
	sf2 := schema.NewField(schema.NewAsset().TypeProperty()).ID(fId2).Key(sfKey2).MustBuild()
	sf3 := schema.NewField(schema.NewReference(mId1, sid1, nil, nil).TypeProperty()).ID(fId3).Key(sfKey3).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId4).Key(sfKey4).MustBuild()

	s0 := schema.New().ID(sid0).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{}).MustBuild()
	if err := r.Schema.Save(ctx, s0); err != nil {
		return err
	}

	s1 := schema.New().ID(sid1).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf1, sf2}).TitleField(sf1.ID().Ref()).MustBuild()
	if err := r.Schema.Save(ctx, s1); err != nil {
		return err
	}

	s2 := schema.New().ID(sid2).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf3}).MustBuild()
	if err := r.Schema.Save(ctx, s2); err != nil {
		return err
	}

	s3 := schema.New().ID(sid3).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf4}).MustBuild()
	if err := r.Schema.Save(ctx, s3); err != nil {
		return err
	}

	m0 := model.New().
		ID(mId0).
		Name("m0").
		Description("m0 desc").
		Public(true).
		Key(ikey0).
		Project(p.ID()).
		Schema(s0.ID()).
		UpdatedAt(now.Add(time.Second)).
		Order(0).
		MustBuild()
	if err := r.Model.Save(ctx, m0); err != nil {
		return err
	}

	m1 := model.New().
		ID(mId1).
		Name("m1").
		Description("m1 desc").
		Public(true).
		Key(ikey1).
		Project(p.ID()).
		Schema(s1.ID()).
		Metadata(s3.ID().Ref()).
		UpdatedAt(now.Add(2 * time.Second)).
		Order(1).
		MustBuild()
	if err := r.Model.Save(ctx, m1); err != nil {
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
		UpdatedAt(now.Add(3 * time.Second)).
		Order(2).
		MustBuild()
	if err := r.Model.Save(ctx, m2); err != nil {
		return err
	}

	sf5 := schema.NewField(schema.NewAsset().TypeProperty()).ID(fId5).Key(sfKey5).Multiple(true).MustBuild()
	s4 := schema.New().ID(id.NewSchemaID()).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf5}).MustBuild()
	if err := r.Schema.Save(ctx, s4); err != nil {
		return err
	}

	g := group.New().NewID().Name("group").Project(p.ID()).Key(gKey1).Schema(s4.ID()).MustBuild()
	if err := r.Group.Save(ctx, g); err != nil {
		return err
	}
	sf6 := schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).ID(fId6).Key(sfKey6).Multiple(true).MustBuild()
	s5 := schema.New().ID(id.NewSchemaID()).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf6}).MustBuild()
	if err := r.Schema.Save(ctx, s5); err != nil {
		return err
	}

	m3 := model.New().
		ID(mId3).
		Name("m3").
		Description("m3 desc").
		Public(true).
		Key(ikey3).
		Project(p.ID()).
		Schema(s5.ID()).
		UpdatedAt(now.Add(4 * time.Second)).
		Order(3).
		MustBuild()
	if err := r.Model.Save(ctx, m3); err != nil {
		return err
	}

	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf7 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).ID(fId7).Key(sfKey7).MustBuild()
	sf8 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).ID(fId8).Key(sfKey8).MustBuild()
	s7 := schema.New().ID(id.NewSchemaID()).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf7, sf8}).MustBuild()
	if err := r.Schema.Save(ctx, s7); err != nil {
		return err
	}
	m4 := model.New().
		ID(mId4).
		Name("m4").
		Description("m4 desc").
		Public(true).
		Key(ikey4).
		Project(p.ID()).
		Schema(s7.ID()).
		UpdatedAt(now.Add(5 * time.Second)).
		Order(4).
		MustBuild()
	if err := r.Model.Save(ctx, m4); err != nil {
		return err
	}

	float1 := float64(1.2)
	float2 := float64(123.4)
	sn1, _ := schema.NewNumber(&float1, &float2)
	sf9 := schema.NewField(sn1.TypeProperty()).ID(fId9).Key(sfkey9).Type(sn1.TypeProperty()).MustBuild()
	s8 := schema.New().ID(id.NewSchemaID()).Workspace(w.ID()).Project(p.ID()).Fields([]*schema.Field{sf9}).MustBuild()
	if err := r.Schema.Save(ctx, s8); err != nil {
		return err
	}
	m5 := model.New().
		ID((mId5)).
		Name("m5").
		Description("m5 desc").
		Public(true).
		Key(ikey5).
		Project(p.ID()).
		Schema(s8.ID()).
		UpdatedAt(now.Add(6 * time.Second)).
		Order(5).
		MustBuild()
	if err := r.Model.Save(ctx, m5); err != nil {
		return err
	}

	// endregion

	// region items
	itm := item.New().ID(itmId1).
		Schema(s1.ID()).
		Model(m1.ID()).
		Project(p.ID()).
		Thread(thId1.Ref()).
		Fields([]*item.Field{
			item.NewField(fId2, value.TypeAsset.Value(aid1).AsMultiple(), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm); err != nil {
		return err
	}

	itm2 := item.New().ID(itmId2).
		Schema(s2.ID()).
		Model(m2.ID()).
		Project(p.ID()).
		Thread(thId2.Ref()).
		Fields([]*item.Field{
			item.NewField(fId3, value.TypeReference.Value(itmId1).AsMultiple(), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm2); err != nil {
		return err
	}

	itm3 := item.New().ID(itmId3).
		Schema(s3.ID()).
		Model(m1.ID()).
		Project(p.ID()).
		Thread(thId3.Ref()).
		IsMetadata(true).
		Fields([]*item.Field{
			item.NewField(fId4, value.TypeBool.Value(true).AsMultiple(), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm3); err != nil {
		return err
	}

	itm4 := item.New().ID(itmId4).
		Schema(s5.ID()).
		Model(m3.ID()).
		Project(p.ID()).
		Thread(thId4.Ref()).
		IsMetadata(false).
		Fields([]*item.Field{
			item.NewField(fId6, value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(gId1), value.TypeGroup.Value(gId2)}), nil),
			item.NewField(fId5, value.MultipleFrom(value.TypeAsset, []*value.Value{value.TypeAsset.Value(aid1), value.TypeAsset.Value(aid2)}), gId1.Ref()),
			item.NewField(fId5, value.MultipleFrom(value.TypeAsset, []*value.Value{value.TypeAsset.Value(aid2), value.TypeAsset.Value(aid1)}), gId2.Ref()),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm4); err != nil {
		return err
	}

	itm5 := item.New().ID(itmId5).
		Schema(s7.ID()).
		Model(m4.ID()).
		Project(p.ID()).
		Thread(thId5.Ref()).
		IsMetadata(false).
		Fields([]*item.Field{
			item.NewField(fId7, value.MultipleFrom(value.TypeGeometryObject, []*value.Value{value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}"), value.TypeGeometryObject.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [101.0, 1.5]\n}")}), nil),
			item.NewField(fId8, value.MultipleFrom(value.TypeGeometryEditor, []*value.Value{value.TypeGeometryEditor.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}"), value.TypeGeometryEditor.Value("{\n\"type\": \"Point\",\n\t\"coordinates\": [101.0, 1.5]\n}")}), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm5); err != nil {
		return err
	}

	itm6 := item.New().ID(itmId6).
		Schema(s8.ID()).
		Model(m5.ID()).
		Project(p.ID()).
		Thread(thId6.Ref()).
		IsMetadata(false).
		Fields([]*item.Field{
			item.NewField(fId9, value.MultipleFrom(value.TypeNumber, []*value.Value{
				value.TypeNumber.Value(21.2),
			}), nil),
		}).
		MustBuild()
	if err := r.Item.Save(ctx, itm6); err != nil {
		return err
	}

	itm7 := item.New().ID(itmId7).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(p.ID()).
		MustBuild()
	if err := r.Item.Save(ctx, itm7); err != nil {
		return err
	}
	// endregion

	// region thread & comment
	cmt := thread.NewComment(icId, operator.OperatorFromUser(u.ID()), "test comment")
	th := thread.New().ID(thId1).Workspace(w.ID()).Comments([]*thread.Comment{cmt}).MustBuild()
	if err := r.Thread.Save(ctx, th); err != nil {
		return err
	}

	f1 := asset.NewFile().Name("aaa.jpg").Size(1000).ContentType("image/jpg").Build()
	f2 := asset.NewFile().Name("bbb.jpg").Size(1000).ContentType("image/jpg").Build()
	a1 := asset.New().ID(aid1).
		Project(p.ID()).
		CreatedByUser(u.ID()).
		FileName("aaa.jpg").
		Size(1000).
		UUID(auuid1).
		Thread(thId1.Ref()).
		MustBuild()
	a2 := asset.New().ID(aid2).
		Project(p.ID()).
		CreatedByUser(u.ID()).
		FileName("bbb.jpg").
		Size(1000).
		UUID(auuid2).
		Thread(thId2.Ref()).
		MustBuild()
	a3 := asset.New().ID(aid3).
		Project(p.ID()).
		CreatedByUser(u.ID()).
		FileName("ccc.jpg").
		Size(1000).
		UUID(uuid.NewString()).
		MustBuild()

	if err := r.Asset.Save(ctx, a1); err != nil {
		return err
	}
	if err := r.Asset.Save(ctx, a2); err != nil {
		return err
	}
	if err := r.Asset.Save(ctx, a3); err != nil {
		return err
	}
	if err := r.AssetFile.Save(ctx, a1.ID(), f1); err != nil {
		return err
	}
	if err := r.AssetFile.Save(ctx, a2.ID(), f2); err != nil {
		return err
	}
	// endregion

	// Default value
	msf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(id.RandomKey()).DefaultValue(schema.NewBool().TypeProperty().Type().Value(true).AsMultiple()).MustBuild()
	sm := schema.New().NewID().Workspace(w.ID()).Project(pid).Fields([]*schema.Field{msf1}).MustBuild()
	if err := r.Schema.Save(ctx, sm); err != nil {
		return err
	}
	gsf := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).DefaultValue(schema.NewText(nil).TypeProperty().Type().Value("default group").AsMultiple()).MustBuild()
	gs := schema.New().NewID().Workspace(w.ID()).Project(pid).Fields([]*schema.Field{gsf}).MustBuild()
	if err := r.Schema.Save(ctx, gs); err != nil {
		return err
	}
	gp := group.New().NewID().Name("group2").Project(pid).Key(id.RandomKey()).Schema(gs.ID()).MustBuild()
	if err := r.Group.Save(ctx, gp); err != nil {
		return err
	}
	dvsf1 := schema.NewField(schema.NewText(nil).TypeProperty()).ID(dvsfId).Key(id.RandomKey()).MustBuild()
	dvsf2 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).DefaultValue(schema.NewText(nil).TypeProperty().Type().Value("default").AsMultiple()).MustBuild()
	dvsf3 := schema.NewField(schema.NewGroup(gp.ID()).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()

	gst2 := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest2 := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	dvsf4 := schema.NewField(schema.NewGeometryObject(gst2).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	dvsf5 := schema.NewField(schema.NewGeometryEditor(gest2).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()

	dvs1 := schema.New().NewID().Workspace(w.ID()).Project(pid).Fields([]*schema.Field{dvsf1, dvsf2, dvsf3, dvsf4, dvsf5}).MustBuild()
	if err := r.Schema.Save(ctx, dvs1); err != nil {
		return err
	}
	dvm := model.New().
		ID(dvmId).
		Name("dvm").
		Description("dvm desc").
		Public(true).
		Key(id.RandomKey()).
		Project(pid).
		Schema(dvs1.ID()).
		Metadata(sm.ID().Ref()).
		UpdatedAt(now.Add(7 * time.Second)).
		Order(6).
		MustBuild()

	if err := r.Model.Save(ctx, dvm); err != nil {
		return err
	}

	return nil
}

func IntegrationSearchItem(e *httpexpect.Expect, mId string, page, perPage int, keyword string, sort, sortDir string, filter map[string]any) *httpexpect.Value {
	res := e.GET("/api/models/{modelId}/items", mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithQuery("page", page).
		WithQuery("perPage", perPage).
		WithQuery("sort", sort).
		WithQuery("dir", sortDir).
		WithQuery("keyword", keyword).
		WithJSON(map[string]any{
			"filter": filter,
		}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func IntegrationItemsAsGeoJSON(e *httpexpect.Expect, mId string, page, perPage int) *httpexpect.Value {
	res := e.GET("/api/models/{modelId}/items.geojson", mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithQuery("page", page).
		WithQuery("perPage", perPage).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func IntegrationItemsWithProjectAsGeoJSON(e *httpexpect.Expect, pId string, mId string, page, perPage int) *httpexpect.Value {
	res := e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.geojson", pId, mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithQuery("page", page).
		WithQuery("perPage", perPage).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func IntegrationItemsAsCSV(e *httpexpect.Expect, mId string, page, perPage int) *httpexpect.String {
	res := e.GET("/api/models/{modelId}/items.csv", mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "text/csv").
		WithQuery("page", page).
		WithQuery("perPage", perPage).
		Expect().
		Status(http.StatusOK).
		Body()

	return res
}

func IntegrationItemsWithProjectAsCSV(e *httpexpect.Expect, pId string, mId string, page, perPage int) *httpexpect.String {
	res := e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.csv", pId, mId).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "text/csv").
		WithQuery("page", page).
		WithQuery("perPage", perPage).
		Expect().
		Status(http.StatusOK).
		Body()

	return res
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

	obj := e.GET("/api/models/{modelId}/items", mId1).
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
	obj = e.GET("/api/models/{modelId}/items", mId1).
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
	e.GET("/api/models/{modelId}/items", ikey1).
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
					"value": itmId1.String(),
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
				"value": itmId1.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId1.String()
	raw["modelId"] = mId1.String()

	e.GET("/api/models/{modelId}/items", mId4).
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

	r3 := e.POST("/api/models/{modelId}/items", mId5).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]any{
					"key":   sfkey9.String(),
					"type":  "number",
					"value": float64(21.2),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r3.
		Value("fields").
		IsEqual([]any{
			map[string]any{
				"id":    fId9.String(),
				"type":  "number",
				"value": float64(21.2),
				"key":   sfkey9.String(),
			},
		})

	e.GET("/api/models/{modelId}/items", mId5).
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
		HasValue("totalCount", 2)
	r3.
		Value("fields").
		IsEqual([]any{
			map[string]any{
				"id":    fId9.String(),
				"type":  "number",
				"value": float64(21.2),
				"key":   sfkey9.String(),
			},
		})
}

// GET /models/{modelId}/items
func TestIntegrationSearchItem(t *testing.T) {
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
	})
	// endregion

	// region search by id
	res = IntegrationSearchItem(e, mId, 1, 10, i1Id, "", "", nil)

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 10, i2Id, "", "", nil)

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})
	// endregion

	//// region fetch by schema with sort
	//res = IntegrationSearchItem(e, map[string]any{
	//	"project": pId,
	//	"model":   mId,
	//	"schema":  sId,
	//}, map[string]any{
	//	"field": map[string]any{
	//		"id":   nil,
	//		"type": "ID",
	//	},
	//	"direction": "DESC",
	//}, nil, map[string]any{
	//	"first": 2,
	//},
	//)
	//
	//res.Path("$.totalCount").Number().IsEqual(2)
	//res.Path("$.items[:].id").Array().IsEqual([]string{i2Id, i1Id})
	//
	//// fetch by schema with sort
	//res = IntegrationSearchItem(e, map[string]any{
	//	"project": pId,
	//	"model":   mId,
	//	"schema":  sId,
	//}, map[string]any{
	//	"field": map[string]any{
	//		"id":   fids.textFId,
	//		"type": "FIELD",
	//	},
	//	"direction": "DESC",
	//}, nil, map[string]any{
	//	"first": 2,
	//})
	//
	//res.Path("$.totalCount").Number().IsEqual(2)
	//res.Path("$.items[:].id").Array().IsEqual([]string{i2Id, i1Id})
	//// endregion

	// region fetch by model
	// res = IntegrationSearchItem(e, map[string]any{
	// 	"project": pId,
	// 	"model":   mId1,
	// }, nil, nil, map[string]any{
	// 	"first": 2,
	// })
	//
	// res.Path("$.totalCount").Number().IsEqual(3)
	// res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, mi1Id, i2Id})

	// fetch by model with search
	res = IntegrationSearchItem(e, mId, 1, 2, "updated", "", "", nil)

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filter basic
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "equals",
				"value":    "test1 updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "notEquals",
				"value":    "test1 updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	// user
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationUser",
				},
				"operator": "equals",
				"value":    uId1.String(),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationUser",
				},
				"operator": "notEquals",
				"value":    uId1.String(),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(0)
	res.Path("$.items").IsNull()

	// date
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationDate",
				},
				"operator": "equals",
				"value":    time.Now(),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationDate",
				},
				"operator": "notEquals",
				"value":    time.Now(),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(0)
	res.Path("$.items").IsNull()
	// endregion

	// region filter nullable
	i1ver, _ = getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "", "type": "Text"},
	})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"nullable": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "empty",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"nullable": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "notEmpty",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	i1ver, _ = getItem(e, i1Id)
	updateItem(e, i1Id, i1ver, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1 updated", "type": "Text"},
	})
	// endregion

	// region filters number
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.integerFId,
					"type":    "field",
				},
				"operator": "lessThan",
				"value":    2,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.integerFId,
					"type":    "field",
				},
				"operator": "lessThanOrEqualTo",
				"value":    2,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.integerFId,
					"type":    "field",
				},
				"operator": "greaterThan",
				"value":    1,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"number": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.integerFId,
					"type":    "field",
				},
				"operator": "greaterThanOrEqualTo",
				"value":    1,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters text
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "contains",
				"value":    "updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "notContains",
				"value":    "updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "startsWith",
				"value":    "test",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "notStartsWith",
				"value":    "test",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(0)
	res.Path("$.items").IsNull()

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "endsWith",
				"value":    "updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"string": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.textFId,
					"type":    "field",
				},
				"operator": "notEndsWith",
				"value":    "updated",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})
	// endregion

	// region filters boolean
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"bool": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.boolFId,
					"type":    "field",
				},
				"operator": "equals",
				"value":    false,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"bool": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.boolFId,
					"type":    "field",
				},
				"operator": "notEquals",
				"value":    false,
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filters select
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"multiple": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.selectFId,
					"type":    "field",
				},
				"operator": "includesAny",
				"value":    []string{"s1", "s2", "s3"},
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"multiple": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.selectFId,
					"type":    "field",
				},
				"operator": "includesAny",
				"value":    []string{"s1", "s3"},
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"multiple": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.selectFId,
					"type":    "field",
				},
				"operator": "notIncludesAny",
				"value":    []string{"s1", "s2", "s3"},
			},
		})

	res.Path("$.totalCount").Number().IsEqual(0)
	res.Path("$.items").IsNull()
	// endregion

	// region filters and
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"and": []map[string]any{
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"fieldId": fids.textFId,
							"type":    "field",
						},
						"operator": "startsWith",
						"value":    "test",
					},
				},
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"fieldId": fids.textFId,
							"type":    "field",
						},
						"operator": "endsWith",
						"value":    "updated",
					},
				},
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})
	// endregion

	// region filters or
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"or": []map[string]any{
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"fieldId": fids.textFId,
							"type":    "field",
						},
						"operator": "startsWith",
						"value":    "test1",
					},
				},
				{
					"string": map[string]any{
						"fieldId": map[string]any{
							"fieldId": fids.textFId,
							"type":    "field",
						},
						"operator": "startsWith",
						"value":    "test2",
					},
				},
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters date
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.dateFId,
					"type":    "field",
				},
				"operator": "after",
				"value":    "2023-01-01T00:00:00.000Z",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i2Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": fids.dateFId,
					"type":    "field",
				},
				"operator": "equals",
				"value":    "2023-01-01T00:00:00.000Z",
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationDate",
				},
				"operator": "after",
				"value":    time.Now().Format(time.RFC3339),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(0)
	res.Path("$.items").IsNull()

	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"time": map[string]any{
				"fieldId": map[string]any{
					"fieldId": nil,
					"type":    "creationDate",
				},
				"operator": "after",
				"value":    time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
			},
		})

	res.Path("$.totalCount").Number().IsEqual(2)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id, i2Id})
	// endregion

	// region filters Metadata tags
	res = IntegrationSearchItem(e, mId, 1, 2, "", "", "",
		map[string]any{
			"basic": map[string]any{
				"fieldId": map[string]any{
					"fieldId": mfids.tagFId,
					"type":    "metaField",
				},
				"operator": "equals",
				"value":    tagIds[0],
			},
		})

	res.Path("$.totalCount").Number().IsEqual(1)
	res.Path("$.items[:].id").Array().IsEqual([]string{i1Id})
	// endregion
}

// GET /models/{modelId}/items.geojson
func TestIntegrationItemsAsGeoJSON(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)
	sId, _, _ := getModel(e, mId)
	i1Id, _ := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.numberFId, "value": 1, "type": "Number"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}", "type": "GeometryObject"},
	})

	res := IntegrationItemsAsGeoJSON(e, mId, 1, 10)
	res.Object().Value("type").String().IsEqual("FeatureCollection")
	features := res.Object().Value("features").Array()
	features.Length().IsEqual(1)
	f := features.Value(0).Object()
	f.Value("id").String().IsEqual(i1Id)
	f.Value("type").String().IsEqual("Feature")
	f.Value("properties").Object().IsEqual(map[string]any{
		"number": 1,
		"text":   "test1",
	})
	g := f.Value("geometry").Object()
	g.Value("type").String().IsEqual("Point")
	g.Value("coordinates").Array().IsEqual([]float64{139.28179282584915, 36.58570985749664})
}

// GET /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.geojson
func TestIntegrationItemsWithProjectAsGeoJSON(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)
	sId, _, _ := getModel(e, mId)
	i1Id, _ := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.integerFId, "value": 30, "type": "Integer"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}", "type": "GeometryEditor"},
	})

	res := IntegrationItemsWithProjectAsGeoJSON(e, pId, mId, 1, 10)
	res.Object().Value("type").String().IsEqual("FeatureCollection")
	features := res.Object().Value("features").Array()
	features.Length().IsEqual(1)
	f := features.Value(0).Object()
	f.Value("id").String().IsEqual(i1Id)
	f.Value("type").String().IsEqual("Feature")
	f.Value("properties").Object().Value("text").String().IsEqual("test1")
	f.Value("properties").Object().Value("integer").Number().IsEqual(30)
	g := f.Value("geometry").Object()
	g.Value("type").String().IsEqual("LineString")
	g.Value("coordinates").Array().IsEqual([][]float64{{139.65439725962517, 36.34793305387103}, {139.61688622815393, 35.910803456352724}})
}

// GET /models/{modelId}/items.csv
func TestIntegrationItemsAsCSV(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)
	sId, _, _ := getModel(e, mId)
	i1Id, _ := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}", "type": "GeometryObject"},
	})

	res := IntegrationItemsAsCSV(e, mId, 1, 10)
	expected := fmt.Sprintf("id,location_lat,location_lng,text,textArea,markdown,asset,bool,select,integer,number,url,date,tag,checkbox\n%s,139.28179282584915,36.58570985749664,test1,,,,,,,,,,,\n", i1Id)
	res.IsEqual(expected)
}

// GET /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.csv
func TestIntegrationItemsWithProjectAsCSV(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	fids := createFieldOfEachType(t, e, mId)
	sId, _, _ := getModel(e, mId)
	i1Id, _ := createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": fids.textFId, "value": "test1", "type": "Text"},
		{"schemaFieldId": fids.integerFId, "value": 30, "type": "Integer"},
		{"schemaFieldId": fids.geometryObjectFid, "value": "{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}", "type": "GeometryObject"},
		{"schemaFieldId": fids.geometryEditorFid, "value": "{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}", "type": "GeometryEditor"},
	})

	res := IntegrationItemsWithProjectAsCSV(e, pId, mId, 1, 10)
	expected := fmt.Sprintf("id,location_lat,location_lng,text,textArea,markdown,asset,bool,select,integer,number,url,date,tag,checkbox\n%s,139.28179282584915,36.58570985749664,test1,,,,,,30,,,,,\n", i1Id)
	res.IsEqual(expected)
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

	e.POST("/api/models/{modelId}/items", ikey1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	r := e.POST("/api/models/{modelId}/items", mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId1.String(),
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "isMetadata", "updatedAt", "version", "parents", "refs")
	r.Value("fields").IsEqual([]any{
		map[string]string{
			"id":    fId1.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey1.String(),
		},
	})
	r.Value("modelId").IsEqual(mId1.String())
	r.Value("refs").IsEqual([]string{"latest"})
	r.Value("isMetadata").IsEqual(false)

	obj := e.POST("/api/models/{modelId}/items", mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey1.String(),
					"value": "test value 2",
				},
			},
			"metadataFields": []interface{}{
				map[string]string{
					"key":   sfKey4.String(),
					"value": "true",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId1.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey1.String(),
			},
		})
	obj.
		Value("metadataFields").
		IsEqual([]any{
			map[string]any{
				"id":    fId4.String(),
				"type":  "bool",
				"value": true,
				"key":   sfKey4.String(),
			},
		})
	r2 := e.POST("/api/models/{modelId}/items", mId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId1.String(),
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
				"value": itmId1.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId1.String()
	raw["modelId"] = mId1.String()

	obj2 := e.POST("/api/models/{modelId}/items", mId4).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey7.String(),
					"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				},
				map[string]string{
					"key":   sfKey8.String(),
					"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj2.
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId7.String(),
				"type":  "geometryObject",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				"key":   sfKey7.String(),
			},
			map[string]string{
				"id":    fId8.String(),
				"type":  "geometryEditor",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				"key":   sfKey8.String(),
			},
		})

}

func TestIntegrationCreateItemAPIWithDefaultValues(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	r := e.POST("/api/models/{modelId}/items", dvmId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    dvsfId.String(),
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "metadataFields", "isMetadata", "updatedAt", "version", "parents", "refs")
	r.Path("$.fields[:]").Array().Length().IsEqual(4)
	raw := r.Path("$.fields[:].value").Array().Raw()
	assert.True(t, slices.Contains(raw, "default"))
	assert.True(t, slices.Contains(raw, "default group"))
	assert.True(t, slices.Contains(raw, "test value"))
	r.Path("$.metadataFields[:]").Array().Length().IsEqual(1)
	raw2 := r.Path("$.metadataFields[:].value").Array().Raw()
	assert.True(t, slices.Contains(raw2, true))
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

	r := e.PATCH("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId1.String(),
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
			"value": aid1.String(),
		},
		map[string]string{
			"id":    fId1.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey1.String(),
		},
	})
	r.Value("modelId").IsEqual(mId1.String())
	r.Value("refs").IsEqual([]string{"latest"})

	e.PATCH("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId2.String(),
					"key":   "asset",
					"type":  "asset",
					"value": aid1.String(),
				},
				map[string]string{
					"key":   sfKey1.String(),
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
				"value": aid1.String(),
			},
			map[string]string{
				"id":    fId1.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey1.String(),
			},
		})

	r2 := e.PATCH("/api/items/{itemId}", itmId2).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey3.String(),
					"type":  "reference",
					"value": itmId1.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r2.Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId3.String(),
				"type":  "reference",
				"value": itmId1.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId1.String()
	raw["modelId"] = mId1.String()

	r = e.PATCH("/api/items/{itemId}", itmId4).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]any{
					"group": gId1.String(),
					"id":    fId5.String(),
					"type":  "asset",
					"value": []string{aid1.String()},
					"key":   sfKey5.String(),
				},
				// map[string]any{
				// 	"id":    fId6.String(),
				// 	"type":  "group",
				// 	"value": []string{gId1.String(), gId2.String()},
				// 	"key":   sfKey6.String(),
				// },
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r.Value("fields").
		IsEqual([]any{
			map[string]any{
				"group": gId1.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid1.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"group": gId2.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid2.String(), aid1.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"id":    fId6.String(),
				"type":  "group",
				"value": []string{gId1.String(), gId2.String()},
				"key":   sfKey6.String(),
			},
		})

	r = e.PATCH("/api/items/{itemId}", itmId4).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]any{
					"group": gId3.String(),
					"id":    fId5.String(),
					"type":  "asset",
					"value": []string{aid2.String()},
					"key":   sfKey5.String(),
				},
				map[string]any{
					"id":    fId6.String(),
					"type":  "group",
					"value": []string{gId1.String(), gId2.String(), gId3.String()},
					"key":   sfKey6.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r.Value("fields").
		IsEqual([]any{
			map[string]any{
				"group": gId1.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid1.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"group": gId2.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid2.String(), aid1.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"group": gId3.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid2.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"id":    fId6.String(),
				"type":  "group",
				"value": []string{gId1.String(), gId2.String(), gId3.String()},
				"key":   sfKey6.String(),
			},
		})

	r = e.PATCH("/api/items/{itemId}", itmId4).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]any{
					"id":    fId6.String(),
					"type":  "group",
					"value": []string{},
					"key":   sfKey6.String(),
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r.Value("fields").
		IsEqual([]any{
			map[string]any{
				"id":    fId6.String(),
				"type":  "group",
				"value": []string{},
				"key":   sfKey6.String(),
			},
		})

	e.PATCH("/api/items/{itemId}", itmId5).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId7.String(),
					"key":   sfKey7.String(),
					"type":  "geometryObject",
					"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				},
				map[string]string{
					"id":    fId8.String(),
					"key":   sfKey8.String(),
					"type":  "geometryEditor",
					"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
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
				"id":    fId7.String(),
				"key":   sfKey7.String(),
				"type":  "geometryObject",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
			},
			map[string]string{
				"id":    fId8.String(),
				"key":   sfKey8.String(),
				"type":  "geometryEditor",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
			},
		})
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

	e.GET("/api/items/{itemId}", itmId1).
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
					"value": itmId1.String(),
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
				"value": itmId1.String(),
				"key":   sfKey3.String(),
			},
		})
	r2.Value("referencedItems").Array().Value(0).Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	raw := r2.Value("referencedItems").Array().Value(0).Object().Raw()
	raw["id"] = itmId1.String()
	raw["modelId"] = mId1.String()

	//	get Metadata Item
	rm := e.GET("/api/items/{itemId}", itmId3).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	rm.
		Value("isMetadata").
		IsEqual(true)

	rm.Value("fields").
		IsEqual([]any{
			map[string]any{
				"id":    fId4.String(),
				"type":  "bool",
				"value": true,
				"key":   sfKey4.String(),
			},
		})

	r := e.GET("/api/items/{itemId}", itmId4).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r.Value("fields").
		IsEqual([]any{
			map[string]any{
				"group": gId1.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid1.String(), aid2.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"group": gId2.String(),
				"id":    fId5.String(),
				"type":  "asset",
				"value": []string{aid2.String(), aid1.String()},
				"key":   sfKey5.String(),
			},
			map[string]any{
				"id":    fId6.String(),
				"type":  "group",
				"value": []string{gId1.String(), gId2.String()},
				"key":   sfKey6.String(),
			},
		})

	r3 := e.GET("/api/items/{itemId}", itmId5).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	r3.Value("fields").
		IsEqual([]any{
			map[string]any{
				"id":    fId7.String(),
				"type":  "geometryObject",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				"key":   sfKey7.String(),
			},
			map[string]any{
				"id":    fId8.String(),
				"type":  "geometryEditor",
				"value": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
				"key":   sfKey8.String(),
			},
		})
}

// DELETE /items/{itemId}
func TestIntegrationDeleteItemAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")

	e.DELETE("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	e.GET("/api/items/{itemId}", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationItemForNumberAndIntegerType(t *testing.T) {

}

func assertItem(v *httpexpect.Value, assetEmbeded bool) {
	o := v.Object()
	o.Value("id").IsEqual(itmId1.String())
	if assetEmbeded {
		a := o.Value("fields").Array()
		a.Length().IsEqual(1)
		a.Value(0).Object().Value("value").Object().
			HasValue("id", aid1.String()).
			NotContainsKey("contentType").
			NotContainsKey("file").
			NotContainsKey("name").
			HasValue("previewType", "unknown").
			HasValue("projectId", pid.String()).
			HasValue("totalSize", 1000).
			HasValue("url", fmt.Sprintf("https://example.com/assets/%s/%s/aaa.jpg", auuid1[0:2], auuid1[2:]))
	} else {
		o.Value("fields").IsEqual([]map[string]any{
			{
				"id":    fId2.String(),
				"key":   "asset",
				"type":  "asset",
				"value": aid1.String(),
			},
		})
	}
	o.Value("parents").IsEqual([]any{})
	o.Value("refs").IsEqual([]string{"latest"})
}
