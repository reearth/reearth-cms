package value

import (
	"encoding/json"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInteger_New(t *testing.T) {
	v, err := (&integer{}).New(float64(1.1))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(lo.ToPtr(float64(1.1)))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(float32(1.1))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(lo.ToPtr(float32(1.1)))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), v)

	v, err = (&integer{}).New(100)
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(int8(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(int8(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(int16(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(int16(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(int32(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(int32(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(int64(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(int64(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uint(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uint(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uint8(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uint8(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uint16(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uint16(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uint32(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uint32(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uint64(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uint64(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(uintptr(100))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, err = (&integer{}).New(lo.ToPtr(uintptr(100)))
	assert.NoError(t, err)
	assert.Equal(t, int64(100), v)

	v, _ = (&integer{}).New(json.Number("100"))
	assert.Equal(t, int64(100), v)

	v, _ = (&integer{}).New(lo.ToPtr(json.Number("100")))
	assert.Equal(t, int64(100), v)

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
	v := (&Value{t: TypeInteger, v: int64(100)}).ValueInteger()
	assert.Equal(t, lo.ToPtr(int64(100)), v)

	v = (&Value{}).ValueInteger()
	assert.Nil(t, v)
}
