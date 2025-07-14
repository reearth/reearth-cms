package fs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/spf13/afero"
)

type fileRepo struct {
	fs          afero.Fs
	publicBase  *url.URL
	privateBase *url.URL
	public      bool
}

func NewFile(fs afero.Fs, publicBase string) (gateway.File, error) {
	var b *url.URL
	if publicBase == "" {
		publicBase = defaultBase
	}

	var err error
	b, err = url.Parse(publicBase)
	if err != nil {
		return nil, ErrInvalidBaseURL
	}

	return &fileRepo{
		fs:         fs,
		publicBase: b,
		public:     true,
	}, nil
}

func NewFileWithACL(fs afero.Fs, publicBase, privateBase string) (gateway.File, error) {
	f, err := NewFile(fs, publicBase)
	if err != nil {
		return nil, err
	}

	u, err := url.Parse(privateBase)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}
	fr := f.(*fileRepo)
	fr.public = false
	fr.privateBase = u
	return fr, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, fileUUID string, fn string, h map[string]string) (io.ReadCloser, map[string]string, error) {
	if fileUUID == "" || fn == "" {
		return nil, nil, rerror.ErrNotFound
	}

	p := getFSObjectPath(fileUUID, fn)

	return f.Read(ctx, p, h)
}

func (f *fileRepo) GetAssetFiles(_ context.Context, fileUUID string) ([]gateway.FileEntry, error) {
	if fileUUID == "" {
		return nil, rerror.ErrNotFound
	}

	p := getFSObjectPath(fileUUID, "")
	var fileEntries []gateway.FileEntry
	err := afero.Walk(f.fs, p, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		fileEntries = append(fileEntries, gateway.FileEntry{
			Name: strings.ReplaceAll(lo.Must1(filepath.Rel(p, path)), "\\", "/"),
			Size: info.Size(),
		})
		return nil
	})
	if err != nil {
		if errors.Is(err, afero.ErrFileNotFound) {
			return nil, gateway.ErrFileNotFound
		} else {
			return nil, rerror.ErrInternalBy(err)
		}
	}

	if len(fileEntries) == 0 {
		return nil, gateway.ErrFileNotFound
	}

	return fileEntries, nil
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, int64, error) {
	if file == nil {
		return "", 0, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return "", 0, gateway.ErrFileTooLarge
	}
	if file.ContentEncoding != "" && file.ContentEncoding != "identity" {
		return "", 0, gateway.ErrUnsupportedContentEncoding
	}

	fileUUID := newUUID()

	p := getFSObjectPath(fileUUID, file.Name)

	size, err := f.Upload(ctx, file, p)
	if err != nil {
		return "", 0, err
	}

	return fileUUID, size, nil
}

func (f *fileRepo) DeleteAsset(_ context.Context, fileUUID string, fn string) error {
	if fileUUID == "" || fn == "" {
		return gateway.ErrInvalidFile
	}

	p := getFSObjectPath(fileUUID, fn)

	return f.delete(p)
}

func (f *fileRepo) PublishAsset(_ context.Context, u string, fn string) error {
	return nil
}

func (f *fileRepo) UnpublishAsset(_ context.Context, u string, fn string) error {
	return nil
}

func (f *fileRepo) GetAccessInfoResolver() asset.AccessInfoResolver {
	return func(a *asset.Asset) *asset.AccessInfo {
		base := f.privateBase
		publiclyAccessible := f.public || a.Public()
		if publiclyAccessible {
			base = f.publicBase
		}
		return &asset.AccessInfo{
			Url:    grtURL(base, a.UUID(), url.PathEscape(a.FileName())),
			Public: publiclyAccessible,
		}
	}
}

func (f *fileRepo) GetAccessInfo(a *asset.Asset) *asset.AccessInfo {
	if a == nil {
		return nil
	}
	return f.GetAccessInfoResolver()(a)
}

func grtURL(host *url.URL, uuid, fName string) string {
	return host.JoinPath(assetDir, uuid[:2], uuid[2:], fName).String()
}

func (f *fileRepo) GetBaseURL() string {
	return f.publicBase.String()
}

func (f *fileRepo) IssueUploadAssetLink(_ context.Context, _ gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	return nil, gateway.ErrUnsupportedOperation
}

func (f *fileRepo) UploadedAsset(_ context.Context, _ *asset.Upload) (*file.File, error) {
	return nil, gateway.ErrUnsupportedOperation
}

// helpers

func (f *fileRepo) Read(_ context.Context, filename string, _ map[string]string) (io.ReadCloser, map[string]string, error) {
	if filename == "" {
		return nil, nil, rerror.ErrNotFound
	}

	stat, err := f.fs.Stat(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil, rerror.ErrNotFound
		}
		return nil, nil, rerror.ErrInternalBy(err)
	}

	file, err := f.fs.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil, rerror.ErrNotFound
		}
		return nil, nil, rerror.ErrInternalBy(err)
	}

	headers := map[string]string{
		"Content-Type":   "application/octet-stream",
		"Last-Modified":  stat.ModTime().UTC().Format("Mon, 02 Jan 2006 15:04:05 GMT"),
		"Content-Length": fmt.Sprintf("%d", stat.Size()),
	}

	return file, headers, nil
}

func (f *fileRepo) Upload(_ context.Context, file *file.File, filename string) (int64, error) {
	if filename == "" || file == nil || file.Content == nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	if fnd := filepath.Dir(filename); fnd != "" {
		if err := f.fs.MkdirAll(fnd, 0755); err != nil {
			return 0, rerror.ErrInternalBy(err)
		}
	}

	dest, err := f.fs.Create(filename)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = dest.Close()
	}()

	var size int64
	if size, err = io.Copy(dest, file.Content); err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	return size, nil
}

func (f *fileRepo) delete(filename string) error {
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

func getFSObjectPath(fileUUID, objectName string) string {
	if fileUUID == "" || !IsValidUUID(fileUUID) {
		return ""
	}

	return filepath.Join(assetDir, fileUUID[:2], fileUUID[2:], objectName)
}

func getFSObjectFolderPath(fileUUID string) string {
	if fileUUID == "" || !IsValidUUID(fileUUID) {
		return ""
	}

	return filepath.Join(assetDir, fileUUID[:2], fileUUID[2:])
}

func newUUID() string {
	return uuid.NewString()
}

func IsValidUUID(fileUUID string) bool {
	_, err := uuid.Parse(fileUUID)
	return err == nil
}

// DeleteAssets deletes assets in batch
func (f *fileRepo) DeleteAssets(_ context.Context, folders []string) error {
	if len(folders) == 0 {
		return rerror.ErrNotFound
	}
	var errs []error
	for _, fileUUID := range folders {
		if fileUUID == "" || !IsValidUUID(fileUUID) {
			errs = append(errs, gateway.ErrInvalidUUID)
		}

		p := getFSObjectFolderPath(fileUUID)
		if err := f.fs.RemoveAll(p); err != nil {
			errs = append(errs, gateway.ErrFileNotFound)
		}
	}
	if len(errs) > 0 {
		return rerror.ErrInternalBy(fmt.Errorf("batch deletion errors: %v", errs))
	}
	return nil
}
