package interactor

import (
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
)

type Usecase struct {
	gateways *gateway.Container
	repos    *repo.Container
}

func NewUsecase(g *gateway.Container, r *repo.Container) *Usecase {
	return &Usecase{
		gateways: g,
		repos:    r,
	}
}
