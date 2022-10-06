package thread

import (
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Thread struct {
	id        ID
	workspace WorkspaceID
	comments  []*Comment
}

func (th *Thread) ID() ID {
	return th.id
}

func (th *Thread) Workspace() WorkspaceID {
	return th.workspace
}

func (th *Thread) Comments() []*Comment {
	if th == nil {
		return nil
	}
	return slices.Clone(th.comments)
}

func (th *Thread) HasComment(cid CommentID) bool {
	if th == nil {
		return false
	}
	return lo.SomeBy(th.comments, func(c *Comment) bool { return c.ID() == cid })
}

func (th *Thread) AddComment(c Comment) {
	if th.comments == nil {
		th.comments = []*Comment{}
	}
	if th.HasComment(c.ID()) {
		return
	}
	th.comments = append(th.comments, &c)
}

func (th *Thread) SetComments(comments ...*Comment) {
	th.comments = slices.Clone(comments)
}
