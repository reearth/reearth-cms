package interactor

import (
	"context"
	"io"
	"net/url"
	"os"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	rzip "github.com/reearth/reearth-cms/worker/pkg/zip"
)

// type Decompresser interface {
// 	Match(Cases)
// }

// type Zip struct{}

// type Cases struct {
// 	Zip func(Zip) error
// }

// func (Zip) Match(c Cases) error {
// 	return nil
// }

type Usecase struct {
	gateways gateway.File
}

func NewUsecase(g gateway.File) *Usecase {
	return &Usecase{gateways: g}
}

func (u *Usecase) Decompress(ctx context.Context, assetURL string) error { //TODO: or asset id
	url, err := url.Parse(assetURL)
	if err != nil {

	}
	a, size, err := u.gateways.RandomReadAssetByURL(ctx, url)
	if err != nil {
		return err
	}

	// tempBuf := new(bytes.Buffer)

	wFn := func(name string) io.Writer {
		f, err := os.Create(name)
		if err != nil {
			// TODO: something
		}
		return f
	}

	unzipper, err := rzip.NewUnzipper(a, size, wFn)
	if err != nil {
		return err
	}
	err = unzipper.Unzip()
	if err != nil {
		return err
	}
	return nil
}
