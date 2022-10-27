package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/samber/lo"
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

func createEvent(ctx context.Context, r *repo.Container, g *gateway.Container, wsID id.WorkspaceID, t event.Type, a any) error {
	ev, err := event.New[any]().Build()
	if err != nil {
		return err
	}

	if err := r.Event.Save(ctx, ev); err != nil {
		return err
	}

	// find workspace
	ws, err := r.Workspace.FindByID(ctx, wsID)
	if err != nil {
		return err
	}
	integrationIDs := ws.Members().IntegrationIDs()

	// find integrations
	integrations, err := r.Integration.FindByIDs(ctx, integrationIDs)
	if err != nil {
		return err
	}

	// collect webhooks
	webhooks := lo.FlatMap(integrations, func(i *integration.Integration, _ int) []*integration.Webhook {
		return lo.Filter(i.Webhooks(), func(w *integration.Webhook, _ int) bool {
			return w.Trigger().IsActive(t)
		})
	})

	// call pubsub
	for _, w := range webhooks {
		if err := g.TaskRunner.Run(ctx, task.WebhookPayload{
			Webhook: w,
			Event:   ev,
		}.Payload()); err != nil {
			return err
		}
	}

	return nil
}
