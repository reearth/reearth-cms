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
	return c.id.Timestamp()
}

func (c *Comment) SetContent(content string) {
	c.content = content
}
