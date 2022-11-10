package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldRichText(t *testing.T) {
	ml := 123
	b := NewFieldRichText(&ml)
	assert.Equal(t, &FieldRichText{f: &FieldText{maxLength: lo.ToPtr(ml)}}, b)
}
