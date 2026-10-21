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
	geoExpGroupGeo = `{"type":"LineString","coordinates":[[-0.1276,51.5072],[2.3522,48.8566]]}`

	geoExpObjIncidentKey = "geo-object-incident"
	geoExpObjMixedKey    = "geo-object-mixed"
	geoExpObjI1Id        = id.NewItemID()
	geoExpObjI2Id        = id.NewItemID()
	geoExpObjI3Id        = id.NewItemID()

	geoExpEdIncidentKey = "geo-editor-incident"
	geoExpEdMixedKey    = "geo-editor-mixed"
	geoExpEdI1Id        = id.NewItemID()
	geoExpEdI2Id        = id.NewItemID()
	geoExpEdI3Id        = id.NewItemID()
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

	seedGeoExportModels(ctx, r, p1, uid, value.TypeGeometryObject, gotp, geoExpObjIncidentKey, geoExpObjMixedKey, geoExpObjI1Id, geoExpObjI2Id, geoExpObjI3Id)
	seedGeoExportModels(ctx, r, p1, uid, value.TypeGeometryEditor, getp, geoExpEdIncidentKey, geoExpEdMixedKey, geoExpEdI1Id, geoExpEdI2Id, geoExpEdI3Id)

	return nil
}

// seedGeoExportModels seeds two models whose schema has a group field (containing a geometry field)
// ordered before the top-level geometry field:
//   - incidentKey: one item with only the group geometry populated
//   - mixedKey: i1 with an empty top-level geometry, i2 with both populated, i3 with only the top-level populated
func seedGeoExportModels(ctx context.Context, r *repo.Container, p *project.Project, uid accountdomain.UserID, gt value.Type, tp *schema.TypeProperty, incidentKey, mixedKey string, i1, i2, i3 id.ItemID) {
	/// Group
	gTextId := id.NewFieldID()
	gGeoId := id.NewFieldID()
	gs := schema.New().NewID().Project(p.ID()).Workspace(p.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(gTextId).Name("label").Key(id.NewKey("label")).MustBuild(),
		schema.NewField(tp).ID(gGeoId).Name("nested-location").Key(id.NewKey("nested-location")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, gs))

	g := group.New().NewID().Project(p.ID()).Schema(gs.ID()).Name(mixedKey + "-group").Key(id.NewKey(mixedKey + "-group")).MustBuild()
	lo.Must0(r.Group.Save(ctx, g))

	groupId := id.NewFieldID()
	geoId := id.NewFieldID()
	s1 := schema.New().NewID().Project(p.ID()).Workspace(p.Workspace()).Fields(schema.FieldList{
		schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).ID(groupId).Name("detail").Key(id.NewKey("detail")).MustBuild(),
		schema.NewField(tp).ID(geoId).Name("location").Key(id.NewKey("location")).MustBuild(),
	}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, s1))
	s2 := s1.Clone()
	lo.Must0(r.Schema.Save(ctx, s2))

	m1 := model.New().NewID().Project(p.ID()).Schema(s1.ID()).Key(id.NewKey(incidentKey)).MustBuild()
	lo.Must0(r.Model.Save(ctx, m1))
	m2 := model.New().NewID().Project(p.ID()).Schema(s2.ID()).Key(id.NewKey(mixedKey)).MustBuild()
	lo.Must0(r.Model.Save(ctx, m2))

	// group geometry is placed before the top-level geometry in the item fields
	groupFields := func(label string) []*item.Field {
		ig := id.NewItemGroupID()
		return []*item.Field{
			item.NewField(gGeoId, gt.Value(geoExpGroupGeo).AsMultiple(), ig.Ref()),
			item.NewField(gTextId, value.TypeText.Value(label).AsMultiple(), ig.Ref()),
			item.NewField(groupId, value.TypeGroup.Value(ig).AsMultiple(), nil),
		}
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
	save(i1, m2, append(groupFields("empty"), item.NewField(geoId, value.NewMultiple(gt, nil), nil)))
	save(i2, m2, append(groupFields("both"), item.NewField(geoId, gt.Value(geoExpTopGeo).AsMultiple(), nil)))
	save(i3, m2, []*item.Field{item.NewField(geoId, gt.Value(geoExpTopGeo2).AsMultiple(), nil)})
}

func TestPublicAPI_ExportGeoJSON_GroupGeometry(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, geoExportSeeder)

	tests := []struct {
		name        string
		incidentKey string
		mixedKey    string
		i2Id        id.ItemID
		i3Id        id.ItemID
	}{
		{
			name:        "geometry object",
			incidentKey: geoExpObjIncidentKey,
			mixedKey:    geoExpObjMixedKey,
			i2Id:        geoExpObjI2Id,
			i3Id:        geoExpObjI3Id,
		},
		{
			name:        "geometry editor",
			incidentKey: geoExpEdIncidentKey,
			mixedKey:    geoExpEdMixedKey,
			i2Id:        geoExpEdI2Id,
			i3Id:        geoExpEdI3Id,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name+": empty top-level geometry does not fall back to group geometry", func(t *testing.T) {
			e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, tt.incidentKey).
				Expect().
				Status(http.StatusOK).
				JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
				IsEqual(map[string]any{
					"type":     "FeatureCollection",
					"features": []any{},
				})
		})

		t.Run(tt.name+": top-level geometry is selected regardless of group geometry", func(t *testing.T) {
			e.GET("/api/p/{workspace}/{project}/{model}.geojson", geoExpW1Alias, geoExpP1Alias, tt.mixedKey).
				Expect().
				Status(http.StatusOK).
				JSON(httpexpect.ContentOpts{MediaType: "application/geo+json"}).
				IsEqual(map[string]any{
					"type": "FeatureCollection",
					"features": []map[string]any{
						{
							"type": "Feature",
							"id":   tt.i2Id.String(),
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
							"id":   tt.i3Id.String(),
							"geometry": map[string]any{
								"type":        "Point",
								"coordinates": []any{135.5023, 34.6937},
							},
							"properties": map[string]any{},
						},
					},
				})
		})
	}
}
