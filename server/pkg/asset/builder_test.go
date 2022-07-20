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
	file        *AssetFile
	hash        string
}

func TestBuilder_Build(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	u := user.New().ID(uid).Email("test@test.com").MustBuild()
	p := project.New().ID(pid).MustBuild()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15

	tests := Tests{
		{
			name: "should create an asset",
			input: Input{
				id:          aid,
				project:     p,
				projectId:   pid,
				createdAt:   tim,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				hash:        "yyy",
			},
			want: &Asset{
					id:          aid,
					project:     p,
					projectId:   pid,
					createdAt:   tim,
					createdBy:   u,
					createdById: uid,
					fileName:    "hoge",
					size:        size,
					previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
					hash:        "yyy",
			},
		},
		{
			name: "fail: empty project id",
			input: Input{
				id:          aid,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				hash:        "yyy",
			},
			err: ErrNoProjectID,
		},
		{
			name: "fail: empty id",
			input: Input{
				project:     p,
				projectId:   pid,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				hash:        "yyy",
			},
			err: ErrInvalidID,
		},
		{
			name: "should create asset with id timestamp",
			input: Input{
				id:          aid,
				project:     p,
				projectId:   pid,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
				hash:        "yyy",
			},
			want: &Asset{
					id:          aid,
					project:     p,
					projectId:   pid,
					createdAt:   aid.Timestamp(),
					createdBy:   u,
					createdById: uid,
					fileName:    "hoge",
					size:        size,
					previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
					hash:        "yyy",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := New().
				ID(tt.input.id).
				Project(tt.input.project).
				ProjectID(tt.input.projectId).
				CreatedAt(tt.input.createdAt).
				CreatedBy(tt.input.createdBy).
				CreatedByID(tt.input.createdById).
				FileName(tt.input.fileName).
				Size(tt.input.size).
				Type(tt.input.previewType).
				Hash(tt.input.hash).
				Build()
			if err  != tt.err {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	u := user.New().ID(uid).Email("test@test.com").MustBuild()
	p := project.New().ID(pid).MustBuild()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15

	tests := Tests{
		{
			name: "Valid asset",
			input: Input{
				id:          aid,
				project:     p,
				projectId:   pid,
				createdAt:   tim,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				hash:        "yyy",
			},
			want: &Asset{
				id:          aid,
				project:     p,
				projectId:   pid,
				createdAt:   tim,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				hash:        "yyy",
			},
		},
		{
			name: "fail: Invalid Id",
			input: Input{
				id:          ID{},
				project:     p,
				projectId:   pid,
				createdAt:   tim,
				createdBy:   u,
				createdById: uid,
				fileName:    "hoge",
				size:        size,
				previewType: PreviewTypeFromRef(getStrRef("IMAGE")),
				hash:        "yyy",			},
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
					ProjectID(tt.input.projectId).
					CreatedAt(tt.input.createdAt).
					CreatedBy(tt.input.createdBy).
					CreatedByID(tt.input.createdById).
					FileName(tt.input.fileName).
					Type(tt.input.previewType).
					Size(tt.input.size).
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
