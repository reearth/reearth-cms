package token

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBuilder_Builder(t *testing.T) {
	builder := New()
	builder.Prefix("builder_").Length(8).Charset("0123456789")
	tk, err := builder.Build()
	assert.NoError(t, err)
	assert.Equal(t, "builder_", tk.String()[:8])
	assert.Equal(t, 8+len("builder_"), len(tk.String()))

	// invalid length
	builder = New().Length(0) 
	_, err = builder.Build()
	assert.ErrorIs(t, err, ErrTokenLength)

	// empty charset
	builder = New().Charset("")
	_, err = builder.Build()
	assert.ErrorIs(t, err, ErrEmptyCharset)

	// generate value
	tk,err = New().GenerateValue().Build()
	assert.NotEmpty(t, tk)
	assert.NoError(t, err)

	// must build success
	builder = New().Length(5)
	assert.NotPanics(t, func() {
		tk := builder.MustBuild()
		assert.NotEmpty(t, tk.String())
	})

	// must build panics
	builder = New().Length(0)
	assert.Panics(t, func() {
		builder.MustBuild()
	})
}
