package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldMarkdown(t *testing.T) {
	m := lo.ToPtr(0)
	u := NewFieldMarkdown(m)
	assert.Equal(t, &FieldMarkdown{f: &FieldText{maxLength: lo.ToPtr(0)}}, u)
}
