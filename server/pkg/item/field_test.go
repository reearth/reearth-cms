package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewField(t *testing.T) {
	fId := id.NewFieldID()
	assert.Nil(t, NewField(fId, nil, nil))
	f := NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)
	assert.Equal(t, &Field{
		field: fId,
		value: value.TypeBool.Value(true).AsMultiple(),
	}, f)

	assert.Equal(t, value.TypeBool, f.Type())
}

func TestToGeoJSONProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1, ok1 := if1.ToGeoJSONProp()
	assert.Equal(t, "test", s1)
	assert.True(t, ok1)

	var if2 *Field
	s2, ok2 := if2.ToGeoJSONProp()
	assert.Empty(t, s2)
	assert.False(t, ok2)

	sf3 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if3 := NewField(sf3.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)
	s3, ok3 := if3.ToGeoJSONProp()
	assert.Equal(t, []any{"a", "b", "c"}, s3)
	assert.True(t, ok3)
}

func TestToCSVProp(t *testing.T) {
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	if1 := NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	s1 := if1.ToCSVProp()
	assert.Equal(t, "test", s1)

	var if2 *Field
	s2 := if2.ToCSVProp()
	assert.Empty(t, s2)

	v3 := int64(30)
	in3, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp3 := in3.TypeProperty()
	sf3 := schema.NewField(tp3).NewID().Name("age").Key(key.Random()).MustBuild()
	if3 := NewField(sf3.ID(), value.TypeInteger.Value(v3).AsMultiple(), nil)
	s3, ok3 := if3.Value().First().ToGeoJsonSingleValue()
	assert.Equal(t, int64(30), s3)
	assert.True(t, ok3)

	v4 := true
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if4 := NewField(sf4.ID(), value.TypeBool.Value(v4).AsMultiple(), nil)
	s4, ok4 := if4.Value().First().ToGeoJsonSingleValue()
	assert.Equal(t, true, s4)
	assert.True(t, ok4)

	v5 := false
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("age").Key(key.Random()).MustBuild()
	if5 := NewField(sf5.ID(), value.TypeBool.Value(v5).AsMultiple(), nil)
	s5, ok5 := if5.Value().First().ToGeoJsonSingleValue()
	assert.Equal(t, false, s5)
	assert.True(t, ok5)
}
