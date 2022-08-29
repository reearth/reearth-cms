package thread

type Comment struct {
	id      CommentID
	author  UserID
	content string
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

func (c *Comment) SetContent(content string) {
	c.content = content
}
