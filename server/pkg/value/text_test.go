package value

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestText_New(t *testing.T) {
	v, err := (&text{}).New(("aaa"))
	assert.NoError(t, err)
	assert.Equal(t, "aaa", v)

	v, err = (&text{}).New((lo.ToPtr("aaa")))
	assert.NoError(t, err)
	assert.Equal(t, "aaa", v)

	v, err = (&text{}).New(lo.ToPtr("aaa"))
	assert.NoError(t, err)
	assert.Equal(t, "aaa", v)

	v, err = (&text{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestText_ValueText(t *testing.T) {
	v := (&Value{t: TypeText, v: "aaa"}).ValueText()
	assert.Equal(t, lo.ToPtr("aaa"), v)

	v = (&Value{}).ValueMarkdown()
	assert.Nil(t, v)
}

func TestText_ValueTextArea(t *testing.T) {
	v := (&Value{t: TypeTextArea, v: "aaa"}).ValueTextArea()
	assert.Equal(t, lo.ToPtr("aaa"), v)

	v = (&Value{}).ValueTextArea()
	assert.Nil(t, v)
}

func TestText_ValueRichText(t *testing.T) {
	v := (&Value{t: TypeRichText, v: "aaa"}).ValueRichText()
	assert.Equal(t, lo.ToPtr("aaa"), v)

	v = (&Value{}).ValueRichText()
	assert.Nil(t, v)
}

func TestText_ValueMarkdown(t *testing.T) {
	v := (&Value{t: TypeMarkdown, v: "aaa"}).ValueMarkdown()
	assert.Equal(t, lo.ToPtr("aaa"), v)

	v = (&Value{}).ValueMarkdown()
	assert.Nil(t, v)
}
