package fs

import (
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/spf13/afero"
)

type fileRepo struct {
	fs      afero.Fs
	urlBase *url.URL
}

func NewFile(fs afero.Fs, urlBase string) (gateway.File, error) {
	panic("implement me")
}

func (f *fileRepo) ReadAsset(ctx context.Context, filename string) (io.ReadCloser, error) {
	panic("implement me")
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, error) {
	panic("implement me")
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	panic("implement me")
}
