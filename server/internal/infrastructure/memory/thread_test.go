package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestThread_UpdateComment(t *testing.T) {
	ctx := context.Background()
	r := &Thread{
		data: &util.SyncMap[id.ThreadID, *thread.Thread]{},
	}
	c1 := thread.Comment{}
	cid1 := id.NewCommentID()
	c1.SetID(cid1)
	c1.SetContent("hi")

	c2 := thread.Comment{}
	cid2 := id.NewCommentID()
	c2.SetID(cid2)

	comments := []*thread.Comment{&c1, &c2}
	th := thread.New().NewID().Workspace(id.NewWorkspaceID()).Comments(comments).MustBuild()

	err := r.UpdateComment(ctx, th, &c1)

	assert.Equal(t, nil, err)

	c1.SetContent("hello")
	cc, _ := lo.Find(th.Comments(), func(tc *thread.Comment) bool {
		return tc.ID() == c1.ID()
	})
	assert.Equal(t, "hello", cc.Content())

}
