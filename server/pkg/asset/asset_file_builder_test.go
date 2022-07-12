package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestAssetFileBuilder_Build(t *testing.T) {
	uid := NewUserID()
	afid := NewAssetFileID()
	aid := NewID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	tests := []struct {
		name  string
		input AssetFile
		want  struct {
			file *AssetFile
			err  bool
		}
	}{
		{
			name: "should create an asset file",
			input: AssetFile{
				id:          afid,
				assetId:     aid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			want: struct {
				file *AssetFile
				err  bool
			}{
				file: &AssetFile{
					id:          afid,
					assetId:     aid,
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
			input: AssetFile{
				assetId:     aid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			want: struct {
				file *AssetFile
				err  bool
			}{
				err: true,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewAssetFile().
				ID(tt.input.id).
				AssetID(tt.input.assetId).
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

func TestAssetFileBuilder_MustBuild(t *testing.T) {
	uid := NewUserID()
	afid := NewAssetFileID()
	aid := NewID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15

	type args struct {
		id          AssetFileID
		assetId     ID
		name        string
		size        uint64
		contentType string
		uploadedAt  time.Time
		uploadedBy  UserID
		children    id.AssetFileIDList
	}

	tests := []struct {
		name     string
		args     args
		expected *AssetFile
		err      error
	}{
		{
			name: "Valid asset file",
			args: args{
				id:          afid,
				assetId:     aid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			expected: &AssetFile{
				id:          afid,
				assetId:     aid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
		},
		{
			name: "failed invalid Id",
			args: args{
				id:     AssetFileID{},
				assetId:     aid,
				name:        "hoge",
				size:        size,
				contentType: "xxx",
				uploadedAt:  tim,
				uploadedBy:  uid,
				children:    id.AssetFileIDList{afid},
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			build := func() *AssetFile {
				t.Helper()
				return NewAssetFile().
					ID(tt.args.id).
					AssetID(tt.args.assetId).
					Name(tt.args.name).
					Size(tt.args.size).
					ContentType(tt.args.contentType).
					UploadedAt(tt.args.uploadedAt).
					UploadedBy(tt.args.uploadedBy).
					Children(tt.args.children).
					MustBuild()
			}

			if tt.err != nil {
				assert.PanicsWithValue(t, tt.err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.expected, build())
			}
		})
	}
}

func TestAssetFileBuilder_NewID(t *testing.T) {
	f := NewAssetFile().NewID().MustBuild()
	assert.False(t, f.id.IsNil())
}
