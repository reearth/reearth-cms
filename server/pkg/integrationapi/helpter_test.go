package integrationapi

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToSingleValue(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := item.NewField(sf1.ID(), value.TypeText.Value("Nour").AsMultiple(), nil)
	s1, ok1 := toSingleValue(if1.Value().First())
	assert.Equal(t, "Nour", s1)
	assert.True(t, ok1)

	sf2 := schema.NewField(schema.NewTextArea(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if2 := item.NewField(sf2.ID(), value.TypeTextArea.Value("Nour").AsMultiple(), nil)
	s2, ok2 := toSingleValue(if2.Value().First())
	assert.Equal(t, "Nour", s2)
	assert.True(t, ok2)

	sf3 := schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	v3 := url.URL{Scheme: "https", Host: "reearth.io"}
	if3 := item.NewField(sf3.ID(), value.TypeURL.Value(v3).AsMultiple(), nil)
	s3, ok3 := toSingleValue(if3.Value().First())
	assert.Equal(t, "https://reearth.io", s3)
	assert.True(t, ok3)

	sf4 := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	v4 := id.NewAssetID()
	if4 := item.NewField(sf4.ID(), value.TypeAsset.Value(v4).AsMultiple(), nil)
	s4, ok4 := toSingleValue(if4.Value().First())
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
	s6, ok6 := toSingleValue(if6.Value().First())
	assert.Equal(t, v6.String(), s6)
	assert.True(t, ok6)

	v7 := int64(30)
	in7, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp7 := in7.TypeProperty()
	sf7 := schema.NewField(tp7).NewID().Name("age").Key(key.Random()).MustBuild()
	if7 := item.NewField(sf7.ID(), value.TypeInteger.Value(v7).AsMultiple(), nil)
	s7, ok7 := toSingleValue(if7.Value().First())
	assert.Equal(t, "30", s7)
	assert.True(t, ok7)

	v8 := float64(30.123)
	in8, _ := schema.NewNumber(lo.ToPtr(float64(1)), lo.ToPtr(float64(100)))
	tp8 := in8.TypeProperty()
	sf8 := schema.NewField(tp8).NewID().Name("age").Key(key.Random()).MustBuild()
	if8 := item.NewField(sf8.ID(), value.TypeNumber.Value(v8).AsMultiple(), nil)
	s8, ok8 := toSingleValue(if8.Value().First())
	assert.Equal(t, "30.123", s8)
	assert.True(t, ok8)

	v9 := true
	sf9 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if9 := item.NewField(sf9.ID(), value.TypeBool.Value(v9).AsMultiple(), nil)
	s9, ok9 := toSingleValue(if9.Value().First())
	assert.Equal(t, "true", s9)
	assert.True(t, ok9)

	v10 := time.Now()
	sf10 := schema.NewField(schema.NewDateTime().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if10 := item.NewField(sf10.ID(), value.TypeDateTime.Value(v10).AsMultiple(), nil)
	s10, ok10 := toSingleValue(if10.Value().First())
	assert.Equal(t, v10.Format(time.RFC3339), s10)
	assert.True(t, ok10)

	var if11 *item.Field
	s11, ok11 := toSingleValue(if11.Value().First())
	assert.Empty(t, s11)
	assert.False(t, ok11)
}

func TestStringToGeometry(t *testing.T) {
	validGeoStringPoint := `
	{
		"type": "Point",
		"coordinates": [139.7112596, 35.6424892]
	}`
	geo, err := StringToGeometry(validGeoStringPoint)
	assert.NoError(t, err)
	assert.NotNil(t, geo)
	assert.Equal(t, GeometryTypePoint, *geo.Type)
	expected := []float64{139.7112596, 35.6424892}
	actual, err := geo.Coordinates.AsPoint()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// Invalid Geometry string
	invalidGeometryString := "InvalidGeometry"
	geo, err = StringToGeometry(invalidGeometryString)
	assert.Error(t, err)
	assert.Nil(t, geo)
}
