package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestComment_Model(t *testing.T) {
	cId := thread.NewCommentID()
	op := operator.OperatorFromUser(user.NewID())
	tests := []struct {
		name string
		cDoc *CommentDocument
		want *thread.Comment
	}{
		{
			name: "comment",
			cDoc: &CommentDocument{
				ID:          cId.String(),
				User:        op.User().StringRef(),
				Integration: nil,
				Content:     "abc",
			},
			want: thread.NewComment(cId, op, "abc"),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.cDoc.Model())
		})
	}
}

func TestThreadDocument_Model(t *testing.T) {
	tests := []struct {
		name    string
		tDoc    *ThreadDocument
		want    *thread.Thread
		wantErr bool
	}{
		{
			name:    "modal should pass",
			tDoc:    nil,
			want:    nil,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.tDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewComment(t *testing.T) {
	type args struct {
		c *thread.Comment
	}
	tests := []struct {
		name string
		args args
		want *CommentDocument
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equalf(t, tt.want, NewComment(tt.args.c), "NewComment(%v)", tt.args.c)
		})
	}
}

func TestNewThread(t *testing.T) {
	type args struct {
		a *thread.Thread
	}
	tests := []struct {
		name  string
		args  args
		want  *ThreadDocument
		want1 string
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, got1 := NewThread(tt.args.a)
			assert.Equalf(t, tt.want, got, "NewThread(%v)", tt.args.a)
			assert.Equalf(t, tt.want1, got1, "NewThread(%v)", tt.args.a)
		})
	}
}

func TestNewThreadConsumer(t *testing.T) {
	c := NewThreadConsumer()
	assert.NotNil(t, c)
}
