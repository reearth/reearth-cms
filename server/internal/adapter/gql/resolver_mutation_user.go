package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
)

func (r *mutationResolver) UpdateMe(ctx context.Context, input gqlmodel.UpdateMeInput) (*gqlmodel.UpdateMePayload, error) {
	res, err := usecases(ctx).User.UpdateMe(ctx, accountinterfaces.UpdateMeParam{
		Name:                 input.Name,
		Email:                input.Email,
		Lang:                 input.Lang,
		Theme:                user.ThemeFrom(input.Theme),
		Password:             input.Password,
		PasswordConfirmation: input.PasswordConfirmation,
	}, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMePayload{Me: gqlmodel.ToMe(res)}, nil
}

func (r *mutationResolver) RemoveMyAuth(ctx context.Context, input gqlmodel.RemoveMyAuthInput) (*gqlmodel.UpdateMePayload, error) {
	res, err := usecases(ctx).User.RemoveMyAuth(ctx, input.Auth, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMePayload{Me: gqlmodel.ToMe(res)}, nil
}

func (r *mutationResolver) DeleteMe(ctx context.Context, input gqlmodel.DeleteMeInput) (*gqlmodel.DeleteMePayload, error) {
	uid, err := gqlmodel.ToID[id.User](input.UserID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).User.DeleteMe(ctx, uid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteMePayload{UserID: input.UserID}, nil
}
