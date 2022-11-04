package interactor

import "github.com/reearth/reearth-cms/worker/internal/usecase/gateway"

type Usecase struct {
	gateways *gateway.Container
}

func NewUsecase(g *gateway.Container) *Usecase {
	return &Usecase{gateways: g}
}
