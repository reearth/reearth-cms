package interactor

import (
	"context"
	"io"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/worker/pkg/decompressor"
)

func (u *Usecase) Decompress(ctx context.Context, assetID, assetPath string) error {
	ext := strings.TrimPrefix(path.Ext(assetPath), ".")
	base := strings.TrimPrefix(strings.TrimSuffix(assetPath, "."+ext), "/")

	compressedFile, size, err := u.gateways.File.Read(ctx, assetPath)
	if err != nil {
		return err
	}

	uploadFunc := func(name string) (io.WriteCloser, error) {
		w, err := u.gateways.File.Upload(ctx, path.Join(base, name))
		if err != nil {
			return nil, err
		}
		return w, nil
	}

	de, err := decompressor.New(compressedFile, size, ext, uploadFunc)
	if err != nil {
		return err
	}

	if err = de.Decompress(); err != nil {
		return err
	}

	return u.gateways.CMS.NotifyAssetDecompressed(ctx, assetID)
}
