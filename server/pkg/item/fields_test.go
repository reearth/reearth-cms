package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFields_Map(t *testing.T) {
	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()

	f := Fields{
		NewField(fId1, value.TypeText.Value("value1").AsMultiple()),
		NewField(fId2, value.TypeText.Value("value2").AsMultiple()),
		NewField(fId3, value.TypeText.Value("value3").AsMultiple()),
		NewField(fId4, value.TypeText.Value("value4").AsMultiple()),
	}

	assert.Equal(t, FieldMap{
		fId1: f[0],
		fId2: f[1],
		fId3: f[2],
		fId4: f[3],
	}, f.Map())
}

func TestFields_Field(t *testing.T) {
	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()

	f := Fields{
		NewField(fId1, value.TypeText.Value("value1").AsMultiple()),
		NewField(fId2, value.TypeText.Value("value2").AsMultiple()),
		NewField(fId3, value.TypeText.Value("value3").AsMultiple()),
		NewField(fId4, value.TypeText.Value("value4").AsMultiple()),
	}

	assert.Equal(t, f[0], f.Field(fId1))
}
