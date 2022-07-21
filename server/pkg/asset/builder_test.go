package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
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
	project     *project.Project
	projectId   ProjectID
	createdAt   time.Time
	createdBy   *user.User
	createdById UserID
	fileName    string
	size        uint64
	previewType *PreviewType
	file        *File
	hash        string
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
				projectId:   pid,
				createdAt:   tim,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			want: &Asset{
				id:          aid,
				projectId:   pid,
				createdAt:   tim,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				file:        &f,
				hash:        "yyy",
			},
		},
		{
			name: "fail: empty project id",
			input: Input{
				id:          aid,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			err: ErrNoProjectID,
		},
		{
			name: "fail: empty id",
			input: Input{
				projectId:   pid,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			err: ErrInvalidID,
		},
		{
			name: "fail: empty createdById",
			input: Input{
				id:          aid,
				projectId:   pid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			err: ErrNoUser,
		},
		{
			name: "fail: empty createdById",
			input: Input{
				id:          aid,
				projectId:   pid,
				createdById: uid,
				fileName:    "hoge",
				size:        0,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			err: ErrZeroSize,
		},
		{
			name: "should create asset with id timestamp",
			input: Input{
				id:          aid,
				projectId:   pid,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				file:        &f,
				hash:        "yyy",
			},
			want: &Asset{
				id:          aid,
				projectId:   pid,
				createdAt:   aid.Timestamp(),
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				file:        &f,
				hash:        "yyy",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := New().
				ID(tt.input.id).
				ProjectID(tt.input.projectId).
				CreatedAt(tt.input.createdAt).
				CreatedByID(tt.input.createdById).
				FileName(tt.input.fileName).
				Size(tt.input.size).
				Type(tt.input.previewType).
				File(tt.input.file).
				Hash(tt.input.hash).
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
				projectId:   pid,
				createdAt:   tim,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				file:        &f,
				hash:        "yyy",
			},
			want: &Asset{
				id:          aid,
				projectId:   pid,
				createdAt:   tim,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				file:        &f,
				hash:        "yyy",
			},
		},
		{
			name: "fail: Invalid Id",
			input: Input{
				id:          ID{},
				projectId:   pid,
				createdAt:   tim,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				file:        &f,
				hash:        "yyy"},
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
					ProjectID(tt.input.projectId).
					CreatedAt(tt.input.createdAt).
					CreatedByID(tt.input.createdById).
					FileName(tt.input.fileName).
					Type(tt.input.previewType).
					Size(tt.input.size).
					File(tt.input.file).
					Hash(tt.input.hash).
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
	a := New().NewID().ProjectID(pid).CreatedByID(uid).Size(size).MustBuild()
	assert.False(t, a.id.IsNil())
}
