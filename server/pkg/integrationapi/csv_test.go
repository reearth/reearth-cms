package integrationapi

import (
	"fmt"
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
	csvString, err := CSVFromItems(ver1, s1)
	expected1 := fmt.Sprintf("id,location_lat,location_lng,age,isMarried\n%s,139.28179282584915,36.58570985749664,30,true\n", vi1.Value().ID())
	assert.Nil(t, err)
	assert.Equal(t, expected1, csvString)

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
	expectErr2 := noPointFieldError
	csvString, err = CSVFromItems(ver2, s2)
	assert.Equal(t, expectErr2, err)
	assert.Empty(t, csvString)

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
	expectErr3 := noPointFieldError
	csvString, err = CSVFromItems(ver3, s3)
	assert.Equal(t, expectErr3, err)
	assert.Empty(t, csvString)
}

func TestToCSVProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("Nour").AsMultiple(), nil)
	s1, ok1 := toCSVProp(if1)
	assert.Equal(t, "Nour", s1)
	assert.True(t, ok1)

	sf2 := schema.NewField(schema.NewTextArea(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if2 := item.NewField(sf2.ID(), value.TypeTextArea.Value("Nour").AsMultiple(), nil)
	s2, ok2 := toCSVProp(if2)
	assert.Equal(t, "Nour", s2)
	assert.True(t, ok2)

	sf3 := schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	v3 := url.URL{Scheme: "https", Host: "reearth.io"}
	if3 := item.NewField(sf3.ID(), value.TypeURL.Value(v3).AsMultiple(), nil)
	s3, ok3 := toCSVProp(if3)
	assert.Equal(t, "https://reearth.io", s3)
	assert.True(t, ok3)

	sf4 := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	v4 := id.NewAssetID()
	if4 := item.NewField(sf4.ID(), value.TypeAsset.Value(v4).AsMultiple(), nil)
	s4, ok4 := toCSVProp(if4)
	assert.Equal(t, v4.String(), s4)
	assert.True(t, ok4)

	// v5 := id.NewGroupID()
	// sf5 := schema.NewField(schema.NewGroup(v5).TypeProperty()).NewID().Key(key.Random()).Multiple(true).MustBuild()
	// if5 := item.NewField(sf5.ID(), value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(v5)}), nil)
	// s5, ok5 := toString(if5)
	// assert.Equal(t, v5.String(), s5)
	// assert.True(t, ok5)

	v6 := id.NewItemID()
	sf6 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if6 := item.NewField(sf6.ID(), value.TypeReference.Value(v6).AsMultiple(), nil)
	s6, ok6 := toCSVProp(if6)
	assert.Equal(t, v6.String(), s6)
	assert.True(t, ok6)

	v7 := int64(30)
	in7, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp7 := in7.TypeProperty()
	sf7 := schema.NewField(tp7).NewID().Name("age").Key(key.Random()).MustBuild()
	if7 := item.NewField(sf7.ID(), value.TypeInteger.Value(v7).AsMultiple(), nil)
	s7, ok7 := toCSVProp(if7)
	assert.Equal(t, "30", s7)
	assert.True(t, ok7)

	v8 := float64(30.123)
	in8, _ := schema.NewNumber(lo.ToPtr(float64(1)), lo.ToPtr(float64(100)))
	tp8 := in8.TypeProperty()
	sf8 := schema.NewField(tp8).NewID().Name("age").Key(key.Random()).MustBuild()
	if8 := item.NewField(sf8.ID(), value.TypeNumber.Value(v8).AsMultiple(), nil)
	s8, ok8 := toCSVProp(if8)
	assert.Equal(t, "30.123", s8)
	assert.True(t, ok8)

	v9 := true
	sf9 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if9 := item.NewField(sf9.ID(), value.TypeBool.Value(v9).AsMultiple(), nil)
	s9, ok9 := toCSVProp(if9)
	assert.Equal(t, "true", s9)
	assert.True(t, ok9)

	v10 := time.Now()
	sf10 := schema.NewField(schema.NewDateTime().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if10 := item.NewField(sf10.ID(), value.TypeDateTime.Value(v10).AsMultiple(), nil)
	s10, ok10 := toCSVProp(if10)
	assert.Equal(t, v10.Format(time.RFC3339), s10)
	assert.True(t, ok10)

	var if11 *item.Field
	s11, ok11 := toCSVProp(if11)
	assert.Empty(t, s11)
	assert.False(t, ok11)
}
