package integrationapi

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/stretchr/testify/assert"
)

func TestNewComment(t *testing.T) {
	uid := thread.NewUserID()
	iid := operator.NewIntegrationID()
	authorUser := operator.OperatorFromUser(uid)
	authorIntegration := operator.OperatorFromIntegration(iid)
	c := thread.NewComment(thread.NewCommentID(), authorUser, "test")
	cIntegration := thread.NewComment(thread.NewCommentID(), authorIntegration, "test")
	cMachine := thread.NewComment(thread.NewCommentID(), operator.OperatorFromMachine(), "test")
	tests := []struct {
		name     string
		input    *thread.Comment
		expected *Comment
	}{
		{
			name:     "Nil input",
			input:    nil,
			expected: nil,
		},
		{
			name:  "User author",
			input: c,
			expected: &Comment{
				Content:    new("test"),
				CreatedAt:  new(c.CreatedAt()),
				Id:         c.ID().Ref(),
				AuthorType: new(User),
				AuthorId:   new(uid.String()),
			},
		},
		{
			name:  "Integration author",
			input: cIntegration,
			expected: &Comment{
				Content:    new("test"),
				CreatedAt:  new(cIntegration.CreatedAt()),
				Id:         cIntegration.ID().Ref(),
				AuthorType: new(Integration),
				AuthorId:   new(iid.String()),
			},
		},
		{
			name:  "Machine author has no author ID or type",
			input: cMachine,
			expected: &Comment{
				Content:   new("test"),
				CreatedAt: new(cMachine.CreatedAt()),
				Id:        cMachine.ID().Ref(),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NewComment(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
