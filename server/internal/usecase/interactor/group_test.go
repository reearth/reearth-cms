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
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func newGroupOp() *usecase.Operator {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}
}

func newGroupOpNoUser() *usecase.Operator {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}
}

// buildGroupWithProject creates a group + backing project in db, returns both.
func buildGroupWithProject(ctx context.Context, t *testing.T, db *repo.Container) (*group.Group, *project.Project, accountdomain.WorkspaceID) {
	t.Helper()
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	p := project.New().ID(pid).Workspace(wid).MustBuild()
	g := group.New().NewID().Project(pid).Schema(sid).Key(id.RandomKey()).MustBuild()
	assert.NoError(t, db.Project.Save(ctx, p))
	assert.NoError(t, db.Group.Save(ctx, g))
	return g, p, wid
}

func newGroupGateways(t *testing.T, setup func(*gatewaymock.MockAuthorization)) *gateway.Container {
	t.Helper()
	ctrl := gomock.NewController(t)
	mockAuth := gatewaymock.NewMockAuthorization(ctrl)
	setup(mockAuth)
	return &gateway.Container{Authorization: mockAuth}
}

// ─── FindByID ────────────────────────────────────────────────────────────────

func TestGroup_FindByID(t *testing.T) {
	t.Parallel()
	op := newGroupOp()
	opNoUser := newGroupOpNoUser()

	tests := []struct {
		name      string
		operator  *usecase.Operator
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name:     "no auth gateway - allowed",
			operator: op,
		},
		{
			name:     "permission allowed",
			operator: op,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied",
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			operator: op,
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
		{
			name:     "no user in operator - still runs check",
			operator: opNoUser,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByID(ctx, g.ID(), tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, g, got)
		})
	}

	t.Run("not found", func(t *testing.T) {
		t.Parallel()
		db := memory.New()
		uc := NewGroup(db, nil)
		_, err := uc.FindByID(context.Background(), id.NewGroupID(), op)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})
}

// ─── FindByIDs ───────────────────────────────────────────────────────────────

func TestGroup_FindByIDs(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		empty     bool
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "empty list - no permission check",
			empty: true,
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			ids := id.GroupIDList{g.ID()}
			if tc.empty {
				ids = id.GroupIDList{}
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByIDs(ctx, ids, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			if !tc.empty {
				assert.Len(t, got, 1)
			} else {
				assert.Empty(t, got)
			}
		})
	}
}

// ─── FindByProject ───────────────────────────────────────────────────────────

func TestGroup_FindByProject(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, p, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByProject(ctx, p.ID(), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
			assert.Equal(t, g.ID(), got[0].ID())
		})
	}
}

// ─── Filter ──────────────────────────────────────────────────────────────────

func TestGroup_Filter(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionList, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			_, p, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, _, err := uc.Filter(ctx, p.ID(), nil, nil, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
		})
	}
}

// ─── FindByKey ───────────────────────────────────────────────────────────────

func TestGroup_FindByKey(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, p, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByKey(ctx, p.ID(), g.Key().String(), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, g.ID(), got.ID())
		})
	}
}

// ─── FindByIDOrKey ───────────────────────────────────────────────────────────

func TestGroup_FindByIDOrKey(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, p, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByIDOrKey(ctx, p.ID(), group.IDOrKey(g.ID().String()), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, g.ID(), got.ID())
		})
	}
}

// ─── Create ──────────────────────────────────────────────────────────────────

func TestGroup_Create(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionCreate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionCreate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionCreate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			wid := accountdomain.NewWorkspaceID()
			pid := id.NewProjectID()
			p := project.New().ID(pid).Workspace(wid).MustBuild()
			assert.NoError(t, db.Project.Save(ctx, p))

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			param := interfaces.CreateGroupParam{
				ProjectId: pid,
				Name:      "test-group",
				Key:       "test-key",
			}

			uc := NewGroup(db, gws)
			got, err := uc.Create(ctx, param, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, pid, got.Project())
			assert.Equal(t, "test-group", got.Name())
		})
	}
}

// ─── Update ──────────────────────────────────────────────────────────────────

func TestGroup_Update(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			newName := "updated-name"
			param := interfaces.UpdateGroupParam{
				GroupID: g.ID(),
				Name:    &newName,
			}

			uc := NewGroup(db, gws)
			got, err := uc.Update(ctx, param, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, newName, got.Name())
		})
	}
}

// ─── Delete ──────────────────────────────────────────────────────────────────

func TestGroup_Delete(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionDelete, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionDelete, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionDelete, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			err := uc.Delete(ctx, g.ID(), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
		})
	}

	t.Run("delete fails when group is used by a model", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()
		g, p, _ := buildGroupWithProject(ctx, t, db)

		// Create a schema + model that references this group
		sid := id.NewSchemaID()
		fg := schema.NewGroup(g.ID())
		tp := fg.TypeProperty()
		f := schema.NewField(tp).NewID().RandomKey().MustBuild()
		s := schema.New().ID(sid).Workspace(p.Workspace()).Project(p.ID()).Fields([]*schema.Field{f}).MustBuild()
		assert.NoError(t, db.Schema.Save(ctx, s))

		mid := id.NewModelID()
		m := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(p.ID()).MustBuild()
		assert.NoError(t, db.Model.Save(ctx, m))

		uc := NewGroup(db, nil)
		err := uc.Delete(ctx, g.ID(), op)
		assert.ErrorIs(t, err, interfaces.ErrDelGroupUsed)
	})
}

// ─── FindModelsByGroup ───────────────────────────────────────────────────────

func TestGroup_FindModelsByGroup(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindModelsByGroup(ctx, g.ID(), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Empty(t, got) // no models reference this group
		})
	}
}

// ─── FindByModel ─────────────────────────────────────────────────────────────

func TestGroup_FindByModel(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			wid := accountdomain.NewWorkspaceID()
			pid := id.NewProjectID()
			sid := id.NewSchemaID()
			p := project.New().ID(pid).Workspace(wid).MustBuild()
			s := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
			mid := id.NewModelID()
			m := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.Schema.Save(ctx, s))
			assert.NoError(t, db.Model.Save(ctx, m))

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.FindByModel(ctx, mid, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Empty(t, got) // schema has no group-type fields
		})
	}
}

// ─── UpdateOrder ─────────────────────────────────────────────────────────────

func TestGroup_UpdateOrder(t *testing.T) {
	t.Parallel()
	op := newGroupOp()

	tests := []struct {
		name      string
		wantErr   error
		setupAuth func(*gatewaymock.MockAuthorization)
	}{
		{
			name: "no auth gateway - allowed",
		},
		{
			name: "permission allowed",
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(m *gatewaymock.MockAuthorization) {
				m.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceGroup, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			g, _, _ := buildGroupWithProject(ctx, t, db)

			var gws *gateway.Container
			if tc.setupAuth != nil {
				gws = newGroupGateways(t, tc.setupAuth)
			}

			uc := NewGroup(db, gws)
			got, err := uc.UpdateOrder(ctx, id.GroupIDList{g.ID()}, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
		})
	}

	t.Run("empty ids returns nil", func(t *testing.T) {
		t.Parallel()
		db := memory.New()
		uc := NewGroup(db, nil)
		got, err := uc.UpdateOrder(context.Background(), id.GroupIDList{}, op)
		assert.NoError(t, err)
		assert.Nil(t, got)
	})
}
