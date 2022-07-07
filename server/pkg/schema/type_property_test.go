package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMatchTypeProperty1(t *testing.T) {
	tt := &TypeProperty{
		text: &FieldText{},
	}

	assert.Equal(t, "text", MatchTypeProperty1(tt, TypePropertyMatch1[string]{
		Text: func(_ *FieldText) string {
			return "text"
		},
	}))
}
