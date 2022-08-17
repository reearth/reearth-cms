package interactor

import (
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	rzip "github.com/reearth/reearth-cms/worker/pkg/zip"
)

type Usecase struct {
	gateways gateway.File
}

func NewUsecase(g gateway.File) *Usecase {
	return &Usecase{gateways: g}
}

func (u *Usecase) Decompress(ctx context.Context, assetURL string) error {
	url, err := url.Parse(assetURL)
	if err != nil {

	}
	a, size, err := u.gateways.RandomReadAssetByURL(ctx, url)
	if err != nil {
		return err
	}

	uploadFunc := func(name string) (io.Writer, error) {
		w, err := u.gateways.UploadAsset(ctx, name)
		if err != nil {
			return nil, err
		}
		return w, nil
	}
	unzipper, err := rzip.NewUnzipper(a, size, uploadFunc)
	if err != nil {
		return err
	}

	// tempBuf := new(bytes.Buffer)
	// wFn := func(name string) io.Writer {
	// 	f, err := os.Create(name)
	// 	if err != nil {
	// 		// TODO: something
	// 	}
	// 	return f
	// }
	// unzipper, err := rzip.NewUnzipper(a, size, wFn)
	// if err != nil {
	// 	return err
	// }

	err = unzipper.Unzip()
	if err != nil {
		return err
	}
	return nil
}
