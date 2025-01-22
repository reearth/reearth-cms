package http

import "github.com/reearth/reearth-cms/worker/internal/usecase/interactor"

type Controller struct {
	DecompressController *DecompressController
	WebhookController    *WebhookController
	CopyController       *CopyController
}

func NewController(uc *interactor.Usecase) *Controller {
	return &Controller{
		DecompressController: NewDecompressController(uc),
		WebhookController:    NewWebhookController(uc),
		CopyController:       NewCopyController(uc),
	}
}
