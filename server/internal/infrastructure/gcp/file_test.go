package gcp

import (
	"context"
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "xxx.yyy"), getGCSObjectPath(u, n))

	n = "ああああ.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "ああああ.yyy"), getGCSObjectPath(u, n))

	assert.Equal(t, "", getGCSObjectPath("", ""))
}

func TestFile_GetGCSObjectPathFolder(t *testing.T) {
	u := newUUID()

	type args struct {
		uuid string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "success",
			args: args{
				uuid: u,
			},
			want: path.Join(gcsAssetBasePath, u[:2], u[2:]),
		},
		{
			name: "invalid uuid",
			args: args{
				uuid: "testing",
			},
			want: "",
		},
		{
			name: "empty",
			args: args{
				uuid: "",
			},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			actual := getGCSObjectPathFolder(tt.args.uuid)
			assert.Equal(t, tt.want, actual)
		})
	}
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, IsValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, IsValidUUID(u1))
}

func TestGetWorkspaceFromContext(t *testing.T) {
	tests := []struct {
		name     string
		ctx      context.Context
		expected string
	}{
		{
			name:     "no workspace in context",
			ctx:      context.Background(),
			expected: "",
		},
		{
			name:     "workspace alias in context",
			ctx:      context.WithValue(context.Background(), "workspace", "test-workspace-alias"),
			expected: "test-workspace-alias",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getWorkspaceFromContext(tt.ctx)
			assert.Equal(t, tt.expected, result)
		})
	}
}
