package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

func NewComment(c *thread.Comment) *Comment {
	if c == nil {
		return nil
	}

	// authorId holds either a user ID or an integration ID; authorType tells which.
	// Machine and anonymous authors have neither, so both fields are omitted.
	var authorID *string
	var authorType *CommentAuthorType
	if u := c.Author().User(); u != nil {
		authorID, authorType = new(u.String()), new(User)
	} else if i := c.Author().Integration(); i != nil {
		authorID, authorType = new(i.String()), new(Integration)
	}
	return &Comment{
		Id:         c.ID().Ref(),
		AuthorId:   authorID,
		AuthorType: authorType,
		Content:    new(c.Content()),
		CreatedAt:  new(c.CreatedAt()),
	}
}
