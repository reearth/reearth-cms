package interactor

import (
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	rzip "github.com/reearth/reearth-cms/worker/pkg/zip"
)

type Usecase struct {
	gateways *gateway.Container
}

func NewUsecase(g *gateway.Container) *Usecase {
	return &Usecase{gateways: g}
}

func (u *Usecase) Decompress(ctx context.Context, assetURL string) error {
	url, err := url.Parse(assetURL)
	if err != nil {
		return err
	}

	// TODO: extract comressed file format and choose the function to decompress it
	compressedFile, size, err := u.gateways.File.RandomReadAssetByURL(ctx, url)
	if err != nil {
		return err
	}

	uploadFunc := func(name string) (io.Writer, error) {
		w, err := u.gateways.File.UploadAssetFunc(ctx, name)
		if err != nil {
			return nil, err
		}
		return w, nil
	}
	unzipper, err := rzip.NewUnzipper(compressedFile, size, uploadFunc)
	if err != nil {
		return err
	}

	err = unzipper.Unzip()
	if err != nil {
		return err
	}

	return nil
}
