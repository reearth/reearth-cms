package http

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
)

type CopyController struct {
	usecase *interactor.Usecase
}

func NewCopyController(u *interactor.Usecase) *CopyController {
	return &CopyController{
		usecase: u,
	}
}

type CopyInput struct {
	ModelID string `json:"modelId"`
	Name    string `json:"name"`
}

func (c *CopyController) Copy(ctx context.Context, input CopyInput) error {
	return c.usecase.Copy(ctx, input.ModelID, input.Name)
}
