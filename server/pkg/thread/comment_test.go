package thread

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestComment_CommentType(t *testing.T) {
	cid := NewCommentID()
	uid := NewUserID()
	c := "xxx"
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")

	got := Comment{
		id:        cid,
		author:    uid,
		content:   c,
		createdAt: tim,
	}

	assert.Equal(t, cid, got.ID())
	assert.Equal(t, uid, got.Author())
	assert.Equal(t, c, got.Content())
	assert.Equal(t, tim, got.CreatedAt())
}

func TestComment_SetContent(t *testing.T) {
	comment := Comment{}
	comment.SetContent("xxx")
	assert.Equal(t, "xxx", comment.content)
}

func TestComment_CreatedAt(t *testing.T) {
	var got *Comment = nil
	assert.Equal(t, time.Time{}, got.CreatedAt())
	got = &Comment{id: NewCommentID()}
	assert.Equal(t, got.id.Timestamp(), got.CreatedAt())

}
