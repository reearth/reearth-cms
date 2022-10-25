package http

import "github.com/reearth/reearth-cms/worker/internal/usecase/interactor"

type Controller struct {
	DecompressController *DecompressController
}

func NewController(uc *interactor.Usecase) *Controller {
	return &Controller{DecompressController: NewDecompressController(uc)}
}
