package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateIntegration(ctx context.Context, input gqlmodel.CreateIntegrationInput) (*gqlmodel.IntegrationPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) UpdateIntegration(ctx context.Context, input gqlmodel.UpdateIntegrationInput) (*gqlmodel.IntegrationPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) DeleteIntegration(ctx context.Context, input gqlmodel.DeleteIntegrationInput) (*gqlmodel.DeleteIntegrationPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) CreateWebhook(ctx context.Context, input gqlmodel.CreateWebhookInput) (*gqlmodel.WebhookPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) UpdateWebhook(ctx context.Context, input gqlmodel.UpdateWebhookInput) (*gqlmodel.WebhookPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) DeleteWebhook(ctx context.Context, input gqlmodel.DeleteWebhookInput) (*gqlmodel.DeleteWebhookPayload, error) {
	panic("implement me")
}
