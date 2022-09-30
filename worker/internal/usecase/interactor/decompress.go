package interactor

import (
	"archive/zip"
	"context"
	"io"
	"net/url"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	rzip "github.com/reearth/reearth-cms/worker/pkg/zip"
	"github.com/reearth/reearthx/log"
)

type Usecase struct {
	gateways *gateway.Container
}

func NewUsecase(g *gateway.Container) *Usecase {
	return &Usecase{gateways: g}
}

type DecompressableExt string

// MEMO: modify here when we support other compression format
const (
	Zip = DecompressableExt("zip")
)

func FromString(ext string) DecompressableExt {
	switch ext {
	case "zip":
		return Zip
	default:
		return ""
	}
}

func (u *Usecase) Decompress(ctx context.Context, assetURL string) error {
	aURL, err := url.Parse(assetURL)
	if err != nil {
		return err
	}

	rawExt := strings.TrimPrefix(path.Ext(aURL.Path), ".")
	ext := FromString(rawExt)
	fileName := strings.TrimPrefix(strings.TrimSuffix(aURL.Path, "."+rawExt), "/")

	if ext == "" {
		log.Infof("decompress: file wasn't decompressed since it's not supported extension type")
		return nil
	}

	compressedFile, size, err := u.gateways.File.Read(ctx, aURL.Path)
	if err != nil {
		return err
	}
	uploadFunc := func(name string) (io.WriteCloser, error) {
		w, err := u.gateways.File.Upload(ctx, fileName+name)
		if err != nil {
			return nil, err
		}
		return w, nil
	}
	zr, err := zip.NewReader(compressedFile, size)
	if err != nil {
		return err
	}
	unzipper, err := rzip.NewUnzipper(zr, uploadFunc)
	if err != nil {
		return err
	}

	if err := unzipper.Unzip(); err != nil {
		return err
	}

	return nil
}
