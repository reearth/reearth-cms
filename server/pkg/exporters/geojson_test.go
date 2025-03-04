package exporters

import (
	"encoding/json"
	"net/url"
	"testing"
	"time"

	"github.com/iancoleman/orderedmap"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFeatureCollectionFromItems(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString, schema.GeometryObjectSupportedTypePolygon}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString, schema.GeometryEditorSupportedTypePolygon}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("LineString").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("Name").Key(id.RandomKey()).Multiple(true).MustBuild()
	sf3 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("Polygon").Key(id.RandomKey()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf4 := schema.NewField(tp4).NewID().Name("Age").Key(id.RandomKey()).MustBuild()
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("IsMarried").Key(id.RandomKey()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf2.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)
	fi3 := item.NewField(sf3.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fi4 := item.NewField(sf4.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi5 := item.NewField(sf5.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	s1 := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf2, sf3, sf4, sf5}).Workspace(accountdomain.NewWorkspaceID()).TitleField(sf1.ID().Ref()).Project(pid).MustBuild()
	s2 := schema.New().ID(sid).Fields([]*schema.Field{sf2}).Workspace(accountdomain.NewWorkspaceID()).TitleField(sf2.ID().Ref()).Project(pid).MustBuild()
	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi2, fi3, fi4, fi5}).
		Model(mid).
		Thread(tid.Ref()).
		User(uid).
		Integration(nid).
		MustBuild()
	v1 := version.New()
	vi1 := version.MustBeValue(v1, nil, version.NewRefs(version.Latest), util.Now(), i1)
	i2 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)}).
		Model(mid).
		Thread(tid.Ref()).
		User(uid).
		Integration(nid).
		MustBuild()
	v2 := version.New()
	vi2 := version.MustBeValue(v2, nil, version.NewRefs(version.Latest), util.Now(), i2)

	// with geometry fields
	ver1 := item.VersionedList{vi1}
	lineString := [][]float64{
		{139.65439725962517, 36.34793305387103},
		{139.61688622815393, 35.910803456352724},
	}
	jsonBytes, err := json.Marshal(lineString)
	assert.Nil(t, err)
	c := Geometry_Coordinates{
		union: jsonBytes,
	}
	g := Geometry{
		Type:        lo.ToPtr(GeometryTypeLineString),
		Coordinates: &c,
	}
	p := orderedmap.New()
	p.Set("Name", []any{"a", "b", "c"})
	p.Set("Age", int64(30))
	p.Set("IsMarried", true)

	f := Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Geometry:   &g,
		Properties: p,
		Id:         vi1.Value().ID().Ref().StringRef(),
	}

	expected1 := &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &[]Feature{f},
	}

	fc1, err1 := FeatureCollectionFromItems(ver1, s1)
	assert.Nil(t, err1)
	assert.Equal(t, expected1, fc1)

	// no geometry fields
	ver2 := item.VersionedList{vi2}
	expectErr2 := noGeometryFieldError

	fc, err := FeatureCollectionFromItems(ver2, s2)
	assert.Equal(t, expectErr2, err)
	assert.Nil(t, fc)
}

func TestExtractGeometry(t *testing.T) {
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString, schema.GeometryObjectSupportedTypePolygon}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("LineString").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("Name").Key(id.RandomKey()).Multiple(true).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf2.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)

	// Test with valid geometry field
	geometry1, ok1 := extractGeometry(fi1)
	assert.True(t, ok1)
	assert.NotNil(t, geometry1)
	assert.Equal(t, GeometryTypeLineString, *geometry1.Type)

	// Test with non-geometry field
	geometry2, ok2 := extractGeometry(fi2)
	assert.False(t, ok2)
	assert.Nil(t, geometry2)
}

func TestExtractProperties(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString, schema.GeometryObjectSupportedTypePolygon}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString, schema.GeometryEditorSupportedTypePolygon}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("LineString").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("Name").Key(id.RandomKey()).Multiple(true).MustBuild()
	sf3 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("Polygon").Key(id.RandomKey()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf4 := schema.NewField(tp4).NewID().Name("Age").Key(id.RandomKey()).MustBuild()
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("IsMarried").Key(id.RandomKey()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf2.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)
	fi3 := item.NewField(sf3.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fi4 := item.NewField(sf4.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi5 := item.NewField(sf5.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	s1 := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf2, sf3, sf4, sf5}).Workspace(accountdomain.NewWorkspaceID()).TitleField(sf1.ID().Ref()).Project(pid).MustBuild()
	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi2, fi3, fi4, fi5}).
		Model(mid).
		Thread(tid.Ref()).
		User(uid).
		Integration(nid).
		MustBuild()
	i2 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi3}).
		Model(mid).
		Thread(tid.Ref()).
		User(uid).
		Integration(nid).
		MustBuild()

	// Test with item containing geometry fields and non geometry fields
	properties1 := extractProperties(i1, s1)
	expectedProperties1 := orderedmap.New()

	expectedProperties1.Set("Name", []any{"a", "b", "c"})
	expectedProperties1.Set("Age", int64(30))
	expectedProperties1.Set("IsMarried", true)

	assert.NotNil(t, properties1)
	assert.Equal(t, expectedProperties1, properties1)

	// Test with item containing only geometry fields
	properties3 := extractProperties(i2, s1)
	expectedProperties3 := orderedmap.New()
	assert.NotNil(t, properties3)
	assert.Equal(t, expectedProperties3, properties3)

	// Test with nil item
	properties4 := extractProperties(nil, s1)
	assert.Nil(t, properties4)

	// Test with nil schema
	properties5 := extractProperties(i1, nil)
	assert.Nil(t, properties5)
}

func TestStringToGeometry(t *testing.T) {
	validGeoStringPoint := `
	{
		"type": "Point",
		"coordinates": [139.7112596, 35.6424892]
	}`
	geo, err := stringToGeometry(validGeoStringPoint)
	assert.NoError(t, err)
	assert.NotNil(t, geo)
	assert.Equal(t, GeometryTypePoint, *geo.Type)
	expected := []float64{139.7112596, 35.6424892}
	actual, err := geo.Coordinates.AsPoint()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// Invalid Geometry string
	invalidGeometryString := "InvalidGeometry"
	geo, err = stringToGeometry(invalidGeometryString)
	assert.Error(t, err)
	assert.Nil(t, geo)
}

func TestToGeoJSONProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1, ok1 := toGeoJSONProp(if1)
	assert.Equal(t, "test", s1)
	assert.True(t, ok1)

	var if2 *item.Field
	s2, ok2 := toGeoJSONProp(if2)
	assert.Empty(t, s2)
	assert.False(t, ok2)

	sf3 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if3 := item.NewField(sf3.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)
	s3, ok3 := toGeoJSONProp(if3)
	assert.Equal(t, []any{"a", "b", "c"}, s3)
	assert.True(t, ok3)
}

func TestToGeoJsonSingleValue(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1, ok1 := toGeoJsonSingleValue(if1.Value().First())
	assert.Equal(t, "test", s1)
	assert.True(t, ok1)

	sf2 := schema.NewField(schema.NewTextArea(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if2 := item.NewField(sf2.ID(), value.TypeTextArea.Value("test").AsMultiple(), nil)
	s2, ok2 := toGeoJsonSingleValue(if2.Value().First())
	assert.Equal(t, "test", s2)
	assert.True(t, ok2)

	sf3 := schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	v3 := url.URL{Scheme: "https", Host: "reearth.io"}
	if3 := item.NewField(sf3.ID(), value.TypeURL.Value(v3).AsMultiple(), nil)
	s3, ok3 := toGeoJsonSingleValue(if3.Value().First())
	assert.Equal(t, "https://reearth.io", s3)
	assert.True(t, ok3)

	sf4 := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if4 := item.NewField(sf4.ID(), value.TypeAsset.Value(id.NewAssetID()).AsMultiple(), nil)
	s4, ok4 := toGeoJsonSingleValue(if4.Value().First())
	assert.Empty(t, s4)
	assert.False(t, ok4)

	gid := id.NewGroupID()
	igid := id.NewItemGroupID()
	sf5 := schema.NewField(schema.NewGroup(gid).TypeProperty()).NewID().Key(id.RandomKey()).Multiple(true).MustBuild()
	if5 := item.NewField(sf5.ID(), value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(igid)}), nil)
	s5, ok5 := toGeoJsonSingleValue(if5.Value().First())
	assert.Empty(t, s5)
	assert.False(t, ok5)

	v6 := id.NewItemID()
	sf6 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if6 := item.NewField(sf6.ID(), value.TypeReference.Value(v6).AsMultiple(), nil)
	s6, ok6 := toGeoJsonSingleValue(if6.Value().First())
	assert.Empty(t, s6)
	assert.False(t, ok6)

	v7 := int64(30)
	in7, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp7 := in7.TypeProperty()
	sf7 := schema.NewField(tp7).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if7 := item.NewField(sf7.ID(), value.TypeInteger.Value(v7).AsMultiple(), nil)
	s7, ok7 := toGeoJsonSingleValue(if7.Value().First())
	assert.Equal(t, int64(30), s7)
	assert.True(t, ok7)

	v8 := float64(30.123)
	in8, _ := schema.NewNumber(lo.ToPtr(float64(1)), lo.ToPtr(float64(100)))
	tp8 := in8.TypeProperty()
	sf8 := schema.NewField(tp8).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if8 := item.NewField(sf8.ID(), value.TypeNumber.Value(v8).AsMultiple(), nil)
	s8, ok8 := toGeoJsonSingleValue(if8.Value().First())
	assert.Equal(t, 30.123, s8)
	assert.True(t, ok8)

	v9 := true
	sf9 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if9 := item.NewField(sf9.ID(), value.TypeBool.Value(v9).AsMultiple(), nil)
	s9, ok9 := toGeoJsonSingleValue(if9.Value().First())
	assert.Equal(t, true, s9)
	assert.True(t, ok9)

	v10 := time.Now()
	sf10 := schema.NewField(schema.NewDateTime().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if10 := item.NewField(sf10.ID(), value.TypeDateTime.Value(v10).AsMultiple(), nil)
	s10, ok10 := toGeoJsonSingleValue(if10.Value().First())
	assert.Equal(t, v10.Format(time.RFC3339), s10)
	assert.True(t, ok10)

	var if11 *item.Field
	s11, ok11 := toGeoJsonSingleValue(if11.Value().First())
	assert.Empty(t, s11)
	assert.False(t, ok11)
}
