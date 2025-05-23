package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestConvertThread_ToThread(t *testing.T) {
	id1 := id.NewThreadID()
	wid1 := accountdomain.NewWorkspaceID()
	comments := []*thread.Comment{}
	th1 := thread.New().ID(id1).Workspace(wid1).Comments(comments).MustBuild()
	want1 := Thread{
		ID:          ID(id1.String()),
		WorkspaceID: ID(wid1.String()),
		Comments:    lo.Map(th1.Comments(), func(c *thread.Comment, _ int) *Comment { return ToComment(c, th1) }),
	}
	got1 := ToThread(th1)
	assert.Equal(t, &want1, got1)

	var th2 *thread.Thread = nil
	want2 := (*Thread)(nil)
	got2 := ToThread(th2)
	assert.Equal(t, want2, got2)
}

func TestConvertThread_ToComment(t *testing.T) {
	cid1 := id.NewCommentID()
	uid1 := accountdomain.NewUserID()
	c1 := "xxx"

	th := thread.New().NewID().Workspace(thread.NewWorkspaceID()).MustBuild()
	comment1 := thread.NewComment(cid1, operator.OperatorFromUser(uid1), c1)

	want1 := Comment{
		ID:          ID(cid1.String()),
		ThreadID:    ID(th.ID().String()),
		WorkspaceID: ID(th.Workspace().String()),
		AuthorID:    ID(uid1.String()),
		AuthorType:  OperatorTypeUser,
		Content:     c1,
		CreatedAt:   cid1.Timestamp(),
	}

	got1 := ToComment(comment1, th)
	assert.Equal(t, &want1, got1)

	var comment2 *thread.Comment = nil
	want2 := (*Comment)(nil)
	got2 := ToComment(comment2, th)
	assert.Equal(t, want2, got2)
}

func TestConvertThread_FromResourceType(t *testing.T) {
	var rt1 = ResourceTypeItem
	want1 := interfaces.ResourceTypeItem
	got1, ok1 := FromResourceType(rt1)
	assert.Equal(t, want1, got1)
	assert.True(t, ok1)

	var rt2 = ResourceTypeAsset
	want2 := interfaces.ResourceTypeAsset
	got2, ok2 := FromResourceType(rt2)
	assert.Equal(t, want2, got2)
	assert.True(t, ok2)

	var rt3 = ResourceTypeRequest
	want3 := interfaces.ResourceTypeRequest
	got3, ok3 := FromResourceType(rt3)
	assert.Equal(t, want3, got3)
	assert.True(t, ok3)

	var rt4 ResourceType = "invalid"
	want4 := interfaces.ResourceType("")
	got4, ok4 := FromResourceType(rt4)
	assert.Equal(t, want4, got4)
	assert.False(t, ok4)
}
