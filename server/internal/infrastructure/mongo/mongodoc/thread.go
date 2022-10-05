package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type ThreadDocument struct {
	ID        string
	Workspace string
	Comments  []*Comment
}

type Comment struct {
	ID        string
	Author    string
	Content   string
	CreatedAt time.Time
}

type ThreadConsumer = mongox.SliceFuncConsumer[*ThreadDocument, *thread.Thread]

func NewThreadConsumer() *ThreadConsumer {
	return NewComsumer[*ThreadDocument, *thread.Thread]()
}

func NewThread(a *thread.Thread) (*ThreadDocument, string) {
	thid := a.ID().String()
	comments := lo.Map(a.Comments(), func(c *thread.Comment, _ int) *Comment { return ToComment(c) })
	thd, id := &ThreadDocument{
		ID:        thid,
		Workspace: a.Workspace().String(),
		Comments:  comments,
	}, thid

	return thd, id
}

func (d *ThreadDocument) Model() (*thread.Thread, error) {
	thid, err := id.ThreadIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	wid, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	comments := lo.Map(d.Comments, func(c *Comment, _ int) *thread.Comment {
		return FromComment(c)
	})

	return thread.New().
		ID(thid).
		Workspace(wid).
		Comments(comments).
		Build()
}

func ToComment(c *thread.Comment) *Comment {
	if c == nil {
		return nil
	}

	return &Comment{
		ID:        c.ID().String(),
		Author:    c.Author().String(),
		Content:   c.Content(),
		CreatedAt: c.CreatedAt(),
	}
}

func FromComment(c *Comment) *thread.Comment {
	if c == nil {
		return nil
	}

	cid, err := id.CommentIDFrom(c.ID)
	if err != nil {
		return nil
	}

	uid, err := id.UserIDFrom(c.Author)
	if err != nil {
		return nil
	}

	thc := thread.Comment{}
	thc.SetID(cid)
	thc.SetAuthor(uid)
	thc.SetContent(c.Content)
	thc.SetCreatedAt(c.CreatedAt)

	return &thc
}
