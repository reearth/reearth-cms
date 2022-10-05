package gqlmodel

import (
	"bytes"
	"io"
	"strings"
	"testing"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/stretchr/testify/assert"
)

func TestConvert_FromFile(t *testing.T) {
	buf := bytes.NewBufferString("aaa")
	buflen := int64(buf.Len())

	u1 := graphql.Upload{
		File:        strings.NewReader("aaa"),
		Filename:    "aaa.txt",
		Size:        buflen,
		ContentType: "text/plain",
	}
	want1 := file.File{
		Content:     io.NopCloser(strings.NewReader("aaa")),
		Path:        "aaa.txt",
		Size:        buflen,
		ContentType: "text/plain",
	}

	var u2 *graphql.Upload = nil
	want2 := (*file.File)(nil)

	tests := []struct {
		name string
		arg  *graphql.Upload
		want *file.File
	}{
		{
			name: "from file valid",
			arg:  &u1,
			want: &want1,
		},
		{
			name: "from file nil",
			arg:  u2,
			want: want2,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := FromFile(tc.arg)
			assert.Equal(t, tc.want, got)
		})
	}
}
