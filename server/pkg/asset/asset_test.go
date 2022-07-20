package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestAsset_AssetType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	u := user.New().NewID().Email("test@test.com").MustBuild()
	p := project.New().ID(pid).MustBuild()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	wantPreviewType := PreviewTypeFromRef(getStrRef("IMAGE"))

	got := Asset{
		id:          aid,
		project:     p,
		projectId:   pid,
		createdAt:   tim,
		createdBy:   u,
		createdById: uid,
		fileName:    "hoge",
		previewType: PreviewTypeFromRef(getStrRef(PreviewTypeIMAGE.String())),
		size:        size,
		hash:        "yyy",
	}
	
	assert.Equal(t, aid, got.ID())
	assert.Equal(t, p, got.Project())
	assert.Equal(t, pid, got.ProjectID())
	assert.Equal(t, tim, got.CreatedAt())
	assert.Equal(t, u, got.CreatedBy())
	assert.Equal(t, uid, got.CreatedByID())
	assert.Equal(t, "hoge", got.FileName())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, wantPreviewType, got.PreviewType())
	assert.Equal(t, "yyy", got.Hash())
}
