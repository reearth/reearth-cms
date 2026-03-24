package http

import (
	"context"
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
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
	Filter  string `json:"filter"`
	Changes string `json:"changes"`
}

func (c *CopyController) Copy(ctx context.Context, input CopyInput) error {
	var filter bson.M
	if err := json.Unmarshal([]byte(input.Filter), &filter); err != nil {
		return rerror.ErrInternalBy(err)
	}
	var changes task.Changes
	if err := json.Unmarshal([]byte(input.Changes), &changes); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return c.usecase.Copy(ctx, filter, changes)
}
