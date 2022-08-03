package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
)

type Decompresser interface {
	Match(Cases)
}

type Zip struct{}

type Cases struct {
	Zip func(Zip) error
}

func (Zip) Match(c Cases) error {
	return nil
}

type Usecase struct {
	gateways *gateway.File
}

func NewUsecase(g *gateway.File) *Usecase {
	return &Usecase{gateways: g}
}

func (u *Usecase) Decompress(ctx context.Context, assetURL string) { //TODO: or asset id
	//get asset here
	// f, err := u.gateways.ReadAsset(ctx, )

}
