package exporters

import (
	"io"
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestCSVFromItems(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(key.Random()).MustBuild()
	sf3 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(key.Random()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf4 := schema.NewField(tp4).NewID().Name("age").Key(key.Random()).MustBuild()
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(key.Random()).MustBuild()
	s1 := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf3, sf4, sf5}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf3.ID(), value.TypeGeometryEditor.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fi3 := item.NewField(sf4.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi4 := item.NewField(sf5.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi2, fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()
	v1 := version.New()
	vi1 := version.MustBeValue(v1, nil, version.NewRefs(version.Latest), util.Now(), i1)

	// with geometry fields
	ver1 := item.VersionedList{vi1}
	_, pw := io.Pipe()
	err := CSVFromItems(pw, ver1, s1)
	assert.Nil(t, err)

	// no geometry fields
	iid2 := id.NewItemID()
	sid2 := id.NewSchemaID()
	mid2 := id.NewModelID()
	tid2 := id.NewThreadID()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s2 := schema.New().ID(sid).Fields([]*schema.Field{sf2}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	i2 := item.New().
		ID(iid2).
		Schema(sid2).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf2.ID(), value.TypeText.Value("test").AsMultiple(), nil)}).
		Model(mid2).
		Thread(tid2).
		MustBuild()
	v2 := version.New()
	vi2 := version.MustBeValue(v2, nil, version.NewRefs(version.Latest), util.Now(), i2)
	ver2 := item.VersionedList{vi2}
	expectErr2 := pointFieldIsNotSupportedError
	_, pw1 := io.Pipe()
	err = CSVFromItems(pw1, ver2, s2)
	assert.Equal(t, expectErr2, err)

	// point field is not supported
	iid3 := id.NewItemID()
	sid3 := id.NewSchemaID()
	mid3 := id.NewModelID()
	tid3 := id.NewThreadID()
	gst2 := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypeLineString, schema.GeometryObjectSupportedTypePolygon}
	sf6 := schema.NewField(schema.NewGeometryObject(gst2).TypeProperty()).NewID().Name("geo3").Key(key.Random()).MustBuild()
	s3 := schema.New().ID(sid).Fields([]*schema.Field{sf6}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	i3 := item.New().
		ID(iid3).
		Schema(sid3).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf6.ID(), value.TypeText.Value("{\n  \"coordinates\": [\n    [\n      139.65439725962517,\n      36.34793305387103\n    ],\n    [\n      139.61688622815393,\n      35.910803456352724\n    ]\n  ],\n  \"type\": \"LineString\"\n}").AsMultiple(), nil)}).
		Model(mid3).
		Thread(tid3).
		MustBuild()
	v3 := version.New()
	vi3 := version.MustBeValue(v3, nil, version.NewRefs(version.Latest), util.Now(), i3)
	ver3 := item.VersionedList{vi3}
	expectErr3 := pointFieldIsNotSupportedError
	_, pw2 := io.Pipe()
	err = CSVFromItems(pw2, ver3, s3)
	assert.Equal(t, expectErr3, err)
}

func TestBuildCSVHeaders(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(key.Random()).MustBuild()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(key.Random()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf3 := schema.NewField(tp4).NewID().Name("age").Key(key.Random()).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(key.Random()).MustBuild()
	s1 := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf3, sf4}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	s2 := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf2, sf3, sf4}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()

	// Test with geometry fields
	headers1, ff := buildCSVHeaders(s1)
	assert.Equal(t, []string{"id", "location_lat", "location_lng", "age", "isMarried"}, headers1)
	assert.Equal(t, []*schema.Field{sf3, sf4}, ff)

	// Test with mixed fields
	headers2, _ := buildCSVHeaders(s2)
	assert.Equal(t, []string{"id", "location_lat", "location_lng", "age", "isMarried"}, headers2)
	assert.Equal(t, []*schema.Field{sf3, sf4}, ff)
}

func TestRowFromItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(key.Random()).MustBuild()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(key.Random()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf3 := schema.NewField(tp4).NewID().Name("age").Key(key.Random()).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(key.Random()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf2.ID(), value.TypeGeometryEditor.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fi3 := item.NewField(sf3.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi4 := item.NewField(sf4.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{}).
		Model(mid).
		Thread(tid).
		MustBuild()

	// Test with no fields
	row1, ok1 := rowFromItem(i1, []*schema.Field{sf3, sf4})
	assert.False(t, ok1)
	assert.Nil(t, row1)

	// Test with item containing no geometry field
	i2 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()
	row2, ok2 := rowFromItem(i2, []*schema.Field{sf3, sf4})
	assert.False(t, ok2)
	assert.Nil(t, row2)

	// Test with item containing multiple fields including a geometry field
	i3 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi2, fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()
	row3, ok3 := rowFromItem(i3, []*schema.Field{sf3, sf4})
	assert.True(t, ok3)
	assert.Equal(t, []string{i1.ID().String(), "139.28179282584915", "36.58570985749664", "30", "true"}, row3)
}

func TestExtractFirstPointField(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(key.Random()).MustBuild()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(key.Random()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf3 := schema.NewField(tp4).NewID().Name("age").Key(key.Random()).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(key.Random()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fi2 := item.NewField(sf2.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fi3 := item.NewField(sf3.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi4 := item.NewField(sf4.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()
	i2 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()
	i3 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi2, fi3, fi4}).
		Model(mid).
		Thread(tid).
		MustBuild()

	// Test with valid geometry field
	point1, err1 := extractFirstPointField(i1)
	assert.NoError(t, err1)
	assert.Equal(t, []float64{139.28179282584915, 36.58570985749664}, point1)

	// Test with no geometry field
	point2, err2 := extractFirstPointField(i2)
	assert.Error(t, err2)
	assert.Equal(t, noPointFieldError, err2)
	assert.Nil(t, point2)

	// Test with non-point geometry field
	point3, err3 := extractFirstPointField(i3)
	assert.Error(t, err3)
	assert.Equal(t, noPointFieldError, err3)
	assert.Nil(t, point3)
}

func TestToCSVProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1 := ToCSVProp(if1)
	assert.Equal(t, "test", s1)

	var if2 *item.Field
	s2 := ToCSVProp(if2)
	assert.Empty(t, s2)

	v3 := int64(30)
	in3, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp3 := in3.TypeProperty()
	sf3 := schema.NewField(tp3).NewID().Name("age").Key(key.Random()).MustBuild()
	if3 := item.NewField(sf3.ID(), value.TypeInteger.Value(v3).AsMultiple(), nil)
	s3, ok3 := ToGeoJsonSingleValue(if3.Value().First())
	assert.Equal(t, int64(30), s3)
	assert.True(t, ok3)

	v4 := true
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if4 := item.NewField(sf4.ID(), value.TypeBool.Value(v4).AsMultiple(), nil)
	s4, ok4 := ToGeoJsonSingleValue(if4.Value().First())
	assert.Equal(t, true, s4)
	assert.True(t, ok4)

	v5 := false
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if5 := item.NewField(sf5.ID(), value.TypeBool.Value(v5).AsMultiple(), nil)
	s5, ok5 := ToGeoJsonSingleValue(if5.Value().First())
	assert.Equal(t, false, s5)
	assert.True(t, ok5)
}

func TestToCSVValue(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1 := ToCSVValue(if1.Value().First())
	assert.Equal(t, "test", s1)

	sf2 := schema.NewField(schema.NewTextArea(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if2 := item.NewField(sf2.ID(), value.TypeTextArea.Value("test").AsMultiple(), nil)
	s2 := ToCSVValue(if2.Value().First())
	assert.Equal(t, "test", s2)

	sf3 := schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	v3 := url.URL{Scheme: "https", Host: "reearth.io"}
	if3 := item.NewField(sf3.ID(), value.TypeURL.Value(v3).AsMultiple(), nil)
	s3 := ToCSVValue(if3.Value().First())
	assert.Equal(t, "https://reearth.io", s3)

	sf4 := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if4 := item.NewField(sf4.ID(), value.TypeAsset.Value(id.NewAssetID()).AsMultiple(), nil)
	s4 := ToCSVValue(if4.Value().First())
	assert.Empty(t, s4)

	gid := id.NewGroupID()
	igid := id.NewItemGroupID()
	sf5 := schema.NewField(schema.NewGroup(gid).TypeProperty()).NewID().Key(key.Random()).Multiple(true).MustBuild()
	if5 := item.NewField(sf5.ID(), value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(igid)}), nil)
	s5 := ToCSVValue(if5.Value().First())
	assert.Empty(t, s5)

	v6 := id.NewItemID()
	sf6 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if6 := item.NewField(sf6.ID(), value.TypeReference.Value(v6).AsMultiple(), nil)
	s6 := ToCSVValue(if6.Value().First())
	assert.Empty(t, s6)

	v7 := int64(30)
	in7, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp7 := in7.TypeProperty()
	sf7 := schema.NewField(tp7).NewID().Name("age").Key(key.Random()).MustBuild()
	if7 := item.NewField(sf7.ID(), value.TypeInteger.Value(v7).AsMultiple(), nil)
	s7 := ToCSVValue(if7.Value().First())
	assert.Equal(t, "30", s7)

	v8 := float64(30.123)
	in8, _ := schema.NewNumber(lo.ToPtr(float64(1)), lo.ToPtr(float64(100)))
	tp8 := in8.TypeProperty()
	sf8 := schema.NewField(tp8).NewID().Name("age").Key(key.Random()).MustBuild()
	if8 := item.NewField(sf8.ID(), value.TypeNumber.Value(v8).AsMultiple(), nil)
	s8 := ToCSVValue(if8.Value().First())
	assert.Equal(t, "30.123", s8)

	v9 := true
	sf9 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if9 := item.NewField(sf9.ID(), value.TypeBool.Value(v9).AsMultiple(), nil)
	s9 := ToCSVValue(if9.Value().First())
	assert.Equal(t, "true", s9)

	v10 := time.Now()
	sf10 := schema.NewField(schema.NewDateTime().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if10 := item.NewField(sf10.ID(), value.TypeDateTime.Value(v10).AsMultiple(), nil)
	s10 := ToCSVValue(if10.Value().First())
	assert.Equal(t, v10.Format(time.RFC3339), s10)

	var if11 *item.Field
	s11 := ToCSVValue(if11.Value().First())
	assert.Empty(t, s11)
}
