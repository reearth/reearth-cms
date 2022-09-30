package interactor

import (
	"archive/zip"
	"context"
	"io"
	"log"
	"net/url"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	rzip "github.com/reearth/reearth-cms/worker/pkg/zip"
)

type Usecase struct {
	gateways *gateway.Container
}

func NewUsecase(g *gateway.Container) *Usecase {
	return &Usecase{gateways: g}
}

// var (
// 	ErrUnsupportedExtension = errors.New("unsupported compressed extension type")
// )

type DecompressableExt string

const (
	Zip = DecompressableExt("zip")
)

func (de DecompressableExt) toString() string {
	return string(de)
}

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

	rawExt := path.Ext(aURL.Path)
	ext := FromString(strings.TrimPrefix(rawExt, "."))
	if ext == "" {
		log.Default().Printf("file wasn't decompressed since it's not supported extension type") //TODO: fix here
		return nil
	}

	// TODO: extract comressed file format and choose the function to decompress it
	compressedFile, size, err := u.gateways.File.Read(ctx, aURL.Path)
	if err != nil {
		return err
	}
	uploadFunc := func(name string) (io.WriteCloser, error) {
		w, err := u.gateways.File.Upload(ctx, name)
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
