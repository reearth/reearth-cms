package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
)

func TestProject_Fetch(t *testing.T) {
	mocktime := time.Now()
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
		},
	}

	type args struct {
		ids      []id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		filter         project.IDList
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:   "Fetch 1 without operator",
			seeds:  project.List{p1, p2},
			filter: project.IDList{},
			args: args{
				ids: []id.ProjectID{pid1},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: lo.ToPtr(u.ID()),
					},
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			projectUC := NewProject(db, nil)

			got, err := projectUC.Fetch(ctx, tc.args.ids, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_FindByWorkspace(t *testing.T) {
	mocktime := time.Now()
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
		},
	}

	type args struct {
		ids      []id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 1 without operator",
			seeds: project.List{p1, p2},
			args: args{
				ids: []id.ProjectID{pid1},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: lo.ToPtr(u.ID()),
					},
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			projectUC := NewProject(db, nil)

			got, err := projectUC.Fetch(ctx, tc.args.ids, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_Create(t *testing.T) {
	mocktime := time.Now()
	wid := accountdomain.NewWorkspaceID()
	r := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: nil,
			WritableWorkspaces: nil,
			OwningWorkspaces:   []accountdomain.WorkspaceID{wid},
		},
	}

	type args struct {
		cpp      interfaces.CreateProjectParam
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   project.List
		args    args
		want    *project.Project
		wantErr error
	}{
		{
			name:  "Create",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID:  wid,
					Name:         lo.ToPtr("P001"),
					Description:  lo.ToPtr("D001"),
					Alias:        lo.ToPtr("Test001"),
					RequestRoles: r,
				},
				operator: op,
			},
			want: project.New().
				NewID().
				Name("P001").
				Alias("Test001").
				Description("D001").
				Workspace(wid).
				RequestRoles(r).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "Create Operation Denied",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID:  wid,
					Name:         lo.ToPtr("P002"),
					Description:  lo.ToPtr("D002"),
					Alias:        lo.ToPtr("Test002"),
					RequestRoles: r,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: lo.ToPtr(u.ID()),
					},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			projectUC := NewProject(db, nil)

			got, err := projectUC.Create(ctx, tc.args.cpp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want.Name(), got.Name())
			assert.Equal(t, tc.want.Alias(), got.Alias())
			assert.Equal(t, tc.want.Description(), got.Description())
			assert.Equal(t, tc.want.Workspace(), got.Workspace())
			assert.Equal(t, tc.want.RequestRoles(), got.RequestRoles())

			dbGot, err := db.Project.FindByID(ctx, got.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.want.Name(), dbGot.Name())
			assert.Equal(t, tc.want.Alias(), dbGot.Alias())
			assert.Equal(t, tc.want.Description(), dbGot.Description())
			assert.Equal(t, tc.want.Workspace(), dbGot.Workspace())
			assert.Equal(t, tc.want.RequestRoles(), dbGot.RequestRoles())
		})
	}
}

func TestProject_Update(t *testing.T) {
	mocktime := time.Now()
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	r1 := []workspace.Role{workspace.RoleOwner}
	r2 := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).RequestRoles(r1).UpdatedAt(mocktime.Add(-time.Second)).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).RequestRoles(r2).Alias("testAlias").UpdatedAt(mocktime).MustBuild()

	// Project with explicit private visibility for policy test
	pid3 := id.NewProjectID()
	p3 := project.New().ID(pid3).Workspace(wid1).RequestRoles(r1).
		Accessibility(project.NewPrivateAccessibility(project.PublicationSettings{}, nil)).
		UpdatedAt(mocktime.Add(-time.Second)).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
			OwningWorkspaces:   []accountdomain.WorkspaceID{wid1},
		},
	}

	type args struct {
		upp      interfaces.UpdateProjectParam
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           *project.Project
		mockProjectErr bool
		policyChecker  gateway.PolicyChecker
		wantErr        error
	}{
		{
			name:  "update",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:           p1.ID(),
					Name:         lo.ToPtr("test123"),
					Description:  lo.ToPtr("desc321"),
					Alias:        lo.ToPtr("alias"),
					RequestRoles: r1,
				},
				operator: op,
			},
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				Name("test123").
				Description("desc321").
				Alias("alias").
				RequestRoles(r1).
				UpdatedAt(mocktime).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "update od",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:          p2.ID(),
					Name:        lo.ToPtr("test123"),
					Description: lo.ToPtr("desc321"),
					Alias:       lo.ToPtr("alias"),
				},
				operator: op,
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:  "update duplicated alias",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:    p1.ID(),
					Alias: lo.ToPtr("testAlias"),
					Accessibility: &interfaces.AccessibilityParam{
						Visibility: lo.ToPtr(project.VisibilityPublic),
					},
				},
				operator: op,
			},
			want:    nil,
			wantErr: interfaces.ErrProjectAliasAlreadyUsed,
		},
		{
			name:  "update publication",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID: p1.ID(),
					Accessibility: &interfaces.AccessibilityParam{
						Visibility: lo.ToPtr(project.VisibilityPublic),
					},
				},
				operator: op,
			},
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				UpdatedAt(mocktime).
				Accessibility(project.NewPublicAccessibility()).
				RequestRoles(r1).
				MustBuild(),
		},
		{
			name:  "update skip roles",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:           p1.ID(),
					RequestRoles: r2,
				},
				operator: op,
			},
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				RequestRoles(r2).
				UpdatedAt(mocktime).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "update visibility change",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID: p1.ID(),
					Accessibility: &interfaces.AccessibilityParam{
						Visibility: lo.ToPtr(project.VisibilityPublic),
					},
				},
				operator: op,
			},
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				RequestRoles(r1).
				UpdatedAt(mocktime).
				Accessibility(project.NewPublicAccessibility()).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "update visibility change exceeds limit",
			seeds: project.List{p3},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID: p3.ID(),
					Accessibility: &interfaces.AccessibilityParam{
						Visibility: lo.ToPtr(project.VisibilityPublic),
					},
				},
				operator: op,
			},
			policyChecker: &mockPolicyChecker{allowed: false},
			want:          nil,
			wantErr:       interfaces.ErrProjectCreationLimitExceeded,
		},
		{
			name: "mock error",
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:           p1.ID(),
					RequestRoles: r2,
				},
				operator: op,
			},
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			var gateways *gateway.Container
			if tc.policyChecker != nil {
				gateways = &gateway.Container{
					PolicyChecker: tc.policyChecker,
				}
			}
			projectUC := NewProject(db, gateways)

			got, err := projectUC.Update(ctx, tc.args.upp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_CheckAlias(t *testing.T) {
	mocktime := time.Now()
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).Alias("test123").UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
		},
	}

	type args struct {
		alias    string
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   project.List
		args    args
		want    bool
		wantErr error
	}{
		{
			name:  "Check found",
			seeds: project.List{p1, p2},
			args: args{
				alias:    "test123",
				operator: op,
			},
			want:    false,
			wantErr: nil,
		},
		{
			name:  "Check not found",
			seeds: project.List{p1, p2},
			args: args{
				alias:    "321test",
				operator: op,
			},
			want:    true,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			projectUC := NewProject(db, nil)

			got, err := projectUC.CheckAlias(ctx, tc.args.alias)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_Delete(t *testing.T) {
	mocktime := time.Now()
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid1},
		},
	}

	opOwner := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid1},
			OwningWorkspaces:   []accountdomain.WorkspaceID{wid1},
		},
	}

	type args struct {
		id       id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "delete",
			seeds: project.List{p1, p2},
			args: args{
				id:       pid1,
				operator: opOwner,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "delete not found",
			seeds: project.List{p1, p2},
			args: args{
				id:       id.NewProjectID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete operation denied",
			seeds: project.List{},
			args: args{
				id:       pid2,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete operation denied 2",
			seeds: project.List{},
			args: args{
				id:       pid1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "mock error",
			args: args{
				id:       pid1,
				operator: op,
			},
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			projectUC := NewProject(db, nil)

			err := projectUC.Delete(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)

			_, err = db.Project.FindByID(ctx, tc.args.id)
			assert.Equal(t, rerror.ErrNotFound, err)
		})
	}
}

// conditionalPolicyChecker allows different responses for different check types
type conditionalPolicyChecker struct {
	publicAllowed  bool
	privateAllowed bool
	shouldError    bool
	errorType      gateway.PolicyCheckType
}

func (c *conditionalPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	if c.shouldError && req.CheckType == c.errorType {
		return nil, errors.New("policy check error")
	}

	var allowed bool
	switch req.CheckType {
	case gateway.PolicyCheckGeneralPublicProjectCreation:
		allowed = c.publicAllowed
	case gateway.PolicyCheckGeneralPrivateProjectCreation:
		allowed = c.privateAllowed
	default:
		allowed = true
	}

	return &gateway.PolicyCheckResponse{
		Allowed:      allowed,
		CheckType:    req.CheckType,
		CurrentLimit: "test limit",
		Message:      "test message",
		Value:        req.Value,
	}, nil
}

func TestProject_CheckProjectLimits(t *testing.T) {
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	u := user.New().Name("test").NewID().Email("test@test.com").Workspace(wid1).MustBuild()
	
	// Valid operator with access to wid1
	validOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1},
		},
	}

	// Invalid operator (no user)
	invalidOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	// Operator without workspace access
	noAccessOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid2}, // different workspace
		},
	}

	tests := []struct {
		name          string
		workspaceID   accountdomain.WorkspaceID
		operator      *usecase.Operator
		policyChecker gateway.PolicyChecker
		want          *interfaces.ProjectLimitsResult
		wantErr       error
	}{
		{
			name:        "invalid operator",
			workspaceID: wid1,
			operator:    invalidOp,
			want:        nil,
			wantErr:     interfaces.ErrInvalidOperator,
		},
		{
			name:        "no workspace access",
			workspaceID: wid1,
			operator:    noAccessOp,
			want:        nil,
			wantErr:     interfaces.ErrOperationDenied,
		},
		{
			name:          "no policy checker - default allow",
			workspaceID:   wid1,
			operator:      validOp,
			policyChecker: nil,
			want: &interfaces.ProjectLimitsResult{
				PublicProjectsAllowed:  true,
				PrivateProjectsAllowed: true,
			},
			wantErr: nil,
		},
		{
			name:        "both projects allowed",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  true,
				privateAllowed: true,
			},
			want: &interfaces.ProjectLimitsResult{
				PublicProjectsAllowed:  true,
				PrivateProjectsAllowed: true,
			},
			wantErr: nil,
		},
		{
			name:        "only public projects allowed",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  true,
				privateAllowed: false,
			},
			want: &interfaces.ProjectLimitsResult{
				PublicProjectsAllowed:  true,
				PrivateProjectsAllowed: false,
			},
			wantErr: nil,
		},
		{
			name:        "only private projects allowed",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  false,
				privateAllowed: true,
			},
			want: &interfaces.ProjectLimitsResult{
				PublicProjectsAllowed:  false,
				PrivateProjectsAllowed: true,
			},
			wantErr: nil,
		},
		{
			name:        "both projects denied",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  false,
				privateAllowed: false,
			},
			want: &interfaces.ProjectLimitsResult{
				PublicProjectsAllowed:  false,
				PrivateProjectsAllowed: false,
			},
			wantErr: nil,
		},
		{
			name:        "public policy check error",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  true,
				privateAllowed: true,
				shouldError:    true,
				errorType:      gateway.PolicyCheckGeneralPublicProjectCreation,
			},
			want:    nil,
			wantErr: errors.New("policy check error"),
		},
		{
			name:        "private policy check error",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				publicAllowed:  true,
				privateAllowed: true,
				shouldError:    true,
				errorType:      gateway.PolicyCheckGeneralPrivateProjectCreation,
			},
			want:    nil,
			wantErr: errors.New("policy check error"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			var gateways *gateway.Container
			if tc.policyChecker != nil {
				gateways = &gateway.Container{
					PolicyChecker: tc.policyChecker,
				}
			}

			projectUC := NewProject(db, gateways)

			got, err := projectUC.CheckProjectLimits(ctx, tc.workspaceID, tc.operator)

			if tc.wantErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tc.wantErr.Error())
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
