package thread

import "time"

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
	if c == nil {
		return time.Time{}
	}

	return c.createdAt
}

func (c *Comment) SetContent(content string) {
	c.content = content
}
