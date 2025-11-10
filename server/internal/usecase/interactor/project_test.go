package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

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
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// sequentialPolicyChecker for testing multiple policy calls
type sequentialPolicyChecker struct {
	responses     []gateway.PolicyCheckResponse
	responseIndex int
}

func (s *sequentialPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	if s.responseIndex >= len(s.responses) {
		return &gateway.PolicyCheckResponse{
			Allowed:      false,
			CheckType:    req.CheckType,
			CurrentLimit: "unexpected call",
			Message:      "unexpected policy check call",
			Value:        req.Value,
		}, nil
	}

	response := s.responses[s.responseIndex]
	response.CheckType = req.CheckType
	response.Value = req.Value
	s.responseIndex++

	return &response, nil
}

// mockPolicyChecker for simple allow/deny testing
type mockPolicyChecker struct {
	allowed bool
	message string
}

func (m *mockPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	return &gateway.PolicyCheckResponse{
		Allowed:      m.allowed,
		CheckType:    req.CheckType,
		CurrentLimit: "test limit",
		Message:      m.message,
		Value:        req.Value,
	}, nil
}

func TestProject_Fetch(t *testing.T) {
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()

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
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()

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
		name          string
		seeds         project.List
		args          args
		want          *project.Project
		policyChecker gateway.PolicyChecker
		wantErr       error
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
		{
			name:  "Create denied by general operation policy",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID:  wid,
					Name:         lo.ToPtr("P003"),
					Description:  lo.ToPtr("D003"),
					Alias:        lo.ToPtr("Test003"),
					RequestRoles: r,
				},
				operator: op,
			},
			policyChecker: &sequentialPolicyChecker{
				responses: []gateway.PolicyCheckResponse{
					{Allowed: false, CurrentLimit: "test limit", Message: "general operation denied"},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:  "Create denied by project creation policy",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID:  wid,
					Name:         lo.ToPtr("P004"),
					Description:  lo.ToPtr("D004"),
					Alias:        lo.ToPtr("Test004"),
					RequestRoles: r,
				},
				operator: op,
			},
			policyChecker: &sequentialPolicyChecker{
				responses: []gateway.PolicyCheckResponse{
					{Allowed: true, CurrentLimit: "test limit", Message: "general operation allowed"},
					{Allowed: false, CurrentLimit: "test limit", Message: "project creation denied"},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrProjectCreationLimitExceeded,
		},
		{
			name:  "Create with both policies allowed",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID:  wid,
					Name:         lo.ToPtr("P005"),
					Description:  lo.ToPtr("D005"),
					Alias:        lo.ToPtr("Test005"),
					RequestRoles: r,
				},
				operator: op,
			},
			policyChecker: &sequentialPolicyChecker{
				responses: []gateway.PolicyCheckResponse{
					{Allowed: true, CurrentLimit: "test limit", Message: "general operation allowed"},
					{Allowed: true, CurrentLimit: "test limit", Message: "project creation allowed"},
				},
			},
			want: project.New().
				NewID().
				Name("P005").
				Alias("Test005").
				Description("D005").
				Workspace(wid).
				RequestRoles(r).
				MustBuild(),
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
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
	now := util.Now()
	defer util.MockNow(now)

	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	r1 := []workspace.Role{workspace.RoleOwner}
	r2 := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).RequestRoles(r1).UpdatedAt(now.Add(-time.Hour)).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).RequestRoles(r2).Alias("testAlias").UpdatedAt(now.Add(-time.Minute)).MustBuild()

	// Project with explicit private visibility for policy test
	pid3 := id.NewProjectID()
	p3 := project.New().ID(pid3).Workspace(wid1).RequestRoles(r1).
		Accessibility(project.NewPrivateAccessibility(project.PublicationSettings{}, nil)).
		UpdatedAt(now.Add(-time.Second)).MustBuild()

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
				UpdatedAt(now).
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
				UpdatedAt(now).
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
				UpdatedAt(now).
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
				UpdatedAt(now).
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
			policyChecker: &conditionalPolicyChecker{
				generalOpAllowed: true,  // Allow general operation
				publicAllowed:    false, // But deny public project creation
				privateAllowed:   true,
			},
			want:    nil,
			wantErr: interfaces.ErrProjectCreationLimitExceeded,
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
		{
			name:  "update readme",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:     p1.ID(),
					Readme: lo.ToPtr("new readme"),
				},
				operator: op,
			},
			wantErr: nil,
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				RequestRoles(r1).
				Readme("new readme").
				UpdatedAt(now).
				MustBuild(),
		},
		{
			name:  "update readme on limited plan",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:     p1.ID(),
					Readme: lo.ToPtr("new readme"),
				},
				operator: op,
			},
			policyChecker: &conditionalPolicyChecker{
				generalOpAllowed: true,  // Allow general operation
				publicAllowed:    false, // Other limits don't matter for readme updates
				privateAllowed:   false,
			},
			wantErr: nil,
			want: project.New().
				ID(pid1).
				Workspace(wid1).
				RequestRoles(r1).
				Readme("new readme").
				UpdatedAt(now).
				MustBuild(),
		},
		{
			name:  "update denied by general operation policy",
			seeds: project.List{p1},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:   p1.ID(),
					Name: lo.ToPtr("Updated Name"),
				},
				operator: op,
			},
			policyChecker: &sequentialPolicyChecker{
				responses: []gateway.PolicyCheckResponse{
					{Allowed: false, CurrentLimit: "test limit", Message: "general operation denied"},
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
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
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
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).Alias("test123").MustBuild()

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
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).MustBuild()

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
		mockProjectErr bool
		policyChecker  gateway.PolicyChecker
		wantErr        error
	}{
		{
			name:  "delete",
			seeds: project.List{p1, p2},
			args: args{
				id:       pid1,
				operator: opOwner,
			},
			wantErr: nil,
		},
		{
			name:  "delete not found",
			seeds: project.List{p1, p2},
			args: args{
				id:       id.NewProjectID(),
				operator: op,
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete operation denied",
			seeds: project.List{},
			args: args{
				id:       pid2,
				operator: op,
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete operation denied 2",
			seeds: project.List{},
			args: args{
				id:       pid1,
				operator: op,
			},
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
		{
			name:  "delete denied by general operation policy",
			seeds: project.List{p1},
			args: args{
				id:       pid1,
				operator: opOwner,
			},
			policyChecker: &sequentialPolicyChecker{
				responses: []gateway.PolicyCheckResponse{
					{Allowed: false, CurrentLimit: "test limit", Message: "general operation denied"},
				},
			},
			wantErr: interfaces.ErrOperationDenied,
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
	publicAllowed    bool
	privateAllowed   bool
	generalOpAllowed bool
	shouldError      bool
	errorType        gateway.PolicyCheckType
}

func (c *conditionalPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	if c.shouldError && req.CheckType == c.errorType {
		return nil, errors.New("policy check error")
	}

	var allowed bool
	switch req.CheckType {
	case gateway.PolicyCheckGeneralOperationAllowed:
		allowed = c.generalOpAllowed
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
				generalOpAllowed: true,
				publicAllowed:    true,
				privateAllowed:   true,
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
				generalOpAllowed: true,
				publicAllowed:    true,
				privateAllowed:   false,
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
				generalOpAllowed: true,
				publicAllowed:    false,
				privateAllowed:   true,
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
				generalOpAllowed: true,
				publicAllowed:    false,
				privateAllowed:   false,
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
				generalOpAllowed: true,
				publicAllowed:    true,
				privateAllowed:   true,
				shouldError:      true,
				errorType:        gateway.PolicyCheckGeneralPublicProjectCreation,
			},
			want:    nil,
			wantErr: errors.New("policy check error"),
		},
		{
			name:        "private policy check error",
			workspaceID: wid1,
			operator:    validOp,
			policyChecker: &conditionalPolicyChecker{
				generalOpAllowed: true,
				publicAllowed:    true,
				privateAllowed:   true,
				shouldError:      true,
				errorType:        gateway.PolicyCheckGeneralPrivateProjectCreation,
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

func TestProject_StarProject(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	u1 := user.New().Name("user1").NewID().Email("user1@test.com").Workspace(wid1).MustBuild()
	u1ID := u1.ID()

	u2 := user.New().Name("user2").NewID().Email("user2@test.com").Workspace(wid2).MustBuild()
	u2ID := u2.ID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).Alias("test-project").UpdatedAt(now.Add(-time.Hour)).MustBuild()

	pid3 := id.NewProjectID()
	p3 := project.New().ID(pid3).Workspace(wid2).UpdatedAt(now.Add(-time.Hour)).MustBuild()

	validOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u1ID),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
		},
	}

	otherUserOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u2ID),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid1, wid2},
		},
	}

	invalidOp := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	type args struct {
		idOrAlias project.IDOrAlias
		operator  *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           *project.Project
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "star project owned by another user",
			seeds: project.List{p1.Clone()},
			args: args{
				idOrAlias: project.IDOrAlias(p1.ID().String()),
				operator:  otherUserOp,
			},
			want: func() *project.Project {
				p := p1.Clone()
				p.Star(u2ID)
				p.SetUpdatedAt(now.Add(-time.Hour))
				return p
			}(),
			wantErr: nil,
		},
		{
			name:  "star project by ID",
			seeds: project.List{p1.Clone()},
			args: args{
				idOrAlias: project.IDOrAlias(pid1.String()),
				operator:  validOp,
			},
			want: func() *project.Project {
				p := p1.Clone()
				p.Star(u1ID)
				p.SetUpdatedAt(now.Add(-time.Hour))
				return p
			}(),
			wantErr: nil,
		},
		{
			name:  "star project by alias",
			seeds: project.List{p1.Clone()},
			args: args{
				idOrAlias: project.IDOrAlias("test-project"),
				operator:  validOp,
			},
			want: func() *project.Project {
				p := p1.Clone()
				p.Star(u1ID)
				p.SetUpdatedAt(now.Add(-time.Hour))
				return p
			}(),
			wantErr: nil,
		},
		{
			name:  "star project in different workspace",
			seeds: project.List{p3.Clone()},
			args: args{
				idOrAlias: project.IDOrAlias(pid3.String()),
				operator:  validOp,
			},
			want: func() *project.Project {
				p := p3.Clone()
				p.Star(u1ID)
				p.SetUpdatedAt(now.Add(-time.Hour))
				return p
			}(),
			wantErr: nil,
		},
		{
			name:  "invalid operator - no user",
			seeds: project.List{p1.Clone()},
			args: args{
				idOrAlias: project.IDOrAlias(pid1.String()),
				operator:  invalidOp,
			},
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:  "project not found by ID",
			seeds: project.List{},
			args: args{
				idOrAlias: project.IDOrAlias(id.NewProjectID().String()),
				operator:  validOp,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "project not found by alias",
			seeds: project.List{},
			args: args{
				idOrAlias: project.IDOrAlias("non-existent-alias"),
				operator:  validOp,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "repository error on find",
			args: args{
				idOrAlias: project.IDOrAlias(pid1.String()),
				operator:  validOp,
			},
			mockProjectErr: true,
			want:           nil,
			wantErr:        errors.New("test"),
		},
		{
			name: "updated_at should not change when starring",
			seeds: project.List{func() *project.Project {
				p := p1.Clone()
				p.SetUpdatedAt(now.Add(-time.Hour)) // Set to an hour ago
				return p
			}()},
			args: args{
				idOrAlias: project.IDOrAlias(pid1.String()),
				operator:  validOp,
			},
			want: func() *project.Project {
				p := p1.Clone()
				p.Star(u1ID)
				p.SetUpdatedAt(now.Add(-time.Hour)) // Should remain the same
				return p
			}(),
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Removed t.Parallel() to fix user ID consistency issue in unstar test

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p)
				assert.NoError(t, err)
			}

			projectUC := NewProject(db, nil)

			got, err := projectUC.StarProject(ctx, tc.args.idOrAlias, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, tc.want.ID(), got.ID())

			// For star tests, check that the user IS in the starred list
			if tc.name == "star project by ID" || tc.name == "star project by alias" || tc.name == "star project in different workspace" {
				assert.Contains(t, got.StarredBy(), u1ID.String())
				assert.Len(t, got.StarredBy(), 1)
			}

			// Verify that UpdatedAt was NOT updated when starring (should remain 1 hour ago)
			expectedTime := now.Add(-time.Hour)
			assert.True(t, got.UpdatedAt().Equal(expectedTime) || got.UpdatedAt().Equal(expectedTime.Truncate(time.Microsecond)),
				"UpdatedAt should remain unchanged: expected %v, got %v", expectedTime, got.UpdatedAt())

			dbGot, err := db.Project.FindByID(ctx, got.ID())
			assert.NoError(t, err)

			// Same checks for database state
			if tc.name == "star project by ID" || tc.name == "star project by alias" || tc.name == "star project in different workspace" {
				assert.Contains(t, dbGot.StarredBy(), u1ID.String())
				assert.Len(t, dbGot.StarredBy(), 1)
			}

			// Verify that UpdatedAt was NOT updated in the database when starring (should remain 1 hour ago)
			assert.True(t, dbGot.UpdatedAt().Equal(expectedTime) || dbGot.UpdatedAt().Equal(expectedTime.Truncate(time.Microsecond)),
				"Database UpdatedAt should remain unchanged: expected %v, got %v", expectedTime, dbGot.UpdatedAt())
		})
	}
}
