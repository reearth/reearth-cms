package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/util"
)

type ContainerConfig struct {
	SignupSecret    string
	AuthSrvUIDomain string
}

func New(r *repo.Container, g *gateway.Container, config ContainerConfig) interfaces.Container {

	return interfaces.Container{
		Asset:       NewAsset(r, g),
		Workspace:   NewWorkspace(r),
		User:        NewUser(r, g, config.SignupSecret, config.AuthSrvUIDomain),
		Project:     NewProject(r),
		Item:        NewItem(r),
		Model:       NewModel(r),
		Schema:      NewSchema(r),
		Integration: NewIntegration(r),
		Thread:      NewThread(r),
	}
}

func createEvent(ctx context.Context, r *repo.Container, g *gateway.Container, wsID id.WorkspaceID, t event.Type, o any, op operator.Operator) (*event.Event[any], error) {
	ev, err := event.New[any]().NewID().Object(o).Type(t).Timestamp(util.Now()).Operator(op).Build()
	if err != nil {
		return nil, err
	}

	if err := r.Event.Save(ctx, ev); err != nil {
		return nil, err
	}

	if err := webhook(ctx, r, g, wsID, ev); err != nil {
		return nil, err
	}

	return ev, nil
}

func webhook(ctx context.Context, r *repo.Container, g *gateway.Container, wsID id.WorkspaceID, ev *event.Event[any]) error {
	ws, err := r.Workspace.FindByID(ctx, wsID)
	if err != nil {
		return err
	}
	integrationIDs := ws.Members().IntegrationIDs()

	integrations, err := r.Integration.FindByIDs(ctx, integrationIDs)
	if err != nil {
		return err
	}

	for _, w := range integrations.ActiveWebhooks(ev.Type()) {
		if err := g.TaskRunner.Run(ctx, task.WebhookPayload{
			Webhook: w,
			Event:   ev,
		}.Payload()); err != nil {
			return err
		}
	}

	return nil

}

func updatable(ownerUser *id.UserID, ownerIntegration *id.IntegrationID, wId id.WorkspaceID, operator *usecase.Operator) error {
	isOwned := ownerUser == operator.User || ownerIntegration == operator.Integration
	isMaintainer := operator.IsMaintainingWorkspace(wId)
	if !isMaintainer && !isOwned {
		return interfaces.ErrOperationDenied
	}
	return nil
}
