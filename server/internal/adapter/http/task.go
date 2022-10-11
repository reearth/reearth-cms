package http

import "context"

type TaskController struct {
}

type NotifyInput struct {
	Type    string `json:"type"`
	AssetID string `json:"assetId"`
}

func NewTaskController() *TaskController {
	return &TaskController{}
}

func (t *TaskController) Notify(ctx context.Context, input NotifyInput) error {
	panic("implement me")
}
