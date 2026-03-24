package app

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestGenerateUserOperator(t *testing.T) {
	ctx := context.Background()

	// Setup test data
	wId := accountdomain.NewWorkspaceID()
	uId := accountdomain.NewUserID()
	pId := id.NewProjectID()

	tests := []struct {
		name         string
		user         *user.User
		defaultLang  string
		setupRepos   func() *repo.Container
		expectedLang string
		expectError  bool
	}{
		{
			name:         "nil user returns nil operator",
			user:         nil,
			defaultLang:  "en",
			setupRepos:   func() *repo.Container { return nil },
			expectedLang: "",
			expectError:  false,
		},
		{
			name: "user with no metadata uses default language",
			user: user.New().
				ID(uId).
				Name("test").
				Email("test@example.com").
				Workspace(wId).
				MustBuild(),
			defaultLang: "en",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			},
			expectedLang: "en",
			expectError:  false,
		},
		{
			name: "user with metadata but root language uses default language",
			user: func() *user.User {
				metadata := user.NewMetadata()
				metadata.SetLang(language.Und) // root/undefined language
				return user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
			}(),
			defaultLang: "en",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			},
			expectedLang: "en",
			expectError:  false,
		},
		{
			name: "user with Japanese language in metadata",
			user: func() *user.User {
				metadata := user.NewMetadata()
				metadata.SetLang(language.Japanese)
				return user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
			}(),
			defaultLang: "en",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			},
			expectedLang: "ja",
			expectError:  false,
		},
		{
			name: "user with French language in metadata",
			user: func() *user.User {
				metadata := user.NewMetadata()
				metadata.SetLang(language.French)
				return user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
			}(),
			defaultLang: "en-US",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			},
			expectedLang: "fr",
			expectError:  false,
		},
		{
			name: "user with empty default language and user language",
			user: func() *user.User {
				metadata := user.NewMetadata()
				metadata.SetLang(language.German)
				return user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
			}(),
			defaultLang: "",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			},
			expectedLang: "de",
			expectError:  false,
		},
		{
			name: "user with reader role",
			user: func() *user.User {
				metadata := user.NewMetadata()
				metadata.SetLang(language.English)
				return user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
			}(),
			defaultLang: "ja",
			setupRepos: func() *repo.Container {
				return setupTestRepos(t, wId, uId, pId, workspace.RoleReader)
			},
			expectedLang: "en",
			expectError:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var appCtx *ApplicationContext
			if tt.user != nil {
				repos := tt.setupRepos()
				appCtx = &ApplicationContext{
					Repos: repos,
				}
			}

			op, err := generateUserOperator(ctx, appCtx, tt.user, tt.defaultLang)

			if tt.expectError {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)

			if tt.user == nil {
				assert.Nil(t, op)
				return
			}

			assert.NotNil(t, op)
			assert.Equal(t, tt.expectedLang, op.Lang)
			assert.Nil(t, op.Integration)
			assert.NotNil(t, op.AcOperator)
			assert.Equal(t, &uId, op.AcOperator.User)
		})
	}
}

func TestGenerateUserOperator_WorkspaceRoles(t *testing.T) {
	ctx := context.Background()
	wId := accountdomain.NewWorkspaceID()
	uId := accountdomain.NewUserID()
	pId := id.NewProjectID()

	tests := []struct {
		name        string
		role        workspace.Role
		checkOwner  bool
		checkMaint  bool
		checkWriter bool
		checkReader bool
	}{
		{
			name:        "owner role",
			role:        workspace.RoleOwner,
			checkOwner:  true,
			checkMaint:  false,
			checkWriter: false,
			checkReader: false,
		},
		{
			name:        "maintainer role",
			role:        workspace.RoleMaintainer,
			checkOwner:  false,
			checkMaint:  true,
			checkWriter: false,
			checkReader: false,
		},
		{
			name:        "writer role",
			role:        workspace.RoleWriter,
			checkOwner:  false,
			checkMaint:  false,
			checkWriter: true,
			checkReader: false,
		},
		{
			name:        "reader role",
			role:        workspace.RoleReader,
			checkOwner:  false,
			checkMaint:  false,
			checkWriter: false,
			checkReader: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			repos := setupTestRepos(t, wId, uId, pId, tt.role)
			appCtx := &ApplicationContext{
				Repos: repos,
			}

			u := user.New().
				ID(uId).
				Name("test").
				Email("test@example.com").
				Workspace(wId).
				MustBuild()

			op, err := generateUserOperator(ctx, appCtx, u, "en")
			assert.NoError(t, err)
			assert.NotNil(t, op)

			// Check workspace roles
			if tt.checkOwner {
				assert.Contains(t, op.AcOperator.OwningWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.MaintainableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.WritableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.ReadableWorkspaces, wId)
			} else if tt.checkMaint {
				assert.NotContains(t, op.AcOperator.OwningWorkspaces, wId)
				assert.Contains(t, op.AcOperator.MaintainableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.WritableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.ReadableWorkspaces, wId)
			} else if tt.checkWriter {
				assert.NotContains(t, op.AcOperator.OwningWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.MaintainableWorkspaces, wId)
				assert.Contains(t, op.AcOperator.WritableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.ReadableWorkspaces, wId)
			} else if tt.checkReader {
				assert.NotContains(t, op.AcOperator.OwningWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.MaintainableWorkspaces, wId)
				assert.NotContains(t, op.AcOperator.WritableWorkspaces, wId)
				assert.Contains(t, op.AcOperator.ReadableWorkspaces, wId)
			}

			// Check project roles
			if tt.checkOwner {
				assert.Contains(t, op.OwningProjects, pId)
			} else if tt.checkMaint {
				assert.Contains(t, op.MaintainableProjects, pId)
			} else if tt.checkWriter {
				assert.Contains(t, op.WritableProjects, pId)
			} else if tt.checkReader {
				assert.Contains(t, op.ReadableProjects, pId)
			}
		})
	}
}

// setupTestRepos creates a test repository container with a workspace and project
func setupTestRepos(t *testing.T, wId accountdomain.WorkspaceID, uId accountdomain.UserID, pId id.ProjectID, role workspace.Role) *repo.Container {
	t.Helper()

	// Create workspace with user role
	w := workspace.New().
		ID(wId).
		Name("test-workspace").
		Members(map[accountdomain.UserID]workspace.Member{
			uId: {Role: role},
		}).
		MustBuild()

	// Create project
	p := project.New().
		ID(pId).
		Name("test-project").
		Workspace(accountdomain.WorkspaceID(wId)).
		Alias("test-alias").
		MustBuild()

	// Setup memory repos
	workspaceRepo := accountmemory.NewWorkspace()
	_ = workspaceRepo.Save(context.Background(), w)

	projectRepo := memory.NewProject()
	_ = projectRepo.Save(context.Background(), p)

	return &repo.Container{
		Workspace: workspaceRepo,
		Project:   projectRepo,
	}
}

func TestGenerateUserOperator_MultipleWorkspaces(t *testing.T) {
	ctx := context.Background()
	uId := accountdomain.NewUserID()

	wId1 := accountdomain.NewWorkspaceID()
	wId2 := accountdomain.NewWorkspaceID()
	pId1 := id.NewProjectID()
	pId2 := id.NewProjectID()

	// Create workspaces with different roles
	w1 := workspace.New().
		ID(wId1).
		Name("workspace-owner").
		Members(map[accountdomain.UserID]workspace.Member{
			uId: {Role: workspace.RoleOwner},
		}).
		MustBuild()

	w2 := workspace.New().
		ID(wId2).
		Name("workspace-reader").
		Members(map[accountdomain.UserID]workspace.Member{
			uId: {Role: workspace.RoleReader},
		}).
		MustBuild()

	// Create projects
	p1 := project.New().
		ID(pId1).
		Name("project1").
		Workspace(accountdomain.WorkspaceID(wId1)).
		Alias("proj1").
		MustBuild()

	p2 := project.New().
		ID(pId2).
		Name("project2").
		Workspace(accountdomain.WorkspaceID(wId2)).
		Alias("proj2").
		MustBuild()

	// Setup repos
	workspaceRepo := accountmemory.NewWorkspace()
	_ = workspaceRepo.Save(ctx, w1)
	_ = workspaceRepo.Save(ctx, w2)

	projectRepo := memory.NewProject()
	_ = projectRepo.Save(ctx, p1)
	_ = projectRepo.Save(ctx, p2)

	repos := &repo.Container{
		Workspace: workspaceRepo,
		Project:   projectRepo,
	}

	appCtx := &ApplicationContext{
		Repos: repos,
	}

	u := user.New().
		ID(uId).
		Name("test").
		Email("test@example.com").
		Workspace(wId1).
		MustBuild()

	op, err := generateUserOperator(ctx, appCtx, u, "en")
	assert.NoError(t, err)
	assert.NotNil(t, op)

	// User should be owner of workspace1 and reader of workspace2
	assert.Contains(t, op.AcOperator.OwningWorkspaces, wId1)
	assert.Contains(t, op.AcOperator.ReadableWorkspaces, wId2)

	// User should be owner of project1 and reader of project2
	assert.Contains(t, op.OwningProjects, pId1)
	assert.Contains(t, op.ReadableProjects, pId2)
}

func TestGenerateUserOperator_LanguagePriority(t *testing.T) {
	ctx := context.Background()
	wId := accountdomain.NewWorkspaceID()
	uId := accountdomain.NewUserID()
	pId := id.NewProjectID()

	tests := []struct {
		name         string
		userLang     language.Tag
		defaultLang  string
		expectedLang string
		description  string
	}{
		{
			name:         "user language overrides default",
			userLang:     language.Japanese,
			defaultLang:  "en",
			expectedLang: "ja",
			description:  "User's metadata language should take precedence",
		},
		{
			name:         "default used when user lang is root",
			userLang:     language.Und,
			defaultLang:  "fr",
			expectedLang: "fr",
			description:  "Default language used when user language is undefined/root",
		},
		{
			name:         "user language with region",
			userLang:     language.MustParse("en-GB"),
			defaultLang:  "en-US",
			expectedLang: "en-GB",
			description:  "User language with region should be preserved",
		},
		{
			name:         "default language with region",
			userLang:     language.Und,
			defaultLang:  "zh-CN",
			expectedLang: "zh-CN",
			description:  "Default language with region should be used when user lang is root",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			repos := setupTestRepos(t, wId, uId, pId, workspace.RoleOwner)
			appCtx := &ApplicationContext{
				Repos: repos,
			}

			metadata := user.NewMetadata()
			metadata.SetLang(tt.userLang)

			u := user.New().
				ID(uId).
				Name("test").
				Email("test@example.com").
				Workspace(wId).
				Metadata(metadata).
				MustBuild()

			op, err := generateUserOperator(ctx, appCtx, u, tt.defaultLang)
			assert.NoError(t, err)
			assert.NotNil(t, op)
			assert.Equal(t, tt.expectedLang, op.Lang, tt.description)
		})
	}
}
