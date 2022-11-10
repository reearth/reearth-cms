package value

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestAsset_New(t *testing.T) {
	want := id.MustAssetID("01ggrrt8aya669r0xaemt2djx7")

	v, err := (&asset{}).New("01ggrrt8aya669r0xaemt2djx7")
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&asset{}).New(id.MustAssetID("01ggrrt8aya669r0xaemt2djx7"))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&asset{}).New(lo.ToPtr("01ggrrt8aya669r0xaemt2djx7"))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&asset{}).New(id.MustAssetID("01ggrrt8aya669r0xaemt2djx7").Ref())
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&asset{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&asset{}).New((*id.AssetID)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&asset{}).New("01ggrrt8aya669r0xaemt2djx7_")
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)

	v, err = (&asset{}).New(true)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestAsset_ValueAsset(t *testing.T) {
	want := id.MustAssetID("01ggrrt8aya669r0xaemt2djx7")
	v := (&Value{t: TypeAsset, v: want}).ValueAsset()
	assert.Equal(t, &want, v)
}
