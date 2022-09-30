package interactor

import (
	"archive/zip"
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
	compressedFile, size, err := u.gateways.File.Read(ctx, url.Path)
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
