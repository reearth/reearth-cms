package e2e

import (
	"context"
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

// ── shared test IDs ──────────────────────────────────────────────────────────

var (
	postW1Id    = id.NewWorkspaceID()
	postW1Alias = "post-test-workspace"
	postP1Id    = id.NewProjectID()
	postP1Alias = "post-test-project"  // posting enabled at project level
	postP2Id    = id.NewProjectID()
	postP2Alias = "post-test-project-2" // posting disabled at project level

	postP1M1Id  = id.NewModelID()
	postP1M1Key = "post-model-enabled"  // posting enabled
	postP1M2Id  = id.NewModelID()
	postP1M2Key = "post-model-disabled" // posting disabled
	postP2M1Id  = id.NewModelID()
	postP2M1Key = "post-model-p2"       // project-level posting disabled
)

// ── seeder ───────────────────────────────────────────────────────────────────

func postItemSeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()

	wid := accountdomain.WorkspaceID(postW1Id)
	w := workspace.New().ID(wid).Name("Post Test Workspace").Alias(postW1Alias).
		Members(map[accountdomain.UserID]workspace.Member{
			uid: {Role: workspace.RoleOwner, InvitedBy: uid},
		}).MustBuild()
	lo.Must0(r.Workspace.Save(ctx, w))

	// Project 1 — posting enabled
	p1 := project.New().ID(postP1Id).Workspace(wid).Alias(postP1Alias).
		Accessibility(project.NewPublicAccessibility()).
		PostingEnabled(true).
		MustBuild()
	lo.Must0(r.Project.Save(ctx, p1))

	// Schema shared by both P1 models
	p1s1 := schema.New().NewID().Project(postP1Id).Workspace(wid).
		Fields(schema.FieldList{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().
				Name("name").Key(id.NewKey("name")).MustBuild(),
			schema.NewField(schema.NewBool().TypeProperty()).NewID().
				Name("subscribed").Key(id.NewKey("subscribed")).MustBuild(),
		}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p1s1))

	// Model 1 — posting enabled
	p1m1 := model.New().ID(postP1M1Id).Project(postP1Id).Schema(p1s1.ID()).
		Key(id.NewKey(postP1M1Key)).PostingEnabled(true).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m1))

	// Model 2 — posting disabled
	p1m2 := model.New().ID(postP1M2Id).Project(postP1Id).Schema(p1s1.ID()).
		Key(id.NewKey(postP1M2Key)).PostingEnabled(false).MustBuild()
	lo.Must0(r.Model.Save(ctx, p1m2))

	// Project 2 — posting disabled at project level
	p2 := project.New().ID(postP2Id).Workspace(wid).Alias(postP2Alias).
		Accessibility(project.NewPublicAccessibility()).
		PostingEnabled(false).
		MustBuild()
	lo.Must0(r.Project.Save(ctx, p2))

	p2s1 := schema.New().NewID().Project(postP2Id).Workspace(wid).
		Fields(schema.FieldList{}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, p2s1))

	p2m1 := model.New().ID(postP2M1Id).Project(postP2Id).Schema(p2s1.ID()).
		Key(id.NewKey(postP2M1Key)).PostingEnabled(true).MustBuild()
	lo.Must0(r.Model.Save(ctx, p2m1))

	return nil
}

// ── helpers ──────────────────────────────────────────────────────────────────

func postItemURL(workspace, project, model string) string {
	return "/api/p/" + workspace + "/" + project + "/" + model + "/items"
}

// ── tests ────────────────────────────────────────────────────────────────────

func TestPublicAPI_PostItem_Success(t *testing.T) {
	t.Parallel()
	e := StartServer(t, &app.Config{}, false, postItemSeeder)

	t.Run("stub 201 with correct shape", func(t *testing.T) {
		t.Parallel()
		obj := e.POST(postItemURL(postW1Alias, postP1Alias, postP1M1Key)).
			WithJSON(map[string]any{
				"fields": map[string]any{
					"name":       "Jane Smith",
					"subscribed": true,
				},
			}).
			Expect().
			Status(http.StatusCreated).
			JSON().Object()

		obj.ContainsKey("id")
		obj.ContainsKey("$createdAt")
		obj.Value("status").String().IsEqual("draft")
		obj.ContainsKey("fields")
	})

	t.Run("empty fields object is accepted", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL(postW1Alias, postP1Alias, postP1M1Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusCreated).
			JSON().Object().Value("status").String().IsEqual("draft")
	})

	t.Run("missing fields key defaults to empty", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL(postW1Alias, postP1Alias, postP1M1Key)).
			WithJSON(map[string]any{}).
			Expect().
			Status(http.StatusCreated).
			JSON().Object().Value("status").String().IsEqual("draft")
	})
}

func TestPublicAPI_PostItem_GateChecks(t *testing.T) {
	t.Parallel()
	e := StartServer(t, &app.Config{}, false, postItemSeeder)

	t.Run("403 when model posting is disabled", func(t *testing.T) {
		t.Parallel()
		obj := e.POST(postItemURL(postW1Alias, postP1Alias, postP1M2Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusForbidden).
			JSON().Object()

		obj.Value("error").String().IsEqual("posting is disabled for this model")
	})

	t.Run("403 when project posting is disabled", func(t *testing.T) {
		t.Parallel()
		obj := e.POST(postItemURL(postW1Alias, postP2Alias, postP2M1Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusForbidden).
			JSON().Object()

		obj.Value("error").String().IsEqual("posting is disabled for this project")
	})
}

func TestPublicAPI_PostItem_NotFound(t *testing.T) {
	t.Parallel()
	e := StartServer(t, &app.Config{}, false, postItemSeeder)

	t.Run("404 unknown workspace", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL("no-such-workspace", postP1Alias, postP1M1Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusNotFound).
			JSON().IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("404 unknown project", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL(postW1Alias, "no-such-project", postP1M1Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusNotFound).
			JSON().IsEqual(map[string]any{"error": "not found"})
	})

	t.Run("404 unknown model", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL(postW1Alias, postP1Alias, "no-such-model")).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusNotFound).
			JSON().IsEqual(map[string]any{"error": "not found"})
	})
}

func TestPublicAPI_PostItem_InvalidBody(t *testing.T) {
	t.Parallel()
	e := StartServer(t, &app.Config{}, false, postItemSeeder)

	t.Run("400 malformed JSON", func(t *testing.T) {
		t.Parallel()
		obj := e.POST(postItemURL(postW1Alias, postP1Alias, postP1M1Key)).
			WithBytes([]byte(`{not valid json`)).
			WithHeader("Content-Type", "application/json").
			Expect().
			Status(http.StatusBadRequest).
			JSON().Object()

		obj.Value("error").String().IsEqual("invalid request body")
	})
}

func TestPublicAPI_PostItem_NoConflictWithGET(t *testing.T) {
	t.Parallel()
	// Verifies that the POST /:model/items route does not shadow the existing GET routes.
	e := StartServer(t, &app.Config{}, false, postItemSeeder)

	t.Run("GET /:workspace/:project/:model is not 404 or 405", func(t *testing.T) {
		t.Parallel()
		// The route must still be reachable — anything other than 404/405 means it routed correctly.
		status := e.GET("/api/p/{workspace}/{project}/{model}", postW1Alias, postP1Alias, postP1M1Key).
			Expect().Raw().StatusCode
		if status == http.StatusNotFound || status == http.StatusMethodNotAllowed {
			t.Errorf("GET /:model route broken after POST /:model/items registration: got %d", status)
		}
	})

	t.Run("POST /:workspace/:project/:model/items is not 404 or 405", func(t *testing.T) {
		t.Parallel()
		e.POST(postItemURL(postW1Alias, postP1Alias, postP1M1Key)).
			WithJSON(map[string]any{"fields": map[string]any{}}).
			Expect().
			Status(http.StatusCreated)
	})
}
