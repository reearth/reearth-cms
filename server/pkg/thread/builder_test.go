package thread

import (
	"testing"

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
	var thid ID = NewID()
	c := []*Comment{}

	tests := Tests{
		{
			name: "Valid thread",
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
			name: "fail: Invalid Id",
			input: Input{
				id:       ID{},
				comments: c,
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			build := func() *Thread {
				t.Helper()
				return New().
					ID(tt.input.id).
					Comments(tt.input.comments).
					MustBuild()
			}
			if tt.err != nil {
				assert.PanicsWithValue(t, tt.err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.want, build())
			}
		})
	}
}

func TestBuilder_NewID(t *testing.T) {
	c := []*Comment{}
	a := New().NewID().Comments(c).MustBuild()
	assert.False(t, a.id.IsNil())
}
