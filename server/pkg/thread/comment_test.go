package thread

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestComment_CommentType(t *testing.T) {
	cid := NewCommentID()
	uid := NewUserID()
	c := "xxx"

	got := Comment{
		id:      cid,
		author:  uid,
		content: c,
	}

	assert.Equal(t, cid, got.ID())
	assert.Equal(t, uid, got.Author())
	assert.Equal(t, c, got.Content())
}

func TestComment_SetContent(t *testing.T) {
	c := "xxx"
	got := Comment{}

	got.SetContent(c)
	assert.Equal(t, got.Content(), c)
}
