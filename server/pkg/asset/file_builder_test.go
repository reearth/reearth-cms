package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type FileTests []struct {
	name  string
	input FileInput
	want  *File
	err   error
}

type FileInput struct {
	name        string
	size        uint64
	contentType string
	path        string
	children    []*File
}

func TestFileBuilder_Build(t *testing.T) {
	var size uint64 = 15
	var c []*File
	tests := FileTests{
		{
			name: "should create an asset",
			input: FileInput{
				name:        "xxx.yyy",
				size:        size,
				contentType: "",
				path:        "",
				children:    c,
			},
			want: &File{
				name:        "xxx.yyy",
				size:        size,
				contentType: "",
				path:        "",
				children:    c,
			},
		},
		{
			name: "invalid asset: zero size",
			input: FileInput{
				name:        "xxx.yyy",
				contentType: "",
				path:        "",
				children:    c,
			},
			err: ErrZeroSize,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewFile().
				Name(tt.input.name).
				Size(tt.input.size).
				Type(tt.input.contentType).
				Path(tt.input.path).
				Children(tt.input.children).
				Build()
			if err != tt.err {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestFileBuilder_MustBuild(t *testing.T) {
	var size uint64 = 15
	var c []*File

	tests := FileTests{
		{
			name: "Valid asset",
			input: FileInput{
				name:        "xxx.yyy",
				size:        size,
				contentType: "",
				path:        "",
				children:    c,
			},
			want: &File{
				name:        "xxx.yyy",
				size:        size,
				contentType: "",
				path:        "",
				children:    c,
			},
		},
		{
			name: "invalid asset: zero size",
			input: FileInput{
				name:        "xxx.yyy",
				contentType: "",
				path:        "",
				children:    c,
			},
			err: ErrZeroSize,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			build := func() *File {
				t.Helper()
				return NewFile().
					Name(tt.input.name).
					Size(tt.input.size).
					Type(tt.input.contentType).
					Path(tt.input.path).
					Children(tt.input.children).
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
