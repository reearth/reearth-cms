package fs

import (
	"context"
	"io"
	"net/url"
	"os"
	"path"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
)

type fileRepo struct {
	fs      afero.Fs
	urlBase *url.URL
}

func NewFile(fs afero.Fs, urlBase string) (gateway.File, error) {
	var b *url.URL
	var err error
	b, err = url.Parse(urlBase)
	if err != nil {
		return nil, invalidBaseURLErr
	}

	return &fileRepo{
		fs:      fs,
		urlBase: b,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, filename string) (io.ReadCloser, error) {
	return f.read(ctx, filepath.Join(assetDir, sanitize.Path(filename)))
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, error) {
	if file == nil {
		return "", gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return "", gateway.ErrFileTooLarge
	}

	uuid := newUUID()

	p := getFSObjectPath(uuid, file.Path)

	if err := f.upload(ctx, p, file.Content); err != nil {
		return "", err
	}

	return uuid, nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	p := getFSObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}

	sn := sanitize.Path(p)

	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, sn)
}

// helpers

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	file, err := f.fs.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if fnd := path.Dir(filename); fnd != "" {
		if err := f.fs.MkdirAll(fnd, 0755); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	dest, err := f.fs.Create(filename)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = dest.Close()
	}()

	if _, err := io.Copy(dest, content); err != nil {
		return gateway.ErrFailedToUploadFile
	}

	return nil
}

func getFSObjectPath(uuid, filename string) string {
	p := path.Join(assetDir, uuid[:2], uuid[2:], filename)
	return sanitize.Path(p)
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if err := f.fs.RemoveAll(filename); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func newUUID() string {
	return uuid.New().String()
}
