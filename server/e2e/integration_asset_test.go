package e2e

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/samber/lo"
)

var modelId = id.NewModelID()
var assetId = id.NewAssetID()

func baseSeederForAsset(ctx context.Context, r *repo.Container) error {
	u := user.New().NewID().
		Name("e2e").
		Email("e2e@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}

	i := integration.New().NewID().
		Type(integration.TypePublic).
		Name("i1").
		Description("i1 desc").
		LogoUrl(lo.Must(url.Parse("https://test.com"))).
		Token("secret_1234567890").
		Developer(id.NewUserID()).
		MustBuild()
	if err := r.Integration.Save(ctx, i); err != nil {
		return err
	}

	w := user.NewWorkspace().NewID().
		Name("e2e").
		Personal(false).
		Integrations(map[user.IntegrationID]user.Member{i.ID(): {Role: user.RoleOwner, InvitedBy: u.ID()}}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	p := project.New().NewID().
		Name("p1").
		Description("p1 desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	sf := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().RandomKey().MustBuild()
	s := schema.New().NewID().
		Workspace(w.ID()).
		Project(p.ID()).
		Fields([]*schema.Field{sf}).
		MustBuild()
	if err := r.Schema.Save(ctx, s); err != nil {
		return err
	}

	m := model.New().
		ID(modelId).
		Name("m1").
		Description("m1 desc").
		Public(true).
		Key(key.Random()).
		Project(p.ID()).
		Schema(s.ID()).
		MustBuild()
	if err := r.Model.Save(ctx, m); err != nil {
		return err
	}

	f := asset.NewFile().Name("aaa.jpg").Size(1000).ContentType("image/jpg").Build()
	a := asset.New().ID(assetId).
		Project(p.ID()).
		CreatedByUser(u.ID()).
		FileName("aaa.jpg").
		Size(1000).
		File(f).
		UUID(u.ID().String()).
		Thread(id.NewThreadID()).
		MustBuild()

	if err := r.Asset.Save(ctx, a); err != nil {
		return err
	}

	itm := item.New().NewID().
		Schema(s.ID()).
		Model(m.ID()).
		Project(p.ID()).
		Thread(id.NewThreadID()).
		MustBuild()
	if err := r.Item.Save(ctx, itm); err != nil {
		return err
	}

	return nil
}

// GET /assets/:assetId
func TestIntegrationGetAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederForAsset)

	e.GET(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		WithHeader("authorization", "Bearer secret_1234567890").
		Expect().
		Status(http.StatusNotFound)

	e.GET(fmt.Sprintf("/api/assets/%s", assetId)).
		WithHeader("authorization", "Bearer secret_1234567890").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		Contains("id", "projectId", "name", "url", "contentType", "previewType", "totalSize", "file", "createdAt", "updatedAt")
}

/*
// DELETE /assets/:assetId
func TestIntegrationDeleteAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederForAsset)

	e.DELETE(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		WithHeader("authorization", "Bearer secret_1234567890").
		Expect().
		Status(http.StatusNotFound)

	e.DELETE(fmt.Sprintf("/api/assets/%s", id.NewAssetID())).
		WithHeader("authorization", "Bearer secret_1234567890").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		Contains("id")

	e.GET("/api/assets/%s", id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_1234567890").
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("id").Array().Empty()
}
*/
