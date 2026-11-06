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

	geoExpTopGeo   = `{"type":"Point","coordinates":[139.7671,35.6812]}`
	geoExpTopGeo2  = `{"type":"Point","coordinates":[135.5023,34.6937]}`
	geoExpTopGeo3  = `{"type":"Point","coordinates":[130.4017,33.5902]}`
	geoExpGroupGeo = `{"type":"LineString","coordinates":[[-0.1276,51.5072],[2.3522,48.8566]]}`

	geoExpObjIncidentKey = "geo-object-incident"
	geoExpObjMixedKey    = "geo-object-mixed"
	geoExpObjI2Id        = id.NewItemID()
	geoExpObjI3Id        = id.NewItemID()
	geoExpObjI4Id        = id.NewItemID()

	geoExpEdIncidentKey = "geo-editor-incident"
	geoExpEdMixedKey    = "geo-editor-mixed"
	geoExpEdI2Id        = id.NewItemID()
	geoExpEdI3Id        = id.NewItemID()
	geoExpEdI4Id        = id.NewItemID()
)

func geoExportSeeder(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
	uid := accountdomain.NewUserID()

	/// Workspace
	wid := accountdomain.NewWorkspaceID()
	w := workspace.New().ID(wid).Name("Geo Export Workspace").Alias(geoExpW1Alias).Members(map[accountdomain.UserID]workspace.Member{
		uid: {Role: workspace.RoleOwner, InvitedBy: uid},
	}).MustBuild()
	lo.Must0(r.Workspace.Save(ctx, w))

	/// Project 1 (Public Project)
	p1 := project.New().NewID().Workspace(wid).Alias(geoExpP1Alias).Accessibility(project.NewPublicAccessibility()).MustBuild()
	lo.Must0(r.Project.Save(ctx, p1))

	gotp := schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}).TypeProperty()
	getp := schema.NewGeometryEditor(schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}).TypeProperty()

	seedGeoExportModels(ctx, r, p1, uid, value.TypeGeometryObject, gotp, geoExpObjIncidentKey, geoExpObjMixedKey, geoExpObjI2Id, geoExpObjI3Id, geoExpObjI4Id)
	seedGeoExportModels(ctx, r, p1, uid, value.TypeGeometryEditor, getp, geoExpEdIncidentKey, geoExpEdMixedKey, geoExpEdI2Id, geoExpEdI3Id, geoExpEdI4Id)

	return nil
}

func seedGeoExportModels(ctx context.Context, r *repo.Container, p *project.Project, uid accountdomain.UserID, gt value.Type, tp *schema.TypeProperty, incidentKey, mixedKey string, i2, i3, i4 id.ItemID) {
	/// Group
	gTextId := id.NewFieldID()
	gGeoId := id.NewFieldID()
	gs := schema.New().NewID().Project(p.ID()).Workspace(p.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(gTextId).Name("label").Key(id.NewKey("label")).Order(0).MustBuild(),
		schema.NewField(tp).ID(gGeoId).Name("nested-location").Key(id.NewKey("nested-location")).Order(1).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, gs))

	g := group.New().NewID().Project(p.ID()).Schema(gs.ID()).Name(mixedKey + "-group").Key(id.NewKey(mixedKey + "-group")).MustBuild()
	lo.Must0(r.Group.Save(ctx, g))

	/// Models
	groupId := id.NewFieldID()
	geoId := id.NewFieldID()
	newModel := func(key string) *model.Model {
		s := schema.New().NewID().Project(p.ID()).Workspace(p.Workspace()).Fields(schema.FieldList{
			schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).ID(groupId).Name("detail").Key(id.NewKey("detail")).Order(0).MustBuild(),
			schema.NewField(tp).ID(geoId).Name("location").Key(id.NewKey("location")).Order(1).MustBuild(),
		}).MustBuild()
		lo.Must0(r.Schema.Save(ctx, s))

		m := model.New().NewID().Project(p.ID()).Schema(s.ID()).Key(id.NewKey(key)).MustBuild()
		lo.Must0(r.Model.Save(ctx, m))
		return m
	}
	m1 := newModel(incidentKey)
	m2 := newModel(mixedKey)

	/// Items
	// group geometry is placed before the group's other fields in the item fields
	groupFields := func(label string) []*item.Field {
		ig := id.NewItemGroupID()
		return []*item.Field{
			item.NewField(gGeoId, gt.Value(geoExpGroupGeo).AsMultiple(), ig.Ref()),
			item.NewField(gTextId, value.TypeText.Value(label).AsMultiple(), ig.Ref()),
			item.NewField(groupId, value.TypeGroup.Value(ig).AsMultiple(), nil),
		}
	}
	topField := func(geo string) *item.Field {
		if geo == "" {
			return item.NewField(geoId, value.NewMultiple(gt, nil), nil)
		}
		return item.NewField(geoId, gt.Value(geo).AsMultiple(), nil)
	}

	save := func(iid id.ItemID, m *model.Model, fields []*item.Field) {
		i := item.New().
			ID(iid).
			Model(m.ID()).
			Schema(m.Schema()).
			Project(p.ID()).
			Thread(id.NewThreadID().Ref()).
			User(uid).
			Fields(fields).
			MustBuild()
		lo.Must0(r.Item.Save(ctx, i))
		lo.Must0(r.Item.UpdateRef(ctx, i.ID(), version.Public, version.Latest.OrVersion().Ref()))
	}

	save(id.NewItemID(), m1, groupFields("incident"))
	save(id.NewItemID(), m2, append(groupFields("empty"), topField("")))
	save(i2, m2, append(groupFields("both"), topField(geoExpTopGeo)))
	save(i3, m2, []*item.Field{topField(geoExpTopGeo2)})
	// same as i2 but with the top-level geometry before the group geometry in the item fields
	save(i4, m2, append([]*item.Field{topField(geoExpTopGeo3)}, groupFields("top-first")...))
}

func TestPublicAPI_ExportGeoJSON_GroupGeometry(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, geoExportSeeder)

	t.Run("geometry object: empty top-level geometry does not fall back to group geometry", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpObjIncidentKey).
			Expect().
			Status(http.StatusOK).
			JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
			IsEqual(map[string]any{
				"type":     "FeatureCollection",
				"features": []any{},
			})
	})

	t.Run("geometry object: top-level geometry is selected regardless of group geometry", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpObjMixedKey).
			Expect().
			Status(http.StatusOK).
			JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
			IsEqual(map[string]any{
				"type": "FeatureCollection",
				"features": []map[string]any{
					{
						"type": "Feature",
						"id":   geoExpObjI2Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{139.7671, 35.6812},
						},
						"properties": map[string]any{
							"detail": map[string]any{
								"label": "both",
							},
						},
					},
					{
						"type": "Feature",
						"id":   geoExpObjI3Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{135.5023, 34.6937},
						},
						"properties": map[string]any{},
					},
					{
						"type": "Feature",
						"id":   geoExpObjI4Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{130.4017, 33.5902},
						},
						"properties": map[string]any{
							"detail": map[string]any{
								"label": "top-first",
							},
						},
					},
				},
			})
	})

	t.Run("geometry editor: empty top-level geometry does not fall back to group geometry", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpEdIncidentKey).
			Expect().
			Status(http.StatusOK).
			JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
			IsEqual(map[string]any{
				"type":     "FeatureCollection",
				"features": []any{},
			})
	})

	t.Run("geometry editor: top-level geometry is selected regardless of group geometry", func(t *testing.T) {
		e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, geoExpEdMixedKey).
			Expect().
			Status(http.StatusOK).
			JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
			IsEqual(map[string]any{
				"type": "FeatureCollection",
				"features": []map[string]any{
					{
						"type": "Feature",
						"id":   geoExpEdI2Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{139.7671, 35.6812},
						},
						"properties": map[string]any{
							"detail": map[string]any{
								"label": "both",
							},
						},
					},
					{
						"type": "Feature",
						"id":   geoExpEdI3Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{135.5023, 34.6937},
						},
						"properties": map[string]any{},
					},
					{
						"type": "Feature",
						"id":   geoExpEdI4Id.String(),
						"geometry": map[string]any{
							"type":        "Point",
							"coordinates": []any{130.4017, 33.5902},
						},
						"properties": map[string]any{
							"detail": map[string]any{
								"label": "top-first",
							},
						},
					},
				},
			})
	})
}
