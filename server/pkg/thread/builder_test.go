package thread

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

type Tests []struct {
	name  string
	input Input
	want  *Thread
	err   error
}

type Input struct {
	id       ID
	comments []*Comment
}

func TestBuilder_Build(t *testing.T) {
	var thid ID = NewID()
	c := []*Comment{}

	tests := Tests{
		{
			name: "should create a thread",
			input: Input{
				id:       thid,
				comments: c,
			},
			want: &Thread{
				id:       thid,
				comments: c,
			},
		},
		{
			name:  "fail: empty id",
			input: Input{},
			err:   ErrInvalidID,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := New().
				ID(tt.input.id).
				Comments(tt.input.comments).
				Build()
			if err != tt.err {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	thid := NewID()
	c := []*Comment{}
	got := New().
		ID(thid).
		Comments(c).
		MustBuild()
	want := lo.Must(New().
		ID(thid).
		Comments(c).Build())

	assert.Equal(t, want, got)
}

func TestBuilder_NewID(t *testing.T) {
	c := []*Comment{}
	a := New().NewID().Comments(c).MustBuild()
	assert.False(t, a.id.IsNil())
}
