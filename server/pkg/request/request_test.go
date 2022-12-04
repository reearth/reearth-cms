package request

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestRequest_SetDescription(t *testing.T) {
	req := &Request{
		description: "xxx",
	}
	req.SetDescription("foo")
	assert.Equal(t, "foo", req.Description())
}

func TestRequest_SetItems(t *testing.T) {
	req := &Request{}
	items := []*Item{{
		item:    id.NewItemID(),
		pointer: version.New().OrRef(),
	}}
	req.SetItems(items)
	assert.Equal(t, items, req.Items())
}

func TestRequest_SetReviewers(t *testing.T) {
	req := &Request{}
	reviewers := id.UserIDList{id.NewUserID()}
	req.SetReviewers(reviewers)
	assert.Equal(t, reviewers, req.Reviewers())
}

func TestRequest_SetState(t *testing.T) {
	req := &Request{
		description: "xxx",
	}
	req.SetDescription("foo")
	assert.Equal(t, "foo", req.Description())
}

func TestRequest_SetTitle(t *testing.T) {
	req := &Request{
		title: "xxx",
	}

	err := req.SetTitle("foo")
	assert.NoError(t, err)
	assert.Equal(t, "foo", req.Title())

	err = req.SetTitle("")
	assert.Equal(t, ErrEmptyTitle, err)

}
