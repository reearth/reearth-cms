package test

import (
	"context"
	"net/url"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type projectFactory = func(t *testing.T) repo.Project

func TestProjectRepo(t *testing.T, newRepo projectFactory) {
	t.Run("ReadFilter", func(t *testing.T) { testProjectReadFilter(t, newRepo) })
	t.Run("Filtered", func(t *testing.T) { testProjectFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testProjectFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testProjectFindByIDs(t, newRepo) })
	t.Run("FindByIDOrAlias", func(t *testing.T) { testProjectFindByIDOrAlias(t, newRepo) })
	t.Run("IsAliasAvailable", func(t *testing.T) { testProjectIsAliasAvailable(t, newRepo) })
	t.Run("CountByWorkspace", func(t *testing.T) { testProjectCountByWorkspace(t, newRepo) })
	t.Run("FindByPublicAPIKey", func(t *testing.T) { testProjectFindByPublicAPIKey(t, newRepo) })
	t.Run("Search", func(t *testing.T) { testProjectSearch(t, newRepo) })
	t.Run("SearchPagination", func(t *testing.T) { testProjectSearchPagination(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testProjectSave(t, newRepo) })
	t.Run("Star", func(t *testing.T) { testProjectStar(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testProjectRemove(t, newRepo) })
}

func newProject(wid accountdomain.WorkspaceID) *project.Builder {
	return project.New().NewID().Workspace(wid).
		UpdatedAt(util.Now().Truncate(time.Millisecond).UTC()).Topics([]string{})
}

func accessibility(v project.Visibility, keys ...*project.APIKey) *project.Accessibility {
	return project.NewAccessibility(v, nil, nil, keys)
}

func newAPIKey() *project.APIKey {
	return project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key").Build()
}

func seedProjects(t *testing.T, r repo.Project, ps project.List) {
	t.Helper()
	for _, p := range ps {
		require.NoError(t, r.Save(context.Background(), p))
	}
}

func wsFilter(readable, writable accountdomain.WorkspaceIDList) repo.WorkspaceFilter {
	return repo.WorkspaceFilter{
		Readable: lo.Ternary(readable == nil, accountdomain.WorkspaceIDList{}, readable),
		Writable: lo.Ternary(writable == nil, accountdomain.WorkspaceIDList{}, writable),
	}
}

func pjFilter(readable, writable id.ProjectIDList) repo.ProjectFilter {
	return repo.ProjectFilter{
		Readable: lo.Ternary(readable == nil, id.ProjectIDList{}, readable),
		Writable: lo.Ternary(writable == nil, id.ProjectIDList{}, writable),
	}
}

func anonymousFilters(attachPublic bool) (*repo.WorkspaceFilter, *repo.ProjectFilter) {
	op := &usecase.Operator{AcOperator: &accountusecase.Operator{}, Anonymous: true}
	return new(repo.WorkspaceFilterFromOperator(op)), new(repo.ProjectFilterFromOperator(op, attachPublic))
}

func first(n int64) *usecasex.Pagination {
	return usecasex.CursorPagination{First: new(n)}.Wrap()
}

func testProjectReadFilter(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1Pub := newProject(w1).Alias("w1-public").Accessibility(accessibility(project.VisibilityPublic, newAPIKey())).MustBuild()
	w1p2Prv := newProject(w1).Alias("w1-private").Accessibility(accessibility(project.VisibilityPrivate, newAPIKey())).MustBuild()
	w2p1Pub := newProject(w2).Alias("w2-public").Accessibility(accessibility(project.VisibilityPublic, newAPIKey())).MustBuild()
	w2p2Prv := newProject(w2).Alias("w2-private").Accessibility(accessibility(project.VisibilityPrivate, newAPIKey())).MustBuild()
	seeds := project.List{w1p1Pub, w1p2Prv, w2p1Pub, w2p2Prv}
	anonWsFilter, anonPjFilter := anonymousFilters(true)
	anonNoPublicWsFilter, anonNoPublicPjFilter := anonymousFilters(false)

	tests := []struct {
		name     string
		wsFilter *repo.WorkspaceFilter
		pjFilter *repo.ProjectFilter
		want     project.List // readable projects
	}{
		{
			name: "must read every project without an access scope",
			want: seeds,
		},
		{
			name:     "must read projects of readable workspaces",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			want:     project.List{w1p1Pub, w1p2Prv},
		},
		{
			name:     "must read projects of writable workspaces",
			wsFilter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			want:     project.List{w1p1Pub, w1p2Prv},
		},
		{
			name:     "must read nothing with unrelated workspaces",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}, nil)),
		},
		{
			name:     "must read nothing, not even public projects, with empty scopes",
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(nil, nil)),
		},
		{
			name:     "must read readable projects outside readable workspaces",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			pjFilter: new(pjFilter(id.ProjectIDList{w2p2Prv.ID()}, nil)),
			want:     project.List{w1p1Pub, w1p2Prv, w2p2Prv},
		},
		{
			name:     "must read writable projects",
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(nil, id.ProjectIDList{w2p2Prv.ID()})),
			want:     project.List{w2p2Prv},
		},
		{
			name:     "must restrict reads by the project scope alone",
			pjFilter: new(pjFilter(id.ProjectIDList{w1p1Pub.ID()}, nil)),
			want:     project.List{w1p1Pub},
		},
		{
			name:     "must attach public projects of other workspaces",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			pjFilter: &repo.ProjectFilter{AttachPublic: true},
			want:     project.List{w1p1Pub, w1p2Prv, w2p1Pub},
		},
		{
			name:     "must read only public projects when attaching them alone",
			pjFilter: &repo.ProjectFilter{AttachPublic: true},
			want:     project.List{w1p1Pub, w2p1Pub},
		},
		{
			// an access scope is only defined when both lists are non-nil
			name:     "must not restrict reads with a partially defined workspace scope",
			wsFilter: &repo.WorkspaceFilter{Readable: accountdomain.WorkspaceIDList{w1}},
			want:     seeds,
		},
		{
			name:     "must read only public projects as an anonymous user",
			wsFilter: anonWsFilter,
			pjFilter: anonPjFilter,
			want:     project.List{w1p1Pub, w2p1Pub},
		},
		{
			// an anonymous operator has nil scopes, i.e. no access scope
			name:     "must read every project as an anonymous user without public projects attached",
			wsFilter: anonNoPublicWsFilter,
			pjFilter: anonNoPublicPjFilter,
			want:     seeds,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, seeds)
			if tc.wsFilter != nil || tc.pjFilter != nil {
				r = r.Filtered(lo.FromPtr(tc.wsFilter), lo.FromPtr(tc.pjFilter))
			}
			readable := tc.want.IDs()

			for _, p := range seeds {
				want := lo.Ternary(readable.Has(p.ID()), p, nil)

				got, err := r.FindByID(ctx, p.ID())
				assertProjectFound(t, want, got, err, "FindByID %s", p.Alias())

				got, err = r.FindByIDOrAlias(ctx, p.Workspace(), project.IDOrAlias(p.ID().String()))
				assertProjectFound(t, want, got, err, "FindByIDOrAlias(id) %s", p.Alias())

				got, err = r.FindByIDOrAlias(ctx, p.Workspace(), project.IDOrAlias(p.Alias()))
				assertProjectFound(t, want, got, err, "FindByIDOrAlias(alias) %s", p.Alias())

				got, err = r.FindByPublicAPIKey(ctx, p.Accessibility().ApiKeys()[0].Key())
				assertProjectFound(t, want, got, err, "FindByPublicAPIKey %s", p.Alias())
			}

			got, err := r.FindByIDs(ctx, seeds.IDs())
			assert.NoError(t, err)
			assert.Equal(t, readable, got.IDs(), "FindByIDs")

			res, _, err := r.Search(ctx, interfaces.ProjectFilter{Pagination: first(10)})
			assert.NoError(t, err)
			assert.ElementsMatch(t, readable, res.IDs(), "Search")

			for _, w := range []accountdomain.WorkspaceID{w1, w2} {
				count, err := r.CountByWorkspace(ctx, w)
				assert.NoError(t, err)
				want := lo.CountBy(tc.want, func(p *project.Project) bool { return p.Workspace() == w })
				assert.Equal(t, want, count, "CountByWorkspace")
			}
		})
	}
}

func assertProjectFound(t *testing.T, want, got *project.Project, err error, msgAndArgs ...any) {
	t.Helper()
	if want == nil {
		assert.Nil(t, got, msgAndArgs...)
		assert.Equal(t, rerror.ErrNotFound, err, msgAndArgs...)
		return
	}
	if assert.NoError(t, err, msgAndArgs...) && assert.NotNil(t, got, msgAndArgs...) {
		assert.Equal(t, want.ID(), got.ID(), msgAndArgs...)
	}
}

func testProjectFiltered(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2, w3 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1Prv := newProject(w1).Accessibility(accessibility(project.VisibilityPrivate)).MustBuild()
	w2p1Prv := newProject(w2).Accessibility(accessibility(project.VisibilityPrivate)).MustBuild()
	w3p1Pub := newProject(w3).Accessibility(accessibility(project.VisibilityPublic)).MustBuild()
	seeds := project.List{w1p1Prv, w2p1Prv, w3p1Pub}

	tests := []struct {
		name      string
		filter    func(r repo.Project) repo.Project
		wantRead  project.List
		wantWrite []accountdomain.WorkspaceID // workspaces Save must accept
		wantDeny  []accountdomain.WorkspaceID // workspaces Save must reject
	}{
		{
			name: "must merge readable workspaces of chained filters",
			filter: func(r repo.Project) repo.Project {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, nil), repo.ProjectFilter{}).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, nil), repo.ProjectFilter{})
			},
			wantRead: project.List{w1p1Prv, w2p1Prv},
			wantDeny: []accountdomain.WorkspaceID{w1, w2, w3},
		},
		{
			name: "must merge writable workspaces of chained filters",
			filter: func(r repo.Project) repo.Project {
				return r.Filtered(wsFilter(nil, accountdomain.WorkspaceIDList{w1}), repo.ProjectFilter{}).
					Filtered(wsFilter(nil, accountdomain.WorkspaceIDList{w2}), repo.ProjectFilter{})
			},
			wantRead:  project.List{w1p1Prv, w2p1Prv},
			wantWrite: []accountdomain.WorkspaceID{w1, w2},
			wantDeny:  []accountdomain.WorkspaceID{w3},
		},
		{
			name: "must keep attached public projects of a previous filter",
			filter: func(r repo.Project) repo.Project {
				return r.Filtered(repo.WorkspaceFilter{}, repo.ProjectFilter{AttachPublic: true}).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, nil), repo.ProjectFilter{})
			},
			wantRead: project.List{w1p1Prv, w3p1Pub},
		},
		{
			name: "must merge readable projects of chained filters",
			filter: func(r repo.Project) repo.Project {
				return r.Filtered(wsFilter(nil, nil), pjFilter(id.ProjectIDList{w1p1Prv.ID()}, nil)).
					Filtered(repo.WorkspaceFilter{}, pjFilter(id.ProjectIDList{w3p1Pub.ID()}, nil))
			},
			wantRead: project.List{w1p1Prv, w3p1Pub},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			seedProjects(t, base, seeds)
			r := tc.filter(base)

			got, _, err := r.Search(ctx, interfaces.ProjectFilter{Pagination: first(10)})
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.wantRead.IDs(), got.IDs())

			for _, w := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newProject(w).MustBuild()))
			}
			for _, w := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newProject(w).MustBuild()))
			}

			// filtering must not change the base repository
			all, _, err := base.Search(ctx, interfaces.ProjectFilter{Pagination: first(10)})
			assert.NoError(t, err)
			assert.Len(t, all, len(seeds)+len(tc.wantWrite))
		})
	}
}

func testProjectFindByID(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	posting := lo.Must(project.NewPostingSettings(false, []string{"https://example.com"}))
	key := project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key").Description("desc").
		Publication(project.NewPublicationSettings(id.ModelIDList{id.NewModelID()}, true)).Build()
	w1p1 := newProject(w1).
		Name("name").
		Description("description").
		License("license").
		Readme("readme").
		Alias("full-project").
		ImageURL(lo.Must(url.Parse("https://example.com/image.png"))).
		Topics([]string{"topic1", "topic2"}).
		StarCount(1).
		StarredBy([]string{accountdomain.NewUserID().String()}).
		RequestRoles([]workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}).
		Accessibility(project.NewAccessibility(project.VisibilityPrivate,
			project.NewPublicationSettings(id.ModelIDList{id.NewModelID()}, true), posting, project.APIKeys{key})).
		MustBuild()
	w1p2 := newProject(w1).MustBuild()
	w2p1 := newProject(w2).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		args    id.ProjectID
		want    *project.Project
		wantErr error
	}{
		{
			name:  "must find a project with all its fields",
			seeds: project.List{w1p1, w1p2, w2p1},
			args:  w1p1.ID(),
			want:  w1p1,
		},
		{
			name:  "must find a project with default fields",
			seeds: project.List{w1p1, w1p2, w2p1},
			args:  w1p2.ID(),
			want:  w1p2,
		},
		{
			name:    "must not find an unknown project",
			seeds:   project.List{w1p1, w1p2, w2p1},
			args:    id.NewProjectID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any project in an empty repository",
			args:    w1p1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)

			got, err := r.FindByID(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectFindByIDs(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).MustBuild()
	w1p2 := newProject(w1).MustBuild()
	w2p1 := newProject(w2).MustBuild()
	seeds := project.List{w1p1, w1p2, w2p1}

	tests := []struct {
		name  string
		seeds project.List
		args  id.ProjectIDList
		want  project.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.ProjectIDList{},
			want:  project.List{},
		},
		{
			name:  "must find projects across workspaces",
			seeds: seeds,
			args:  id.ProjectIDList{w1p1.ID(), w1p2.ID(), w2p1.ID()},
			want:  project.List{w1p1, w1p2, w2p1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.ProjectIDList{w2p1.ID(), w1p1.ID(), w1p2.ID()},
			want:  project.List{w2p1, w1p1, w1p2},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.ProjectIDList{id.NewProjectID(), w1p2.ID()},
			want:  project.List{w1p2},
		},
		{
			name:  "must find an empty list for unknown IDs",
			seeds: seeds,
			args:  id.ProjectIDList{id.NewProjectID()},
			want:  project.List{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)

			got, err := r.FindByIDs(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectFindByIDOrAlias(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).Alias("alias-one").MustBuild()
	w2p1 := newProject(w2).Alias("alias-one").MustBuild()
	w1p2 := newProject(w1).Alias("alias-two").MustBuild()
	w1p3 := newProject(w1).MustBuild()
	seeds := project.List{w1p1, w2p1, w1p2, w1p3}

	type args struct {
		workspace accountdomain.WorkspaceID
		idOrAlias project.IDOrAlias
	}

	tests := []struct {
		name    string
		seeds   project.List
		args    args
		want    *project.Project
		wantErr error
	}{
		{
			name:  "must find a project by ID",
			seeds: seeds,
			args:  args{w1, project.IDOrAlias(w1p2.ID().String())},
			want:  w1p2,
		},
		{
			name:  "must find a project without an alias by ID",
			seeds: seeds,
			args:  args{w1, project.IDOrAlias(w1p3.ID().String())},
			want:  w1p3,
		},
		{
			name:  "must find a project by alias",
			seeds: seeds,
			args:  args{w1, project.IDOrAlias(w1p1.Alias())},
			want:  w1p1,
		},
		{
			name:  "must find the project of the given workspace by a shared alias",
			seeds: seeds,
			args:  args{w2, project.IDOrAlias(w2p1.Alias())},
			want:  w2p1,
		},
		{
			name:  "must find a project by alias case-insensitively",
			seeds: seeds,
			args:  args{w1, project.IDOrAlias(strings.ToUpper(w1p2.Alias()))},
			want:  w1p2,
		},
		{
			name:    "must not find a project of another workspace by ID",
			seeds:   seeds,
			args:    args{w2, project.IDOrAlias(w1p1.ID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a project of another workspace by alias",
			seeds:   seeds,
			args:    args{w2, project.IDOrAlias(w1p2.Alias())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown ID",
			seeds:   seeds,
			args:    args{w1, project.IDOrAlias(id.NewProjectID().String())},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown alias",
			seeds:   seeds,
			args:    args{w1, "alias-unknown"},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty ID or alias",
			seeds:   seeds,
			args:    args{w1, ""},
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)

			got, err := r.FindByIDOrAlias(ctx, tc.args.workspace, tc.args.idOrAlias)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectIsAliasAvailable(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).Alias("alias-one").MustBuild()
	w2p1 := newProject(w2).Alias("alias-two").MustBuild()
	seeds := project.List{w1p1, w2p1}

	type args struct {
		workspace accountdomain.WorkspaceID
		alias     string
	}

	tests := []struct {
		name     string
		seeds    project.List
		wsFilter *repo.WorkspaceFilter
		args     args
		want     bool
	}{
		{
			name: "must be available in an empty repository",
			args: args{w1, "alias-one"},
			want: true,
		},
		{
			name:  "must be available when unused in the workspace",
			seeds: seeds,
			args:  args{w1, "alias-new"},
			want:  true,
		},
		{
			name:  "must be available when used only in another workspace",
			seeds: seeds,
			args:  args{w1, "alias-two"},
			want:  true,
		},
		{
			name:  "must not be available when used in the workspace",
			seeds: seeds,
			args:  args{w1, "alias-one"},
			want:  false,
		},
		{
			name:  "must not be available when used in the workspace with another case",
			seeds: seeds,
			args:  args{w1, "ALIAS-One"},
			want:  false,
		},
		{
			name:  "must not be available when empty",
			seeds: seeds,
			args:  args{w1, ""},
			want:  false,
		},
		{
			name:     "must ignore the read filter",
			seeds:    seeds,
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}, nil)),
			args:     args{w1, "alias-one"},
			want:     false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)
			if tc.wsFilter != nil {
				r = r.Filtered(*tc.wsFilter, repo.ProjectFilter{})
			}

			got, err := r.IsAliasAvailable(ctx, tc.args.workspace, tc.args.alias)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectCountByWorkspace(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).MustBuild()
	w1p2 := newProject(w1).MustBuild()
	w2p1 := newProject(w2).MustBuild()
	seeds := project.List{w1p1, w1p2, w2p1}

	tests := []struct {
		name     string
		seeds    project.List
		wsFilter *repo.WorkspaceFilter
		pjFilter *repo.ProjectFilter
		args     accountdomain.WorkspaceID
		want     int
	}{
		{
			name: "must count nothing in an empty repository",
			args: w1,
			want: 0,
		},
		{
			name:  "must count only projects of the workspace",
			seeds: seeds,
			args:  w1,
			want:  2,
		},
		{
			name:  "must count nothing for an unknown workspace",
			seeds: seeds,
			args:  accountdomain.NewWorkspaceID(),
			want:  0,
		},
		{
			name:     "must count only readable projects of the workspace",
			seeds:    seeds,
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(id.ProjectIDList{w1p2.ID()}, nil)),
			args:     w1,
			want:     1,
		},
		{
			name:     "must count nothing in an unreadable workspace",
			seeds:    seeds,
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w2}, nil)),
			args:     w1,
			want:     0,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)
			if tc.wsFilter != nil || tc.pjFilter != nil {
				r = r.Filtered(lo.FromPtr(tc.wsFilter), lo.FromPtr(tc.pjFilter))
			}

			got, err := r.CountByWorkspace(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectFindByPublicAPIKey(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	k1, k2 := newAPIKey(), newAPIKey()
	w1 := accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).Accessibility(accessibility(project.VisibilityPrivate, k1, k2)).MustBuild()
	w1p2 := newProject(w1).MustBuild()
	seeds := project.List{w1p1, w1p2}

	tests := []struct {
		name    string
		seeds   project.List
		args    string
		want    *project.Project
		wantErr error
	}{
		{
			name:  "must find a project by its first key",
			seeds: seeds,
			args:  k1.Key(),
			want:  w1p1,
		},
		{
			name:  "must find a project by its second key",
			seeds: seeds,
			args:  k2.Key(),
			want:  w1p1,
		},
		{
			name:    "must not find an unknown key",
			seeds:   seeds,
			args:    "unknown",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find anything for an empty key",
			seeds:   seeds,
			args:    "",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any project in an empty repository",
			args:    k1.Key(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)

			got, err := r.FindByPublicAPIKey(ctx, tc.args)
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testProjectSearch(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).Name("Test Project Alpha").Description("A test project for searching").
		Alias("alpha-test").Topics([]string{"topic1", "abc"}).
		Accessibility(accessibility(project.VisibilityPublic)).MustBuild()
	w1p2 := newProject(w1).Name("Beta Project").Description("Another project").
		Alias("beta-proj").Topics([]string{"topic2", "xyz"}).
		Accessibility(accessibility(project.VisibilityPrivate)).MustBuild()
	w2p1 := newProject(w2).Name("Gamma Search Test").Description("Third project").
		Alias("gamma-123").Topics([]string{"abc"}).
		Accessibility(accessibility(project.VisibilityPublic)).MustBuild()
	w1p3 := newProject(w1).Name("Delta").Description("Contains keyword alpha in description").
		Alias("delta-one").Topics([]string{"topic1", "topic2", "xyz"}).
		Accessibility(accessibility(project.VisibilityPublic)).MustBuild()
	w2p2 := newProject(w2).Name("Epsilon (v1.0)").Description("Fifth project").
		Alias("epsilon-x").Topics([]string{"Machine Learning"}).
		Accessibility(accessibility(project.VisibilityPrivate)).MustBuild()
	seeds := project.List{w1p1, w1p2, w2p1, w1p3, w2p2}

	tests := []struct {
		name  string
		seeds project.List
		args  interfaces.ProjectFilter // paginated with the first 10 results
		want  project.List
	}{
		{
			name: "must find nothing in an empty repository",
		},
		{
			name:  "must find all projects without conditions",
			seeds: seeds,
			want:  seeds,
		},
		{
			name:  "must find all projects with an empty workspace list",
			seeds: seeds,
			args:  interfaces.ProjectFilter{WorkspaceIds: &accountdomain.WorkspaceIDList{}},
			want:  seeds,
		},
		{
			name:  "must find projects of a workspace",
			seeds: seeds,
			args:  interfaces.ProjectFilter{WorkspaceIds: &accountdomain.WorkspaceIDList{w1}},
			want:  project.List{w1p1, w1p2, w1p3},
		},
		{
			name:  "must find projects of multiple workspaces",
			seeds: seeds,
			args:  interfaces.ProjectFilter{WorkspaceIds: &accountdomain.WorkspaceIDList{w1, w2}},
			want:  seeds,
		},
		{
			name:  "must find nothing for an unknown workspace",
			seeds: seeds,
			args:  interfaces.ProjectFilter{WorkspaceIds: &accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}},
		},
		{
			name:  "must find public projects",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Visibility: lo.ToPtr(project.VisibilityPublic)},
			want:  project.List{w1p1, w2p1, w1p3},
		},
		{
			name:  "must find private projects",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Visibility: lo.ToPtr(project.VisibilityPrivate)},
			want:  project.List{w1p2, w2p2},
		},
		{
			name:  "must find all projects with an empty keyword",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("")},
			want:  seeds,
		},
		{
			name:  "must find projects by keyword in the name or description",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("Alpha")},
			want:  project.List{w1p1, w1p3},
		},
		{
			name:  "must find projects by keyword in the alias",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("-one")},
			want:  project.List{w1p3},
		},
		{
			name:  "must find projects by keyword in the description",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("searching")},
			want:  project.List{w1p1},
		},
		{
			name:  "must find projects by keyword in a topic",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("learn")},
			want:  project.List{w2p2},
		},
		{
			name:  "must find projects by keyword case-insensitively",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("GAMMA")},
			want:  project.List{w2p1},
		},
		{
			name:  "must find a project by its exact ID",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new(w1p2.ID().String())},
			want:  project.List{w1p2},
		},
		{
			name:  "must match regular expression characters in the keyword literally",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("(v1.0)")},
			want:  project.List{w2p2},
		},
		{
			name:  "must not treat the keyword as a regular expression",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("p.oject")},
		},
		{
			name:  "must find nothing for an unknown keyword",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Keyword: new("nonexistent")},
		},
		{
			name:  "must find projects by a topic",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"topic1"}},
			want:  project.List{w1p1, w1p3},
		},
		{
			name:  "must find projects by a topic case-insensitively",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"Topic1"}},
			want:  project.List{w1p1, w1p3},
		},
		{
			name:  "must match topics exactly",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"topic"}},
		},
		{
			name:  "must match topics with spaces",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"machine learning"}},
			want:  project.List{w2p2},
		},
		{
			name:  "must find projects having all the topics",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"topic1", "topic2", "xyz"}},
			want:  project.List{w1p3},
		},
		{
			name:  "must find nothing when no project has all the topics",
			seeds: seeds,
			args:  interfaces.ProjectFilter{Topics: []string{"topic1", "nonexistent"}},
		},
		{
			name:  "must combine workspace and visibility conditions",
			seeds: seeds,
			args: interfaces.ProjectFilter{
				WorkspaceIds: &accountdomain.WorkspaceIDList{w1},
				Visibility:   lo.ToPtr(project.VisibilityPublic),
			},
			want: project.List{w1p1, w1p3},
		},
		{
			name:  "must combine workspace and keyword conditions",
			seeds: seeds,
			args: interfaces.ProjectFilter{
				WorkspaceIds: &accountdomain.WorkspaceIDList{w1},
				Keyword:      new("project"),
			},
			want: project.List{w1p1, w1p2},
		},
		{
			name:  "must combine workspace and topic conditions",
			seeds: seeds,
			args: interfaces.ProjectFilter{
				WorkspaceIds: &accountdomain.WorkspaceIDList{w1},
				Topics:       []string{"abc"},
			},
			want: project.List{w1p1},
		},
		{
			name:  "must combine all conditions",
			seeds: seeds,
			args: interfaces.ProjectFilter{
				WorkspaceIds: &accountdomain.WorkspaceIDList{w1},
				Visibility:   lo.ToPtr(project.VisibilityPublic),
				Keyword:      new("alpha"),
				Topics:       []string{"xyz"},
			},
			want: project.List{w1p3},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, tc.seeds)

			f := tc.args
			f.Pagination = first(10)
			got, _, err := r.Search(ctx, f)
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want.IDs(), got.IDs())
		})
	}
}

func testProjectSearchPagination(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	now := time.Now().Truncate(time.Millisecond).UTC()

	// IDs ascend from w1p1 to w1p4 while update times descend, so sorting by the
	// ID and by the update time give opposite orders
	ids := id.ProjectIDList{id.NewProjectID(), id.NewProjectID(), id.NewProjectID(), id.NewProjectID()}
	slices.SortFunc(ids, func(a, b id.ProjectID) int { return a.Compare(b) })
	ps := make(project.List, len(ids))
	for i, pid := range ids {
		ps[i] = project.New().ID(pid).Workspace(w1).Topics([]string{}).
			UpdatedAt(now.Add(time.Duration(len(ids)-i) * time.Hour)).MustBuild()
	}
	w1p1, w1p2, w1p3, w1p4 := ps[0], ps[1], ps[2], ps[3]
	// a project of another workspace is excluded from the results and the count
	w2p1 := newProject(w2).MustBuild()
	seeds := append(project.List{w2p1}, ps...)

	cursor := func(p *project.Project) *usecasex.Cursor { return new(usecasex.Cursor(p.ID().String())) }
	updatedAt := func(reverted bool) *usecasex.Sort { return &usecasex.Sort{Key: "updatedat", Reverted: reverted} }

	tests := []struct {
		name        string
		sort        *usecasex.Sort
		pagination  *usecasex.Pagination
		want        project.List // in order
		wantHasNext bool
		wantHasPrev bool
		wantErr     bool
		wantCursors bool // assert the start and end cursors
	}{
		{
			name:        "must find the first page in ID order",
			pagination:  first(2),
			want:        project.List{w1p1, w1p2},
			wantHasNext: true,
			wantCursors: true,
		},
		{
			name:        "must find all projects when the page is larger",
			pagination:  first(10),
			want:        project.List{w1p1, w1p2, w1p3, w1p4},
			wantCursors: true,
		},
		{
			name:       "must find all projects with the default page size",
			pagination: usecasex.CursorPagination{}.Wrap(),
			want:       project.List{w1p1, w1p2, w1p3, w1p4},
		},
		{
			name:        "must find the last page in ID order",
			pagination:  usecasex.CursorPagination{Last: new(int64(2))}.Wrap(),
			want:        project.List{w1p3, w1p4},
			wantHasPrev: true,
		},
		{
			name:       "must find projects after a cursor",
			pagination: usecasex.CursorPagination{After: cursor(w1p2), First: new(int64(10))}.Wrap(),
			want:       project.List{w1p3, w1p4},
		},
		{
			name:        "must find a page after a cursor",
			pagination:  usecasex.CursorPagination{After: cursor(w1p1), First: new(int64(2))}.Wrap(),
			want:        project.List{w1p2, w1p3},
			wantHasNext: true,
		},
		{
			name:       "must find projects after a cursor with the default page size",
			pagination: usecasex.CursorPagination{After: cursor(w1p1)}.Wrap(),
			want:       project.List{w1p2, w1p3, w1p4},
		},
		{
			name:       "must find projects before a cursor",
			pagination: usecasex.CursorPagination{Before: cursor(w1p3), Last: new(int64(10))}.Wrap(),
			want:       project.List{w1p1, w1p2},
		},
		{
			name:        "must find the last page before a cursor",
			pagination:  usecasex.CursorPagination{Before: cursor(w1p4), Last: new(int64(2))}.Wrap(),
			want:        project.List{w1p2, w1p3},
			wantHasPrev: true,
		},
		{
			name:        "must find a page by offset",
			pagination:  usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap(),
			want:        project.List{w1p2, w1p3},
			wantHasNext: true,
		},
		{
			name:       "must find the rest by offset",
			pagination: usecasex.OffsetPagination{Offset: 3, Limit: 2}.Wrap(),
			want:       project.List{w1p4},
		},
		{
			name:       "must find nothing beyond the last offset",
			pagination: usecasex.OffsetPagination{Offset: 10, Limit: 2}.Wrap(),
		},
		{
			name:        "must sort by ID in reverse",
			sort:        &usecasex.Sort{Key: "id", Reverted: true},
			pagination:  first(2),
			want:        project.List{w1p4, w1p3},
			wantHasNext: true,
		},
		{
			name:       "must sort by update time",
			sort:       updatedAt(false),
			pagination: first(10),
			want:       project.List{w1p4, w1p3, w1p2, w1p1},
		},
		{
			name:       "must sort by update time in reverse",
			sort:       updatedAt(true),
			pagination: first(10),
			want:       project.List{w1p1, w1p2, w1p3, w1p4},
		},
		{
			name:       "must find projects after a cursor sorted by update time",
			sort:       updatedAt(false),
			pagination: usecasex.CursorPagination{After: cursor(w1p3), First: new(int64(10))}.Wrap(),
			want:       project.List{w1p2, w1p1},
		},
		{
			name:       "must find projects before a cursor sorted by update time in reverse",
			sort:       updatedAt(true),
			pagination: usecasex.CursorPagination{Before: cursor(w1p3), Last: new(int64(10))}.Wrap(),
			want:       project.List{w1p1, w1p2},
		},
		{
			name:        "must find the last page sorted by update time",
			sort:        updatedAt(false),
			pagination:  usecasex.CursorPagination{Last: new(int64(1))}.Wrap(),
			want:        project.List{w1p1},
			wantHasPrev: true,
		},
		{
			name:        "must find a page by offset sorted by update time",
			sort:        updatedAt(false),
			pagination:  usecasex.OffsetPagination{Offset: 1, Limit: 1}.Wrap(),
			want:        project.List{w1p3},
			wantHasNext: true,
		},
		{
			// the sort direction only applies with a sort key
			name:       "must ignore the direction without a sort key",
			sort:       &usecasex.Sort{Reverted: true},
			pagination: first(10),
			want:       project.List{w1p1, w1p2, w1p3, w1p4},
		},
		{
			name:       "must fail with an unknown cursor",
			pagination: usecasex.CursorPagination{After: new(usecasex.Cursor(id.NewProjectID().String())), First: new(int64(10))}.Wrap(),
			wantErr:    true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedProjects(t, r, seeds)

			got, pi, err := r.Search(ctx, interfaces.ProjectFilter{
				WorkspaceIds: &accountdomain.WorkspaceIDList{w1},
				Sort:         tc.sort,
				Pagination:   tc.pagination,
			})
			if tc.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				assert.Nil(t, pi)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want.IDs(), got.IDs())
			require.NotNil(t, pi)
			assert.Equal(t, int64(len(ps)), pi.TotalCount)
			assert.Equal(t, tc.wantHasNext, pi.HasNextPage, "HasNextPage")
			assert.Equal(t, tc.wantHasPrev, pi.HasPreviousPage, "HasPreviousPage")
			if tc.wantCursors {
				assert.Equal(t, cursor(tc.want[0]), pi.StartCursor)
				assert.Equal(t, cursor(tc.want[len(tc.want)-1]), pi.EndCursor)
			}
		})
	}
}

func testProjectSave(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1 := accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).Name("before").MustBuild()
	w1p1Updated := project.New().ID(w1p1.ID()).Workspace(w1).UpdatedAt(w1p1.UpdatedAt().Add(time.Hour)).
		Topics([]string{"updated"}).Name("after").MustBuild()

	tests := []struct {
		name     string
		seeds    project.List
		wsFilter *repo.WorkspaceFilter
		pjFilter *repo.ProjectFilter
		args     *project.Project
		want     *project.Project
		wantErr  error
	}{
		{
			name: "must save a new project",
			args: w1p1,
			want: w1p1,
		},
		{
			name:  "must overwrite an existing project",
			seeds: project.List{w1p1},
			args:  w1p1Updated,
			want:  w1p1Updated,
		},
		{
			name:     "must save a project in a readable and writable workspace",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w1})),
			args:     w1p1,
			want:     w1p1,
		},
		{
			name:     "must save a project in a writable-only workspace",
			wsFilter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:     w1p1,
			want:     w1p1,
		},
		{
			name:     "must not restrict saving by the project scope",
			pjFilter: new(pjFilter(nil, nil)),
			args:     w1p1,
			want:     w1p1,
		},
		{
			name:     "must not save a project outside writable workspaces",
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:     w1p1,
			wantErr:  repo.ErrOperationDenied,
		},
		{
			name:     "must not overwrite a project outside writable workspaces",
			seeds:    project.List{w1p1},
			wsFilter: new(wsFilter(nil, accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()})),
			args:     w1p1Updated,
			want:     w1p1, // unchanged
			wantErr:  repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			seedProjects(t, base, tc.seeds)
			r := base
			if tc.wsFilter != nil || tc.pjFilter != nil {
				r = base.Filtered(lo.FromPtr(tc.wsFilter), lo.FromPtr(tc.pjFilter))
			}

			err := r.Save(ctx, tc.args)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				assert.NoError(t, err)
			}

			// the stored state is checked unfiltered
			got, err := base.FindByID(ctx, tc.args.ID())
			if tc.want == nil {
				assert.Nil(t, got)
				assert.Equal(t, rerror.ErrNotFound, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)

			count, err := base.CountByWorkspace(ctx, w1)
			assert.NoError(t, err)
			assert.Equal(t, 1, count)
		})
	}
}

func testProjectStar(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	w1 := accountdomain.NewWorkspaceID()
	w1p1Pub := newProject(w1).Accessibility(accessibility(project.VisibilityPublic)).MustBuild()
	w1p2Prv := newProject(w1).Accessibility(accessibility(project.VisibilityPrivate)).MustBuild()
	seeds := project.List{w1p1Pub, w1p2Prv}
	anonWsFilter, anonPjFilter := anonymousFilters(true)

	tests := []struct {
		name     string
		seeds    project.List
		wsFilter *repo.WorkspaceFilter
		pjFilter *repo.ProjectFilter
		args     id.ProjectID
		users    []accountdomain.UserID // users starring in turn
		want     []string               // users starring the project afterwards
		wantErr  error
	}{
		{
			name:  "must star a project",
			seeds: seeds,
			args:  w1p1Pub.ID(),
			users: []accountdomain.UserID{u1},
			want:  []string{u1.String()},
		},
		{
			name:  "must unstar a project starred by the same user",
			seeds: seeds,
			args:  w1p1Pub.ID(),
			users: []accountdomain.UserID{u1, u1},
			want:  []string{},
		},
		{
			name:  "must star a project by multiple users",
			seeds: seeds,
			args:  w1p1Pub.ID(),
			users: []accountdomain.UserID{u1, u2},
			want:  []string{u1.String(), u2.String()},
		},
		{
			name:  "must unstar only the given user",
			seeds: seeds,
			args:  w1p1Pub.ID(),
			users: []accountdomain.UserID{u1, u2, u1},
			want:  []string{u2.String()},
		},
		{
			name:    "must not star an unknown project",
			seeds:   seeds,
			args:    id.NewProjectID(),
			users:   []accountdomain.UserID{u1},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:     "must star a private project in a readable workspace",
			seeds:    seeds,
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:     w1p2Prv.ID(),
			users:    []accountdomain.UserID{u1},
			want:     []string{u1.String()},
		},
		{
			name:     "must star a readable private project",
			seeds:    seeds,
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(id.ProjectIDList{w1p2Prv.ID()}, nil)),
			args:     w1p2Prv.ID(),
			users:    []accountdomain.UserID{u1},
			want:     []string{u1.String()},
		},
		{
			name:     "must star an unreadable public project",
			seeds:    seeds,
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(nil, nil)),
			args:     w1p1Pub.ID(),
			users:    []accountdomain.UserID{u1},
			want:     []string{u1.String()},
		},
		{
			name:     "must not star an unreadable private project",
			seeds:    seeds,
			wsFilter: new(wsFilter(nil, nil)),
			pjFilter: new(pjFilter(nil, nil)),
			args:     w1p2Prv.ID(),
			users:    []accountdomain.UserID{u1},
			wantErr:  repo.ErrOperationDenied,
		},
		{
			name:     "must star a public project as an anonymous user",
			seeds:    seeds,
			wsFilter: anonWsFilter,
			pjFilter: anonPjFilter,
			args:     w1p1Pub.ID(),
			users:    []accountdomain.UserID{u1},
			want:     []string{u1.String()},
		},
		{
			// Star only checks the workspace and project lists, which are
			// unset (nil) for an anonymous operator, so they do not restrict it
			name:     "must star a private project as an anonymous user",
			seeds:    seeds,
			wsFilter: anonWsFilter,
			pjFilter: anonPjFilter,
			args:     w1p2Prv.ID(),
			users:    []accountdomain.UserID{u1},
			want:     []string{u1.String()},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			seedProjects(t, base, tc.seeds.Clone())
			r := base
			if tc.wsFilter != nil || tc.pjFilter != nil {
				r = base.Filtered(lo.FromPtr(tc.wsFilter), lo.FromPtr(tc.pjFilter))
			}

			var got *project.Project
			var err error
			for _, u := range tc.users {
				if got, err = r.Star(ctx, tc.args, u); err != nil {
					break
				}
			}
			if tc.wantErr != nil {
				assert.Nil(t, got)
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tc.args, got.ID())
				assert.ElementsMatch(t, tc.want, got.StarredBy())
				assert.Equal(t, int64(len(tc.want)), got.StarCount())
			}

			// the star state must be persisted on the starred project only
			for _, s := range tc.seeds {
				want := lo.Ternary(s.ID() == tc.args, tc.want, nil)
				stored, err := base.FindByID(ctx, s.ID())
				require.NoError(t, err)
				assert.ElementsMatch(t, want, stored.StarredBy())
				assert.Equal(t, int64(len(want)), stored.StarCount())
			}
		})
	}
}

func testProjectRemove(t *testing.T, newRepo projectFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1p1 := newProject(w1).MustBuild()
	w1p2 := newProject(w1).MustBuild()
	w2p1 := newProject(w2).MustBuild()
	seeds := project.List{w1p1, w1p2, w2p1}

	tests := []struct {
		name     string
		seeds    project.List
		wsFilter *repo.WorkspaceFilter
		pjFilter *repo.ProjectFilter
		args     id.ProjectID
		want     id.ProjectIDList // projects that must remain after the call
		wantErr  error
	}{
		{
			name:  "must remove a project",
			seeds: seeds,
			args:  w1p1.ID(),
			want:  id.ProjectIDList{w1p2.ID(), w2p1.ID()},
		},
		{
			name:    "must not remove an unknown project",
			seeds:   seeds,
			args:    id.NewProjectID(),
			want:    id.ProjectIDList{w1p1.ID(), w1p2.ID(), w2p1.ID()},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    w1p1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:     "must remove a project in a writable workspace",
			seeds:    seeds,
			wsFilter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w2})),
			args:     w2p1.ID(),
			want:     id.ProjectIDList{w1p1.ID(), w1p2.ID()},
		},
		{
			name:     "must not remove a project outside writable workspaces",
			seeds:    seeds,
			wsFilter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w2})),
			args:     w1p1.ID(),
			want:     id.ProjectIDList{w1p1.ID(), w1p2.ID(), w2p1.ID()},
			wantErr:  rerror.ErrNotFound,
		},
		{
			name:     "must not restrict removal by the project scope",
			seeds:    seeds,
			pjFilter: new(pjFilter(nil, nil)),
			args:     w1p2.ID(),
			want:     id.ProjectIDList{w1p1.ID(), w2p1.ID()},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			seedProjects(t, base, tc.seeds)
			r := base
			if tc.wsFilter != nil || tc.pjFilter != nil {
				r = base.Filtered(lo.FromPtr(tc.wsFilter), lo.FromPtr(tc.pjFilter))
			}

			err := r.Remove(ctx, tc.args)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				assert.NoError(t, err)
			}

			// remaining projects are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			got, err := base.FindByIDs(ctx, tc.seeds.IDs())
			assert.NoError(t, err)
			assert.ElementsMatch(t, tc.want, got.IDs())
		})
	}
}
