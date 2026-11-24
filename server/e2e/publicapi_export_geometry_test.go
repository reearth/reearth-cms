package e2e

import (
	"context"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

var (
	geoExpW1Alias = "geo-export-workspace"
	geoExpP1Alias = "geo-export-project"
	geoExpM1Key   = "geo-export-model"
	geoExpM1I1Id  = id.NewItemID()
	geoExpM1I2Id  = id.NewItemID()
	geoExpM2Key   = "geo-export-geometry-model"
	geoExpM2I1Id  = id.NewItemID()
)

// geoExportSeeder seeds a model with a group field (containing a geometry field) and a top-level geometry field:
//   - item 1: only the geometry inside the group is set
//   - item 2: only the top-level geometry is set
//
// and a second model with a unified Geometry field and one item.
func geoExportSeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()

	/// Workspace
	wid := accountdomain.NewWorkspaceID()
	w := workspace.New().ID(wid).Name("Geo Export Workspace").Alias(geoExpW1Alias).Members(map[accountdomain.UserID]workspace.Member{
		uid: {Role: workspace.RoleOwner, InvitedBy: uid},
	}).MustBuild()
	lo.Must0(r.Workspace.Save(ctx, w))

	/// Project (Public)
	p1 := project.New().NewID().Workspace(wid).Alias(geoExpP1Alias).Accessibility(project.NewPublicAccessibility()).MustBuild()
	lo.Must0(r.Project.Save(ctx, p1))

	geoTp := schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}).TypeProperty()

	/// Group with a geometry field
	gGeoId := id.NewFieldID()
	gs := schema.New().NewID().Project(p1.ID()).Workspace(wid).Fields(schema.FieldList{
		schema.NewField(geoTp).ID(gGeoId).Name("nested-location").Key(id.NewKey("nested-location")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, gs))

	g := group.New().NewID().Project(p1.ID()).Schema(gs.ID()).Name("detail-group").Key(id.NewKey("detail-group")).MustBuild()
	lo.Must0(r.Group.Save(ctx, g))

	/// Model with the group field and a top-level geometry field
	groupId := id.NewFieldID()
	geoId := id.NewFieldID()
	s := schema.New().NewID().Project(p1.ID()).Workspace(wid).Fields(schema.FieldList{
		schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).ID(groupId).Name("detail").Key(id.NewKey("detail")).MustBuild(),
		schema.NewField(geoTp).ID(geoId).Name("location").Key(id.NewKey("location")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, s))

	m := model.New().NewID().Project(p1.ID()).Schema(s.ID()).Key(id.NewKey(geoExpM1Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, m))

	/// Item 1: only the geometry inside the group is set
	ig := id.NewItemGroupID()
	i1 := item.New().
		ID(geoExpM1I1Id).
		Model(m.ID()).
		Schema(s.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(gGeoId, value.TypeGeometryObject.Value(`{"type":"LineString","coordinates":[[-0.1276,51.5072],[2.3522,48.8566]]}`).AsMultiple(), ig.Ref()),
			item.NewField(groupId, value.TypeGroup.Value(ig).AsMultiple(), nil),
		}).
		MustBuild()
	lo.Must0(r.Item.Save(ctx, i1))
	lo.Must0(r.Item.UpdateRef(ctx, i1.ID(), version.Public, version.Latest.OrVersion().Ref()))

	/// Item 2: only the top-level geometry is set
	i2 := item.New().
		ID(geoExpM1I2Id).
		Model(m.ID()).
		Schema(s.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(geoId, value.TypeGeometryObject.Value(`{"type":"Point","coordinates":[139.7671,35.6812]}`).AsMultiple(), nil),
		}).
		MustBuild()
	lo.Must0(r.Item.Save(ctx, i2))
	lo.Must0(r.Item.UpdateRef(ctx, i2.ID(), version.Public, version.Latest.OrVersion().Ref()))

	/// Model with a unified Geometry field
	geo2Id := id.NewFieldID()
	s2 := schema.New().NewID().Project(p1.ID()).Workspace(wid).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.NewKey("name")).MustBuild(),
		schema.NewField(schema.NewGeometry().TypeProperty()).ID(geo2Id).Name("location").Key(id.NewKey("location")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, s2))

	m2 := model.New().NewID().Project(p1.ID()).Schema(s2.ID()).Key(id.NewKey(geoExpM2Key)).MustBuild()
	lo.Must0(r.Model.Save(ctx, m2))

	i3 := item.New().
		ID(geoExpM2I1Id).
		Model(m2.ID()).
		Schema(s2.ID()).
		Project(p1.ID()).
		Thread(id.NewThreadID().Ref()).
		User(uid).
		Fields([]*item.Field{
			item.NewField(s2.Fields()[0].ID(), value.TypeText.Value("Tokyo").AsMultiple(), nil),
			item.NewField(geo2Id, value.TypeGeometry.Value(`{"type":"MultiPoint","coordinates":[[139.7671,35.6812],[139.7,35.6]]}`).AsMultiple(), nil),
		}).
		MustBuild()
	lo.Must0(r.Item.Save(ctx, i3))
	lo.Must0(r.Item.UpdateRef(ctx, i3.ID(), version.Public, version.Latest.OrVersion().Ref()))

	return nil
}

func TestPublicAPI_ExportGeoJSON_GroupGeometry(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, geoExportSeeder)

	t.Run("exports only the top-level geometry, never the geometry inside a group", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpM1Key).
			Expect().
			Status(http.StatusOK).
			JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
			IsEqual(map[string]any{
				"type": "FeatureCollection",
				"features": []map[string]any{
					// item 1 is not exported: its top-level geometry is empty and the group geometry is not used instead
					{
						"type": "Feature",
						"id":   geoExpM1I2Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{139.7671, 35.6812},
						},
						"properties": map[string]any{},
					},
				},
			})
	})
}

func TestPublicAPI_ExportGeoJSON_Geometry(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, geoExportSeeder)

	e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpM2Key).
		Expect().
		Status(http.StatusOK).
		JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
		IsEqual(map[string]any{
			"type": "FeatureCollection",
			"features": []map[string]any{
				{
					"type": "Feature",
					"id":   geoExpM2I1Id.String(),
					"geometry": map[string]any{
						"type":        "MultiPoint",
						"coordinates": []any{[]any{139.7671, 35.6812}, []any{139.7, 35.6}},
					},
					"properties": map[string]any{"name": "Tokyo"},
				},
			},
		})
}
