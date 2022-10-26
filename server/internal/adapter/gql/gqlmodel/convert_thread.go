package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/samber/lo"
)

func ToThread(th *thread.Thread) *Thread {
	if th == nil {
		return nil
	}

	return &Thread{
		ID:          IDFrom(th.ID()),
		WorkspaceID: IDFrom(th.Workspace()),
		Comments:    lo.Map(th.Comments(), func(c *thread.Comment, _ int) *Comment { return ToComment(c) }),
	}
}

func ToComment(c *thread.Comment) *Comment {
	if c == nil {
		return nil
	}

	return &Comment{
		ID:        IDFrom(c.ID()),
		AuthorID:  IDFrom(c.Author()),
		Content:   c.Content(),
		CreatedAt: c.CreatedAt(),
	}
}
