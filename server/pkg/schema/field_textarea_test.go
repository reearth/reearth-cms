package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldTextArea(t *testing.T) {
	m := lo.ToPtr(123)
	u := NewFieldTextArea(m)
	assert.Equal(t, &FieldTextArea{f: &FieldText{maxLength: lo.ToPtr(123)}}, u)
}
