package value

import (
	"encoding/json"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInteger_New(t *testing.T) {
	var vfloat64 float64
	var vfloat32 float32
	var vint int
	var vint8 int8
	var vint16 int16
	var vint32 int32
	var vint64 int64
	var vuint uint
	var vuint8 uint8
	var vuint16 uint16
	var vuint32 uint32
	var vuint64 uint64
	var vuintptr uintptr
	var vjson json.Number

	v, err := (&integer{}).New(vfloat64)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vfloat64))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vfloat32)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vfloat32))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vint)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vint))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vint8)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vint8))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vint16)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vint16))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vint32)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vint32))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vint64)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vint64))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuint)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuint))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuint8)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuint8))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuint16)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuint16))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuint32)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuint32))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuint64)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuint64))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(vuintptr)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(vuintptr))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, _ = (&integer{}).New(vjson)
	assert.Equal(t, nil, v)

	v, _ = (&integer{}).New(lo.ToPtr(vjson))
	assert.Equal(t, nil, v)

	v, err = (&integer{}).New("123")
	assert.NoError(t, err)
	assert.Equal(t, int64(123), v)

	v, err = (&integer{}).New(lo.ToPtr("123"))
	assert.NoError(t, err)
	assert.Equal(t, int64(123), v)

	v, err = (&integer{}).New(true)
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(false)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), v)

	v, err = (&integer{}).New(lo.ToPtr(true))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(nil)
	assert.Same(t, err, ErrInvalidValue)
	assert.Nil(t, v)
}

func TestInteger_ValueInteger(t *testing.T) {
	var vint64 int64
	v := (&Value{t: TypeInteger, v: vint64}).ValueInteger()
	assert.Equal(t, lo.ToPtr(vint64), v)
}
