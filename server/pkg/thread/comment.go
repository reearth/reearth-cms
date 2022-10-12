package thread

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Comment struct {
	id        CommentID
	author    UserID
	content   string
	createdAt time.Time
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

func (c *Comment) SetID(id id.CommentID) {
	c.id = id
}

func (c *Comment) SetAuthor(author id.UserID) {
	c.author = author
}

func (c *Comment) SetContent(content string) {
	c.content = content
}

func (c *Comment) SetCreatedAt(createdAt time.Time) {
	c.createdAt = createdAt
}

func (c *Comment) Clone() *Comment {
	if c == nil {
		return nil
	}

	return &Comment{
		id:        c.id.Clone(),
		author:    c.author.Clone(),
		content:   c.content,
		createdAt: c.createdAt,
	}
}
