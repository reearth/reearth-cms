package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/samber/lo"
)

func ToComment(c *thread.Comment) *Comment {
	if c == nil {
		return nil
	}

	return &Comment{
		Id:        c.ID().Ref(),
		AuthorId:  c.Author().Ref(),
		Content:   lo.ToPtr(c.Content()),
		CreatedAt: ToDate(c.CreatedAt()),
	}
}
