package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewDateTime(t *testing.T) {
	assert.Equal(t, &FieldDateTime{isTimeRange: true}, NewDateTime(true))
}

func TestFieldDateTime_Type(t *testing.T) {
	assert.Equal(t, value.TypeDateTime, (&FieldDateTime{}).Type())
}

func TestFieldDateTime_TypeProperty(t *testing.T) {
	f := FieldDateTime{}
	assert.Equal(t, &TypeProperty{
		t:        f.Type(),
		dateTime: &f,
	}, (&f).TypeProperty())
}

func TestFieldDateTime_Clone(t *testing.T) {
	assert.Nil(t, (*FieldDateTime)(nil).Clone())
	assert.Equal(t, &FieldDateTime{}, (&FieldDateTime{}).Clone())
}

func TestFieldDateTime_Validate(t *testing.T) {
	now := time.Now()
	assert.NoError(t, (&FieldDateTime{}).Validate(value.TypeDateTime.Value([]time.Time{now, now.Add(1234)})))
	assert.Equal(t, ErrInvalidValue, (&FieldDateTime{}).Validate(value.TypeText.Value("")))
	assert.Equal(t, ErrInvalidValue, (&FieldDateTime{isTimeRange: true}).Validate(value.TypeDateTime.Value([]time.Time{now.Add(1234), now})))
}
