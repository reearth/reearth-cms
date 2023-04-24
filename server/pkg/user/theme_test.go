package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTheme_Ref(t *testing.T) {
	th := ThemeDefault
	assert.Equal(t, &th, th.Ref())
	assert.NotSame(t, &th, th.Ref())
}
