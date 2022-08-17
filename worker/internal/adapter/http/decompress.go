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
	AssetURL string `json:"assetURL"`
}

type DecompressOutput struct {
}

func (c *DecompressController) Decompress(ctx context.Context, input DecompressInput) (DecompressOutput, error) {
	err := c.usecase.Decompress(ctx, input.AssetURL)
	if err != nil {
		return DecompressOutput{}, err
	}

	return DecompressOutput{}, nil
}
