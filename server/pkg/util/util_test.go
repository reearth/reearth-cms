package util

import (
	"errors"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMust(t *testing.T) {
	a := &struct{}{}
	err := errors.New("ERR")
	assert.Same(t, a, Must(a, nil))
	assert.PanicsWithValue(t, err, func() {
		_ = Must(a, err)
	})
}

func TestIsZero(t *testing.T) {
	assert.True(t, IsZero(0))
	assert.False(t, IsZero(-1))
	assert.True(t, IsZero(struct {
		A int
		B string
	}{}))
	assert.False(t, IsZero(struct {
		A int
		B string
	}{A: 1}))
	assert.True(t, IsZero((*(struct{}))(nil)))
	assert.False(t, IsZero((*(struct{}))(&struct{}{})))
}

func TestIsNotZero(t *testing.T) {
	assert.False(t, IsNotZero(0))
	assert.True(t, IsNotZero(-1))
	assert.False(t, IsNotZero(struct {
		A int
		B string
	}{}))
	assert.True(t, IsNotZero(struct {
		A int
		B string
	}{A: 1}))
	assert.False(t, IsNotZero((*(struct{}))(nil)))
	assert.True(t, IsNotZero((*(struct{}))(&struct{}{})))
}

func TestDeref(t *testing.T) {
	assert.Equal(t, struct{ A int }{}, Deref((*(struct{ A int }))(nil)))
	assert.Equal(t, struct{ A int }{A: 1}, Deref((*(struct{ A int }))(&struct{ A int }{A: 1})))
}

func TestCopyURL(t *testing.T) {
	u, _ := url.Parse("http://localhost")
	u2, _ := url.Parse("http://aaa:bbb@localhost")

	tests := []struct {
		name string
		args *url.URL
	}{
		{
			name: "normal",
			args: u,
		},
		{
			name: "userinfo",
			args: u2,
		},
		{
			name: "nil",
			args: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := CopyURL(tt.args)
			assert.Equal(t, tt.args, got)
			if got != nil {
				assert.NotSame(t, tt.args, got)
				if got.User != nil {
					assert.NotSame(t, tt.args.User, got.User)
				}
			}
		})
	}
}
