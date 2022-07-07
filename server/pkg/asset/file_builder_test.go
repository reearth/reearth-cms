package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestFileBuilder_Build(t *testing.T) {
	// var aid ID = NewID()
	uid := NewUserID()
	afid := NewAssetFileID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	tests := []struct {
		name  string
		input File
		want  struct {
			file *File
			err  bool
		}
	}{
		{
			name: "should create an asset file",
			input: File{
				id:          afid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			want: struct {
				file *File
				err  bool
			}{
				file: &File{
					id:          afid,
					name:        "hoge",
					size:        size,
					contentType: "xxx",
					uploadedAt:  tim,
					uploadedBy:  uid,
					children:    id.AssetFileIDList{afid},
				},
			},
		},
		{
			name: "fail: empty id",
			input: File{
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			want: struct {
				file *File
				err  bool
			}{
				err: true,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewFile().
				ID(tt.input.id).
				Name(tt.input.name).
				Size(tt.input.size).
				ContentType(tt.input.contentType).
				UploadedAt(tt.input.uploadedAt).
				UploadedBy(tt.input.uploadedBy).
				Children(tt.input.children).
				Build()
			if (err == nil) != tt.want.err {
				assert.Equal(t, tt.want.file, got)
			}
		})
	}
}
