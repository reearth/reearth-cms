package http

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
)

type DecompressController struct {
	usecase *interactor.Usecase
}

func NewDecompressController(u *interactor.Usecase) *DecompressController {
	return &DecompressController{
		usecase: u,
	}
}

type DecompressInput struct {
	assetID  string //TODO: change this later
	assetURL string
}

type DecompressOutput struct {
}

func (c *DecompressController) Decompress(ctx context.Context, input DecompressInput) (DecompressOutput, error) {
	c.usecase.Decompress(ctx, "")
	panic("not implemented")
}
