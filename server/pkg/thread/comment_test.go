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
	mocknow := time.Now().Truncate(time.Millisecond)

	got := Comment{
		id:        cid,
		author:    uid,
		content:   c,
		createdAt: mocknow,
	}

	assert.Equal(t, cid, got.ID())
	assert.Equal(t, uid, got.Author())
	assert.Equal(t, c, got.Content())
	assert.Equal(t, mocknow, got.CreatedAt())
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
	mocknow := time.Now().Truncate(time.Millisecond)
	got = &Comment{id: NewCommentID(), createdAt: mocknow}
	assert.Equal(t, got.createdAt, got.CreatedAt())
}
