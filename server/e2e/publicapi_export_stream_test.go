package e2e

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Unpaginated public API exports are streamed in batches of 1000 items.
// These tests run them against MongoDB, whose cursor pagination is what
// splits the export into batches in production.

// more than two export batches
const pStreamCount = 2500

var (
	pStreamWAlias        = "stream-workspace"
	pStreamPAlias        = "stream-project"
	pStreamPrivatePAlias = "stream-private-project"
	pStreamMKey          = "stream-model"
	pStreamNoGeoMKey     = "stream-no-geometry"
	pStreamPrivateMKey   = "stream-private-model"

	pStreamItemIDs  []string
	pStreamAssetIDs []string
)

func publicAPIStreamSeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	w := workspace.New().ID(wid).Name("Stream Workspace").Alias(pStreamWAlias).Members(map[accountdomain.UserID]workspace.Member{
		uid: {Role: workspace.RoleOwner, InvitedBy: uid},
	}).MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	// public project: every model and the assets are public
	p := project.New().NewID().Workspace(wid).Alias(pStreamPAlias).Accessibility(project.NewPublicAccessibility()).MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	// model with a geometry field and many published items
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("title").Key(id.NewKey("title")).MustBuild()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}
	geoField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("location").Key(id.NewKey("location")).MustBuild()
	s := schema.New().NewID().Project(p.ID()).Workspace(wid).Fields(schema.FieldList{textField, geoField}).MustBuild()
	if err := r.Schema.Save(ctx, s); err != nil {
		return err
	}
	m := model.New().NewID().Project(p.ID()).Schema(s.ID()).Key(id.NewKey(pStreamMKey)).MustBuild()
	if err := r.Model.Save(ctx, m); err != nil {
		return err
	}

	items := make(item.List, 0, pStreamCount)
	pStreamItemIDs = make([]string, 0, pStreamCount)
	for i := range pStreamCount {
		it := item.New().NewID().Model(m.ID()).Schema(s.ID()).Project(p.ID()).Thread(id.NewThreadID().Ref()).User(uid).
			Fields([]*item.Field{
				item.NewField(textField.ID(), value.TypeText.Value(fmt.Sprintf("item %d", i)).AsMultiple(), nil),
				item.NewField(geoField.ID(), value.TypeGeometryObject.Value(fmt.Sprintf(`{"type":"Point","coordinates":[%d,%d.5]}`, i%180, i%90)).AsMultiple(), nil),
			}).MustBuild()
		items = append(items, it)
		pStreamItemIDs = append(pStreamItemIDs, it.ID().String())
	}
	if err := r.Item.SaveAll(ctx, items); err != nil {
		return err
	}
	for _, it := range items {
		if err := r.Item.UpdateRef(ctx, it.ID(), version.Public, version.Latest.OrVersion().Ref()); err != nil {
			return err
		}
	}

	// model without a geometry field, so it cannot be exported as GeoJSON
	noGeoText := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("title").Key(id.NewKey("title")).MustBuild()
	noGeoSchema := schema.New().NewID().Project(p.ID()).Workspace(wid).Fields(schema.FieldList{noGeoText}).MustBuild()
	if err := r.Schema.Save(ctx, noGeoSchema); err != nil {
		return err
	}
	noGeoModel := model.New().NewID().Project(p.ID()).Schema(noGeoSchema.ID()).Key(id.NewKey(pStreamNoGeoMKey)).MustBuild()
	if err := r.Model.Save(ctx, noGeoModel); err != nil {
		return err
	}

	// many assets
	pStreamAssetIDs = make([]string, 0, pStreamCount)
	for i := range pStreamCount {
		name := fmt.Sprintf("file-%d.txt", i)
		a := asset.New().NewID().Project(p.ID()).CreatedByUser(uid).Size(1).Thread(id.NewThreadID().Ref()).FileName(name).UUID(uuid.NewString()).MustBuild()
		if err := r.Asset.Save(ctx, a); err != nil {
			return err
		}
		if err := r.AssetFile.Save(ctx, a.ID(), asset.NewFile().Name(name).Path(name).ContentType("text/plain").Size(1).Build()); err != nil {
			return err
		}
		pStreamAssetIDs = append(pStreamAssetIDs, a.ID().String())
	}

	// private project: neither its models nor its assets are public
	privateP := project.New().NewID().Workspace(wid).Alias(pStreamPrivatePAlias).
		Accessibility(project.NewAccessibility(project.VisibilityPrivate, project.NewPublicationSettings(nil, false), nil, nil)).MustBuild()
	if err := r.Project.Save(ctx, privateP); err != nil {
		return err
	}
	privateText := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("title").Key(id.NewKey("title")).MustBuild()
	privateSchema := schema.New().NewID().Project(privateP.ID()).Workspace(wid).Fields(schema.FieldList{privateText}).MustBuild()
	if err := r.Schema.Save(ctx, privateSchema); err != nil {
		return err
	}
	privateModel := model.New().NewID().Project(privateP.ID()).Schema(privateSchema.ID()).Key(id.NewKey(pStreamPrivateMKey)).MustBuild()
	return r.Model.Save(ctx, privateModel)
}

// assertSameIDs checks that got has every id of want exactly once.
func assertSameIDs(t *testing.T, want, got []string) {
	t.Helper()
	seen := make(map[string]int, len(got))
	for _, id := range got {
		seen[id]++
	}
	for id, n := range seen {
		assert.Equal(t, 1, n, "id %s returned %d times", id, n)
	}
	assert.Len(t, got, len(want))
	assert.ElementsMatch(t, want, got)
}

type pStreamJSONResult struct {
	Results []struct {
		ID string `json:"id"`
	} `json:"results"`
	TotalCount int  `json:"totalCount"`
	HasMore    bool `json:"hasMore"`
}

func (r pStreamJSONResult) ids() []string {
	ids := make([]string, 0, len(r.Results))
	for _, res := range r.Results {
		ids = append(ids, res.ID)
	}
	return ids
}

func TestPublicAPI_ExportStreaming(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPIStreamSeeder)

	itemsURL := "/api/p/{workspace}/{project}/{model}"

	t.Run("unpaginated json returns every item exactly once", func(t *testing.T) {
		raw := e.GET(itemsURL, pStreamWAlias, pStreamPAlias, pStreamMKey).
			Expect().
			Status(http.StatusOK).
			HasContentType("application/json").
			Body().Raw()

		var res pStreamJSONResult
		require.NoError(t, json.Unmarshal([]byte(raw), &res))
		assertSameIDs(t, pStreamItemIDs, res.ids())
		assert.Equal(t, pStreamCount, res.TotalCount)

		// the .json route returns the same document
		e.GET(itemsURL+".json", pStreamWAlias, pStreamPAlias, pStreamMKey).
			Expect().
			Status(http.StatusOK).
			Body().IsEqual(raw)
	})

	t.Run("unpaginated csv returns every item exactly once", func(t *testing.T) {
		raw := e.GET(itemsURL+".csv", pStreamWAlias, pStreamPAlias, pStreamMKey).
			Expect().
			Status(http.StatusOK).
			HasContentType("text/csv").
			Body().Raw()

		rows, err := csv.NewReader(strings.NewReader(raw)).ReadAll()
		require.NoError(t, err)
		require.NotEmpty(t, rows)
		assert.Equal(t, "id", rows[0][0])

		ids := make([]string, 0, len(rows)-1)
		for _, row := range rows[1:] {
			ids = append(ids, row[0])
		}
		assertSameIDs(t, pStreamItemIDs, ids)
	})

	t.Run("unpaginated geojson returns every item exactly once", func(t *testing.T) {
		raw := e.GET(itemsURL+".geojson", pStreamWAlias, pStreamPAlias, pStreamMKey).
			Expect().
			Status(http.StatusOK).
			HasContentType("application/geo+json").
			Body().Raw()

		var res struct {
			Type     string `json:"type"`
			Features []struct {
				ID string `json:"id"`
			} `json:"features"`
		}
		require.NoError(t, json.Unmarshal([]byte(raw), &res))
		assert.Equal(t, "FeatureCollection", res.Type)

		ids := make([]string, 0, len(res.Features))
		for _, f := range res.Features {
			ids = append(ids, f.ID)
		}
		assertSameIDs(t, pStreamItemIDs, ids)
	})

	t.Run("pages add up to the unpaginated result", func(t *testing.T) {
		const limit = 100
		var ids []string
		for page := 1; ; page++ {
			raw := e.GET(itemsURL, pStreamWAlias, pStreamPAlias, pStreamMKey).
				WithQuery("page", page).
				WithQuery("limit", limit).
				Expect().
				Status(http.StatusOK).
				Body().Raw()

			var res pStreamJSONResult
			require.NoError(t, json.Unmarshal([]byte(raw), &res))
			assert.LessOrEqual(t, len(res.Results), limit)
			ids = append(ids, res.ids()...)

			if !res.HasMore {
				break
			}
			require.Less(t, page, pStreamCount/limit+1, "pagination does not end")
		}
		assertSameIDs(t, pStreamItemIDs, ids)
	})

	t.Run("unpaginated assets return every asset exactly once", func(t *testing.T) {
		raw := e.GET("/api/p/{workspace}/{project}/assets", pStreamWAlias, pStreamPAlias).
			Expect().
			Status(http.StatusOK).
			HasContentType("application/json").
			Body().Raw()

		var res pStreamJSONResult
		require.NoError(t, json.Unmarshal([]byte(raw), &res))
		assertSameIDs(t, pStreamAssetIDs, res.ids())
	})

	t.Run("errors keep their status codes", func(t *testing.T) {
		notFound := map[string]any{"error": "not found"}

		e.GET(itemsURL, "unknown-workspace", pStreamPAlias, pStreamMKey).
			Expect().Status(http.StatusNotFound).JSON().IsEqual(notFound)
		e.GET(itemsURL, pStreamWAlias, "unknown-project", pStreamMKey).
			Expect().Status(http.StatusNotFound).JSON().IsEqual(notFound)
		e.GET(itemsURL+".csv", pStreamWAlias, pStreamPAlias, "unknown-model").
			Expect().Status(http.StatusNotFound).JSON().IsEqual(notFound)
		e.GET(itemsURL, pStreamWAlias, pStreamPrivatePAlias, pStreamPrivateMKey).
			Expect().Status(http.StatusNotFound).JSON().IsEqual(notFound)
		e.GET("/api/p/{workspace}/{project}/assets", pStreamWAlias, pStreamPrivatePAlias).
			Expect().Status(http.StatusNotFound).JSON().IsEqual(notFound)

		e.GET(itemsURL+".geojson", pStreamWAlias, pStreamPAlias, pStreamNoGeoMKey).
			Expect().Status(http.StatusBadRequest).
			JSON().Object().Value("error").String().IsEqual("no geometry field in this model")
	})
}

// GET /models/{modelId}/items.geojson on a model without a geometry field
// used to answer 200 with an empty body, because the status was sent before
// the export had a chance to fail.
func TestIntegrationItemsAsGeoJSON_NoGeometryField(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")
	mId, _ := createModel(e, pId, "test", "test", "test-1")
	textFId, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})
	sId, _, _ := getModel(e, mId)
	_, _ = createItem(e, mId, sId, nil, []map[string]any{
		{"schemaFieldId": textFId, "value": "test1", "type": "Text"},
	})

	request := func(model string) *httpexpect.Response {
		return iAPIItemsAsGeoJSON(e, wId.String(), pId, model).
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			Expect()
	}

	request(mId).
		Status(http.StatusBadRequest).
		JSON().Object().Value("error").String().IsEqual("no geometry field in this model")

	request(id.NewModelID().String()).
		Status(http.StatusNotFound)
}
