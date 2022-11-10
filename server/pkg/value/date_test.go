package value

import (
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestDate_New(t *testing.T) {
	v, err := (&date{}).New(time.Time{})
	assert.NoError(t, err)
	assert.Equal(t, time.Time{}, v)

	v, err = (&date{}).New(&time.Time{})
	assert.NoError(t, err)
	assert.Equal(t, time.Time{}, v)

	assert.NoError(t, err)
	assert.Equal(t, time.Time{}, v)

	v, err = (&date{}).New(lo.ToPtr("0001-01-01T00:00:00Z"))
	assert.NoError(t, err)
	assert.Equal(t, time.Time{}, v)

	v, err = (&date{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&date{}).New((*int64)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&date{}).New(int64(123))
	assert.NoError(t, err)
	assert.Equal(t, time.UnixMilli(123), v)

	v, err = (&date{}).New(nil)
	assert.Same(t, err, ErrInvalidValue)
	assert.Nil(t, v)
}

func TestDate_Valuedate(t *testing.T) {
	want := time.Now()
	v := (&Value{t: TypeDate, v: want}).ValueDate()
	assert.Equal(t, &want, v)

	v = (&Value{}).ValueDate()
	assert.Nil(t, v)
}
