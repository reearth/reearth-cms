package interactor

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

type Integration struct {
	repos *repo.Container
}

func NewIntegration(r *repo.Container) interfaces.Integration {
	return &Integration{
		repos: r,
	}
}

func (i Integration) FindByUser(ctx context.Context, uId id.UserID, operator *usecase.Operator) (integration.List, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (integration.List, error) {
			in, err := i.repos.Integration.FindByUser(ctx, uId)
			if err != nil {
				return nil, err
			}
			return in, nil
		})
}

func (i Integration) FindByIDs(ctx context.Context, ids []id.IntegrationID, operator *usecase.Operator) (integration.List, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (integration.List, error) {
			in, err := i.repos.Integration.FindByIDs(ctx, ids)
			if err != nil {
				return nil, err
			}
			return in, err
		})
}

func (i Integration) Create(ctx context.Context, param interfaces.CreateIntegrationParam, operator *usecase.Operator) (*integration.Integration, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (*integration.Integration, error) {
			in, err := integration.New().
				NewID().
				Type(param.Type).
				Developer(operator.User).
				Name(param.Name).
				Description(lo.FromPtr(param.Description)).
				Token("").
				LogoUrl(&param.Logo).
				Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Integration.Save(ctx, in); err != nil {
				return nil, err
			}

			return in, nil
		})
}

func (i Integration) Update(ctx context.Context, iId id.IntegrationID, param interfaces.UpdateIntegrationParam, operator *usecase.Operator) (*integration.Integration, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (*integration.Integration, error) {
			in, err := i.repos.Integration.FindByID(ctx, iId)
			if err != nil {
				return nil, err
			}

			if in.Developer() != operator.User {
				return nil, interfaces.ErrOperationDenied
			}

			if param.Name != nil {
				in.SetName(*param.Name)
			}

			if param.Description != nil {
				in.SetDescription(*param.Description)
			}

			if param.Logo != nil {
				in.SetLogoUrl(param.Logo)
			}

			in.SetUpdatedAt(time.Now())
			if err := i.repos.Integration.Save(ctx, in); err != nil {
				return nil, err
			}

			return in, nil
		})
}

func (i Integration) Delete(ctx context.Context, integrationId id.IntegrationID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func() error {
			in, err := i.repos.Integration.FindByID(ctx, integrationId)
			if err != nil {
				return err
			}
			if in.Developer() != operator.User {
				return interfaces.ErrOperationDenied
			}
			return i.repos.Integration.Save(ctx, in)
		})
}

func (i Integration) CreateWebhook(ctx context.Context, iId id.IntegrationID, param interfaces.CreateWebhookParam, operator *usecase.Operator) (*integration.Webhook, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (*integration.Webhook, error) {
			in, err := i.repos.Integration.FindByID(ctx, iId)
			if err != nil {
				return nil, err
			}

			if in.Developer() != operator.User {
				return nil, interfaces.ErrOperationDenied
			}

			t := integration.WebhookTrigger{
				OnItemCreate:    param.Trigger.OnItemCreate,
				OnItemUpdate:    param.Trigger.OnItemUpdate,
				OnItemDelete:    param.Trigger.OnItemDelete,
				OnAssetUpload:   param.Trigger.OnAssetUpload,
				OnAssetDeleted:  param.Trigger.OnAssetDeleted,
				OnItemPublish:   param.Trigger.OnItemPublish,
				OnItemUnPublish: param.Trigger.OnItemUnPublish,
			}
			w, err := integration.NewWebhookBuilder().
				NewID().
				Name(param.Name).
				Url(&param.URL).
				Active(param.Active).
				Trigger(t).
				Build()

			if err != nil {
				return nil, err
			}

			in.AddWebhook(w)

			in.SetUpdatedAt(time.Now())
			if err := i.repos.Integration.Save(ctx, in); err != nil {
				return nil, err
			}

			return w, nil
		})
}

func (i Integration) UpdateWebhook(ctx context.Context, iId id.IntegrationID, wId id.WebhookID, param interfaces.UpdateWebhookParam, operator *usecase.Operator) (*integration.Webhook, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (*integration.Webhook, error) {
			in, err := i.repos.Integration.FindByID(ctx, iId)
			if err != nil {
				return nil, err
			}

			if in.Developer() != operator.User {
				return nil, interfaces.ErrOperationDenied
			}

			w, ok := in.Webhook(wId)
			if !ok {
				return nil, rerror.ErrNotFound
			}

			if param.Name != nil {
				w.SetName(*param.Name)
			}

			if param.URL != nil {
				w.SetUrl(param.URL)
			}

			if param.Active != nil {
				w.SetActive(*param.Active)
			}

			if param.Trigger != nil {
				t := integration.WebhookTrigger{
					OnItemCreate:    param.Trigger.OnItemCreate,
					OnItemUpdate:    param.Trigger.OnItemUpdate,
					OnItemDelete:    param.Trigger.OnItemDelete,
					OnAssetUpload:   param.Trigger.OnAssetUpload,
					OnAssetDeleted:  param.Trigger.OnAssetDeleted,
					OnItemPublish:   param.Trigger.OnItemPublish,
					OnItemUnPublish: param.Trigger.OnItemUnPublish,
				}
				w.SetTrigger(t)
			}

			w.SetUpdatedAt(time.Now())

			in.UpdateWebhook(wId, w)

			in.SetUpdatedAt(time.Now())
			if err := i.repos.Integration.Save(ctx, in); err != nil {
				return nil, err
			}

			return w, nil
		})
}

func (i Integration) DeleteWebhook(ctx context.Context, iId id.IntegrationID, wId id.WebhookID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func() error {
			in, err := i.repos.Integration.FindByID(ctx, iId)
			if err != nil {
				return err
			}

			if in.Developer() != operator.User {
				return interfaces.ErrOperationDenied
			}

			ok := in.DeleteWebhook(wId)
			if !ok {
				return rerror.ErrNotFound
			}

			in.SetUpdatedAt(time.Now())
			if err := i.repos.Integration.Save(ctx, in); err != nil {
				return err
			}

			return nil
		})
}
