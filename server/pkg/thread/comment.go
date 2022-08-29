package thread

type Comment struct {
	author  UserID
	content string
}

func (c *Comment) Author() UserID {
	return c.author
}

func (c *Comment) Content() string {
	return c.content
}
