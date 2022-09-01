package interactor

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestAsset_Create(t *testing.T) {
	ctx := context.Background()
	pid := asset.NewProjectID()
	aid := asset.NewID()
	uid := asset.NewUserID()
	newID := asset.NewID
	asset.NewID = func() asset.ID { return aid }
	t.Cleanup(func() { asset.NewID = newID })

	mfs := afero.NewMemMapFs()
	f, _ := fs.NewFile(mfs, "")
	repos := memory.New()
	transaction := memory.NewTransaction()
	repos.Transaction = transaction
	uc := &Asset{
		repos: repos,
		gateways: &gateway.Container{
			File: f,
		},
	}
	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())
	res, err := uc.Create(ctx, interfaces.CreateAssetParam{
		ProjectID:   pid,
		CreatedByID: uid,
		File: &file.File{
			Content:     io.NopCloser(buf),
			Path:        "hoge.txt",
			ContentType: "",
			Size:        buflen,
		},
	}, &usecase.Operator{
		WritableProjects: id.ProjectIDList{pid},
	})

	want := asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(aid.Timestamp()).
		CreatedBy(uid).
		FileName("hoge.txt").
		Size(uint64(buflen)).
		UUID(res.UUID()).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(""))).
		MustBuild()

	assert.NoError(t, err)
	assert.Equal(t, want, res)
	assert.Equal(t, 1, transaction.Committed())
	a, err := repos.Asset.FindByID(ctx, aid)
	assert.NoError(t, err)
	assert.Equal(t, want, a)
}
