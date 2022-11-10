package value

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestText_New(t *testing.T) {
	var w string
	v, err := (&text{}).New((w))
	assert.NoError(t, err)
	assert.Equal(t, "", v)

	v, err = (&text{}).New((lo.ToPtr(w)))
	assert.NoError(t, err)
	assert.Equal(t, "", v)

	v, err = (&text{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&text{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestText_ValueText(t *testing.T) {
	var want string
	v := (&Value{t: TypeText, v: want}).ValueText()
	assert.Equal(t, &want, v)
}

func TestText_ValueTextArea(t *testing.T) {
	var want string
	v := (&Value{t: TypeTextArea, v: want}).ValueTextArea()
	assert.Equal(t, &want, v)
}

func TestText_ValueRichText(t *testing.T) {
	var want string
	v := (&Value{t: TypeRichText, v: want}).ValueRichText()
	assert.Equal(t, &want, v)
}

func TestText_ValueMarkdownText(t *testing.T) {
	var want string
	v := (&Value{t: TypeMarkdown, v: want}).ValueMarkdownText()
	assert.Equal(t, &want, v)
}
