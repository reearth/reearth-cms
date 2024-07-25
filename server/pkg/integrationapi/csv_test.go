package integrationapi

import (
	"fmt"
	"testing"

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
	expectErr2 := pointFieldIsNotSupportedError
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
	expectErr3 := pointFieldIsNotSupportedError
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

	var if2 *item.Field
	s2, ok2 := toCSVProp(if2)
	assert.Empty(t, s2)
	assert.False(t, ok2)
}
