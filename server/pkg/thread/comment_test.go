package thread

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestComment_CommentType(t *testing.T) {
	uid := NewUserID()
	m := "xxx"

	got := Comment{
		author:  uid,
		content: m,
	}

	assert.Equal(t, uid, got.Author())
	assert.Equal(t, m, got.Content())
}
