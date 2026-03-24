package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVisibility_String(t *testing.T) {
	assert.Equal(t, "private", VisibilityPrivate.String())
	assert.Equal(t, "public", VisibilityPublic.String())
	assert.Equal(t, "public", Visibility("custom").String())
}
