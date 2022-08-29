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

func TestThread_Comments(t *testing.T) {
	var got *Thread = nil
	assert.Nil(t, got.Comments())

	c := []*Comment{}
	got = &Thread{
		comments: c,
	}
	assert.Equal(t, c, got.Comments())
}
