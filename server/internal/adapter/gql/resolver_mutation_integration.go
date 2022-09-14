package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
)

func (r *mutationResolver) CreateIntegration(ctx context.Context, input gqlmodel.CreateIntegrationInput) (*gqlmodel.IntegrationPayload, error) {
	res, err := usecases(ctx).Integration.Create(
		ctx,
		interfaces.CreateIntegrationParam{
			Name:        input.Name,
			Description: input.Description,
			Type:        integration.TypeFrom(input.Type.String()),
			Logo:        input.LogoURL,
		},
		getUser(ctx).ID(),
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.IntegrationPayload{
		Integration: gqlmodel.ToIntegration(res),
	}, nil
}

func (r *mutationResolver) UpdateIntegration(ctx context.Context, input gqlmodel.UpdateIntegrationInput) (*gqlmodel.IntegrationPayload, error) {
	iId, err := gqlmodel.ToID[id.Integration](input.IntegrationID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Integration.Update(
		ctx,
		iId,
		interfaces.UpdateIntegrationParam{
			Name:        input.Name,
			Description: input.Description,
			Logo:        input.LogoURL,
		},
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.IntegrationPayload{
		Integration: gqlmodel.ToIntegration(res),
	}, nil
}

func (r *mutationResolver) DeleteIntegration(ctx context.Context, input gqlmodel.DeleteIntegrationInput) (*gqlmodel.DeleteIntegrationPayload, error) {
	iId, err := gqlmodel.ToID[id.Integration](input.IntegrationID)
	if err != nil {
		return nil, err
	}

	err = usecases(ctx).Integration.Delete(ctx, iId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteIntegrationPayload{
		IntegrationID: input.IntegrationID,
	}, nil
}

func (r *mutationResolver) CreateWebhook(ctx context.Context, input gqlmodel.CreateWebhookInput) (*gqlmodel.WebhookPayload, error) {
	iId, err := gqlmodel.ToID[id.Integration](input.IntegrationID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Integration.CreateWebhook(ctx, iId, interfaces.CreateWebhookParam{
		Name:   input.Name,
		URL:    input.URL,
		Active: input.Active,
		Trigger: &interfaces.WebhookTriggerParam{
			OnItemCreate:    FromPtr(input.Trigger.OnItemCreate, false),
			OnItemUpdate:    FromPtr(input.Trigger.OnItemUpdate, false),
			OnItemDelete:    FromPtr(input.Trigger.OnItemDelete, false),
			OnAssetUpload:   FromPtr(input.Trigger.OnAssetUpload, false),
			OnAssetDeleted:  FromPtr(input.Trigger.OnAssetDeleted, false),
			OnItemPublish:   FromPtr(input.Trigger.OnItemPublish, false),
			OnItemUnPublish: FromPtr(input.Trigger.OnItemUnPublish, false),
		},
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.WebhookPayload{
		Webhook: gqlmodel.ToWebhook(res),
	}, nil
}

func (r *mutationResolver) UpdateWebhook(ctx context.Context, input gqlmodel.UpdateWebhookInput) (*gqlmodel.WebhookPayload, error) {
	iId, wId, err := gqlmodel.ToID2[id.Integration, id.Webhook](input.IntegrationID, input.WebhookID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Integration.UpdateWebhook(ctx, iId, wId, interfaces.UpdateWebhookParam{
		Name:   input.Name,
		URL:    input.URL,
		Active: input.Active,
		Trigger: &interfaces.WebhookTriggerParam{
			OnItemCreate:    FromPtr(input.Trigger.OnItemCreate, false),
			OnItemUpdate:    FromPtr(input.Trigger.OnItemUpdate, false),
			OnItemDelete:    FromPtr(input.Trigger.OnItemDelete, false),
			OnAssetUpload:   FromPtr(input.Trigger.OnAssetUpload, false),
			OnAssetDeleted:  FromPtr(input.Trigger.OnAssetDeleted, false),
			OnItemPublish:   FromPtr(input.Trigger.OnItemPublish, false),
			OnItemUnPublish: FromPtr(input.Trigger.OnItemUnPublish, false),
		},
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.WebhookPayload{
		Webhook: gqlmodel.ToWebhook(res),
	}, nil
}

func (r *mutationResolver) DeleteWebhook(ctx context.Context, input gqlmodel.DeleteWebhookInput) (*gqlmodel.DeleteWebhookPayload, error) {
	iId, wId, err := gqlmodel.ToID2[id.Integration, id.Webhook](input.IntegrationID, input.WebhookID)
	if err != nil {
		return nil, err
	}

	err = usecases(ctx).Integration.DeleteWebhook(ctx, iId, wId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWebhookPayload{
		WebhookID: input.WebhookID,
	}, nil
}

func FromPtr[T any](pointer *T, defaultValue T) T {
	if pointer != nil {
		return *pointer
	}
	return defaultValue
}
