package item

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStatusFrom(t *testing.T) {
	input := "Draft"
	want := StatusDraft
	assert.Equal(t, want, StatusFrom(input))
	assert.Equal(t, "", StatusFrom("xxx").String())
}
