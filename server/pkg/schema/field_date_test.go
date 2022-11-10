package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldDate(t *testing.T) {
	b := NewFieldDate()
	assert.Equal(t, &FieldDate{}, b)
}

func TestFieldDate_TypeProperty(t *testing.T) {
	tp := (&FieldDate{}).TypeProperty()
	assert.Equal(t, &TypeProperty{date: &FieldDate{}}, tp)
}

func TestFieldDate_Validate(t *testing.T) {
	assert.Same(t, ErrInvalidValue, (&FieldDate{}).Validate(&value.Value{}))
	assert.NoError(t, (&FieldDate{}).Validate(value.Must(value.TypeDate, time.Now())))
}
