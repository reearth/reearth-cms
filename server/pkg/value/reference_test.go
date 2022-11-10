package value

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestReference_New(t *testing.T) {
	want := id.MustItemID("01ggrrt8aya669r0xaemt2djx7")

	v, err := (&reference{}).New("01ggrrt8aya669r0xaemt2djx7")
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&reference{}).New(lo.ToPtr(want))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&reference{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&reference{}).New(lo.ToPtr("01ggrrt8aya669r0xaemt2djx7"))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&reference{}).New(nil)
	assert.Same(t, err, ErrInvalidValue)
	assert.Nil(t, v)
}

func TestReference_ValueReference(t *testing.T) {
	v := (&Value{t: TypeReference, v: id.MustItemID("01ggrrt8aya669r0xaemt2djx7")}).ValueReference()
	assert.Equal(t, id.MustItemID("01ggrrt8aya669r0xaemt2djx7").Ref(), v)

	v = (&Value{}).ValueReference()
	assert.Nil(t, v)
}
