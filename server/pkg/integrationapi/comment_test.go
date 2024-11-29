package integrationapi

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewComment(t *testing.T) {
	uid := thread.NewUserID()
	iid := operator.NewIntegrationID()
	authorUser := operator.OperatorFromUser(uid)
	authorIntegration := operator.OperatorFromIntegration(iid)
	c := thread.NewComment(thread.NewCommentID(), authorUser, "test")
	cIntegration := thread.NewComment(thread.NewCommentID(), authorIntegration, "test")
	authorID := c.Author().User().Ref()
	authorIntegrationID := cIntegration.Author().Integration().Ref()
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
				Content:    lo.ToPtr("test"),
				CreatedAt:  lo.ToPtr(c.CreatedAt()),
				Id:         c.ID().Ref(),
				AuthorType: lo.ToPtr(User),
				AuthorId:   lo.ToPtr(any(authorID)),
			},
		},
		{
			name:  "Integration author",
			input: cIntegration,
			expected: &Comment{
				Content:    lo.ToPtr("test"),
				CreatedAt:  lo.ToPtr(cIntegration.CreatedAt()),
				Id:         cIntegration.ID().Ref(),
				AuthorType: lo.ToPtr(Integrtaion),
				AuthorId:   lo.ToPtr(any(authorIntegrationID)),
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
