package exporters

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestBuildCSVHeaders(t *testing.T) {

	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(id.RandomKey()).MustBuild()
	sf3 := schema.NewField(schema.MustNewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100))).TypeProperty()).NewID().Name("age").Key(id.NewKey("age")).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(id.NewKey("isMarried")).MustBuild()
	s1 := schema.New().NewID().Fields([]*schema.Field{sf1, sf3, sf4}).Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).MustBuild()
	s2 := schema.New().NewID().Fields([]*schema.Field{sf1, sf2, sf3, sf4}).Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).MustBuild()
	sp1 := schema.NewPackage(s1, nil, nil, nil)
	sp2 := schema.NewPackage(s2, nil, nil, nil)

	// Test with geometry fields
	headers1 := BuildCSVHeaders(sp1)
	assert.Equal(t, []string{"id", "age", "isMarried"}, headers1)

	// Test with mixed fields
	headers2 := BuildCSVHeaders(sp2)
	assert.Equal(t, []string{"id", "age", "isMarried"}, headers2)
}

func TestRowFromItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(id.RandomKey()).MustBuild()
	sf3 := schema.NewField(schema.MustNewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100))).TypeProperty()).NewID().Name("age").Key(id.NewKey("age")).MustBuild()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("isMarried").Key(id.NewKey("isMarried")).MustBuild()
	s := schema.New().ID(sid).Fields([]*schema.Field{sf1, sf2, sf3, sf4}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	sp := schema.NewPackage(s, nil, nil, nil)
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
		Thread(tid.Ref()).
		MustBuild()

	// Test with no fields
	row1, ok1 := RowFromItem(i1, sp)
	assert.True(t, ok1)
	assert.Equal(t, []string{iid.String(), "", ""}, row1)

	// Test with item containing no geometry field
	i2 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi3, fi4}).
		Model(mid).
		Thread(tid.Ref()).
		MustBuild()
	row2, ok2 := RowFromItem(i2, sp)
	assert.True(t, ok2)
	assert.Equal(t, []string{iid.String(), "30", "true"}, row2)

	// Test with item containing multiple fields including a geometry field
	i3 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1, fi2, fi3, fi4}).
		Model(mid).
		Thread(tid.Ref()).
		MustBuild()
	row3, ok3 := RowFromItem(i3, sp)
	assert.True(t, ok3)
	assert.Equal(t, []string{i1.ID().String(), "30", "true"}, row3)
}

func TestToCSVProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1 := toCSVProp(if1)
	assert.Equal(t, "test", s1)

	var if2 *item.Field
	s2 := toCSVProp(if2)
	assert.Empty(t, s2)

	v3 := int64(30)
	in3, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp3 := in3.TypeProperty()
	sf3 := schema.NewField(tp3).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if3 := item.NewField(sf3.ID(), value.TypeInteger.Value(v3).AsMultiple(), nil)
	s3, ok3 := toGeoJsonSingleValue(if3.Value().First())
	assert.Equal(t, int64(30), s3)
	assert.True(t, ok3)

	v4 := true
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if4 := item.NewField(sf4.ID(), value.TypeBool.Value(v4).AsMultiple(), nil)
	s4, ok4 := toGeoJsonSingleValue(if4.Value().First())
	assert.Equal(t, true, s4)
	assert.True(t, ok4)

	v5 := false
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if5 := item.NewField(sf5.ID(), value.TypeBool.Value(v5).AsMultiple(), nil)
	s5, ok5 := toGeoJsonSingleValue(if5.Value().First())
	assert.Equal(t, false, s5)
	assert.True(t, ok5)
}

func TestToCSVValue(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1 := toCSVValue(if1.Value().First())
	assert.Equal(t, "test", s1)

	sf2 := schema.NewField(schema.NewTextArea(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if2 := item.NewField(sf2.ID(), value.TypeTextArea.Value("test").AsMultiple(), nil)
	s2 := toCSVValue(if2.Value().First())
	assert.Equal(t, "test", s2)

	sf3 := schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	v3 := url.URL{Scheme: "https", Host: "reearth.io"}
	if3 := item.NewField(sf3.ID(), value.TypeURL.Value(v3).AsMultiple(), nil)
	s3 := toCSVValue(if3.Value().First())
	assert.Equal(t, "https://reearth.io", s3)

	sf4 := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if4 := item.NewField(sf4.ID(), value.TypeAsset.Value(id.NewAssetID()).AsMultiple(), nil)
	s4 := toCSVValue(if4.Value().First())
	assert.Empty(t, s4)

	gid := id.NewGroupID()
	igid := id.NewItemGroupID()
	sf5 := schema.NewField(schema.NewGroup(gid).TypeProperty()).NewID().Key(id.RandomKey()).Multiple(true).MustBuild()
	if5 := item.NewField(sf5.ID(), value.MultipleFrom(value.TypeGroup, []*value.Value{value.TypeGroup.Value(igid)}), nil)
	s5 := toCSVValue(if5.Value().First())
	assert.Empty(t, s5)

	v6 := id.NewItemID()
	sf6 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	if6 := item.NewField(sf6.ID(), value.TypeReference.Value(v6).AsMultiple(), nil)
	s6 := toCSVValue(if6.Value().First())
	assert.Empty(t, s6)

	v7 := int64(30)
	in7, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp7 := in7.TypeProperty()
	sf7 := schema.NewField(tp7).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if7 := item.NewField(sf7.ID(), value.TypeInteger.Value(v7).AsMultiple(), nil)
	s7 := toCSVValue(if7.Value().First())
	assert.Equal(t, "30", s7)

	v8 := float64(30.123)
	in8, _ := schema.NewNumber(lo.ToPtr(float64(1)), lo.ToPtr(float64(100)))
	tp8 := in8.TypeProperty()
	sf8 := schema.NewField(tp8).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if8 := item.NewField(sf8.ID(), value.TypeNumber.Value(v8).AsMultiple(), nil)
	s8 := toCSVValue(if8.Value().First())
	assert.Equal(t, "30.123", s8)

	v9 := true
	sf9 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if9 := item.NewField(sf9.ID(), value.TypeBool.Value(v9).AsMultiple(), nil)
	s9 := toCSVValue(if9.Value().First())
	assert.Equal(t, "true", s9)

	v10 := time.Now()
	sf10 := schema.NewField(schema.NewDateTime().TypeProperty()).NewID().Name("age").Key(id.RandomKey()).MustBuild()
	if10 := item.NewField(sf10.ID(), value.TypeDateTime.Value(v10).AsMultiple(), nil)
	s10 := toCSVValue(if10.Value().First())
	assert.Equal(t, v10.Format(time.RFC3339), s10)

	var if11 *item.Field
	s11 := toCSVValue(if11.Value().First())
	assert.Empty(t, s11)
}
