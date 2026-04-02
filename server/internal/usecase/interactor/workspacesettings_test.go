package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_Fetch_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	wss := workspacesettings.New().ID(wid).MustBuild()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.WorkspaceSettings.Save(ctx, wss))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			wsUC := NewWorkspaceSettings(db, gateways)
			got, err := wsUC.Fetch(ctx, accountdomain.WorkspaceIDList{wid}, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
		})
	}
}

func TestWorkspaceSettings_UpdateOrCreate_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()

	opOwner := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:             lo.ToPtr(user.NewID()),
			OwningWorkspaces: accountdomain.WorkspaceIDList{wid},
		},
	}

	tests := []struct {
		name      string
		operator  *usecase.Operator
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name:     "permission allowed",
			operator: opOwner,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied",
			operator: opOwner,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:     "permission check error",
			operator: opOwner,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			wsUC := NewWorkspaceSettings(db, gateways)
			got, err := wsUC.UpdateOrCreate(ctx, interfaces.UpdateOrCreateWorkspaceSettingsParam{ID: wid}, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
		})
	}
}

func TestWorkspaceSettings_Delete_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()

	opOwner := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:             lo.ToPtr(user.NewID()),
			OwningWorkspaces: accountdomain.WorkspaceIDList{wid},
		},
	}

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionDelete, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceWorkspaceSettings, rbac.ActionDelete, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			wsUC := NewWorkspaceSettings(db, gateways)
			err := wsUC.Delete(ctx, interfaces.DeleteWorkspaceSettingsParam{ID: wid}, opOwner)
			assert.EqualError(t, err, tc.wantErr.Error())
		})
	}
}
