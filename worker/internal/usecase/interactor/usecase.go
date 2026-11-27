package interactor

import (
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
)

type Usecase struct {
	repos *repo.Container
}

func NewUsecase(r *repo.Container) *Usecase {
	return &Usecase{
		repos: r,
	}
}
