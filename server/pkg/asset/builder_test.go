package asset

import (
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

type Tests []struct {
	name  string
	input Input
	want  *Asset
	err   error
}

type Input struct {
	id          ID
	project     ProjectID
	createdAt   time.Time
	createdBy   UserID
	fileName    string
	size        uint64
	previewType *PreviewType
	file        *File
	uuid        string
}

func TestBuilder_Build(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	f := File{}
	var size uint64 = 15

	tests := Tests{
		{
			name: "should create an asset",
			input: Input{
				id:          aid,
				project:     pid,
				createdAt:   tim,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			want: &Asset{
				id:          aid,
				project:     pid,
				createdAt:   tim,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr("IMAGE")),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
		},
		{
			name: "fail: empty project id",
			input: Input{
				id:          aid,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			err: ErrNoProjectID,
		},
		{
			name: "fail: empty id",
			input: Input{
				project:     pid,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			err: ErrInvalidID,
		},
		{
			name: "fail: empty createdBy",
			input: Input{
				id:          aid,
				project:     pid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			err: ErrNoUser,
		},
		{
			name: "fail: empty createdBy",
			input: Input{
				id:          aid,
				project:     pid,
				createdBy:   uid,
				fileName:    "hoge",
				size:        0,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			err: ErrZeroSize,
		},
		{
			name: "should create asset with id timestamp",
			input: Input{
				id:          aid,
				project:     pid,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			want: &Asset{
				id:          aid,
				project:     pid,
				createdAt:   aid.Timestamp(),
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr("IMAGE")),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := New().
				ID(tt.input.id).
				Project(tt.input.project).
				CreatedAt(tt.input.createdAt).
				CreatedBy(tt.input.createdBy).
				FileName(tt.input.fileName).
				Size(tt.input.size).
				Type(tt.input.previewType).
				File(tt.input.file).
				UUID(tt.input.uuid).
				Build()
			if err != tt.err {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	f := File{}
	var size uint64 = 15

	tests := Tests{
		{
			name: "Valid asset",
			input: Input{
				id:          aid,
				project:     pid,
				createdAt:   tim,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr("IMAGE")),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
			want: &Asset{
				id:          aid,
				project:     pid,
				createdAt:   tim,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr("IMAGE")),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			},
		},
		{
			name: "fail: Invalid Id",
			input: Input{
				id:          ID{},
				project:     pid,
				createdAt:   tim,
				createdBy:   uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(lo.ToPtr("IMAGE")),
				file:        &f,
				uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			build := func() *Asset {
				t.Helper()
				return New().
					ID(tt.input.id).
					Project(tt.input.project).
					CreatedAt(tt.input.createdAt).
					CreatedBy(tt.input.createdBy).
					FileName(tt.input.fileName).
					Type(tt.input.previewType).
					Size(tt.input.size).
					File(tt.input.file).
					UUID(tt.input.uuid).
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
	pid := NewProjectID()
	uid := NewUserID()
	var size uint64 = 15
	a := New().NewID().Project(pid).CreatedBy(uid).Size(size).MustBuild()
	assert.False(t, a.id.IsNil())
}
