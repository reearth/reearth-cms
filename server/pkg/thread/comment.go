package thread

import (
	"time"
)

type Comment struct {
	id      CommentID
	author  UserID
	content string
}

func NewComment(id CommentID, author UserID, content string) *Comment {
	return &Comment{
		id:      id,
		author:  author,
		content: content,
	}
}

func (c *Comment) ID() CommentID {
	return c.id
}

func (c *Comment) Author() UserID {
	return c.author
}

func (c *Comment) Content() string {
	return c.content
}

func (c *Comment) CreatedAt() time.Time {
	return c.id.Timestamp()
}

func (c *Comment) SetContent(content string) {
	c.content = content
}

func (c *Comment) Clone() *Comment {
	if c == nil {
		return nil
	}

	return &Comment{
		id:      c.id.Clone(),
		author:  c.author.Clone(),
		content: c.content,
	}
}
