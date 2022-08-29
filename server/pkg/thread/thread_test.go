package thread

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestThread_ThreadType(t *testing.T) {
	thid := NewID()
	c := []*Comment{}

	got := Thread{
		id:       thid,
		comments: c,
	}

	assert.Equal(t, thid, got.ID())
	assert.Equal(t, c, got.Comments())
}
