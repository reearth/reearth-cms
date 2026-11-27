package http

import "github.com/reearth/reearth-cms/worker/internal/usecase/interactor"

type Controller struct {
	WebhookController *WebhookController
	CopyController    *CopyController
}

func NewController(uc *interactor.Usecase) *Controller {
	return &Controller{
		WebhookController: NewWebhookController(uc),
		CopyController:    NewCopyController(uc),
	}
}
