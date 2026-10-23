package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGroup_CheckKey(t *testing.T) {
	t.Parallel()
	p1 := project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild()
	p2 := project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild()
	g1 := group.New().NewID().Key(id.NewKey("test123")).Project(p1.ID()).Schema(id.NewSchemaID()).MustBuild()

	tests := []struct {
		name    string
		filter  *repo.ProjectFilter
		pid     id.ProjectID
		key     string
		want    bool
		wantErr error
	}{
		{name: "must report a free key as available", pid: p1.ID(), key: "free-key", want: true},
		{name: "must report a used key as taken", pid: p1.ID(), key: "test123", want: false},
		{name: "must report a key used in another project as available", pid: p2.ID(), key: "test123", want: true},
		{name: "must reject a reserved key", pid: p1.ID(), key: "id", wantErr: id.ErrInvalidKey},
		{name: "must not find an unknown project", pid: id.NewProjectID(), key: "test123", wantErr: rerror.ErrNotFound},
		{
			name:    "must not find an unreadable project",
			filter:  &repo.ProjectFilter{Readable: id.ProjectIDList{p2.ID()}, Writable: id.ProjectIDList{p2.ID()}},
			pid:     p1.ID(),
			key:     "test123",
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()

			db := memory.New()
			require.NoError(t, db.Project.Save(ctx, p1.Clone()))
			require.NoError(t, db.Project.Save(ctx, p2.Clone()))
			require.NoError(t, db.Group.Save(ctx, g1.Clone()))
			if tc.filter != nil {
				db = db.Filtered(repo.WorkspaceFilter{}, *tc.filter)
			}

			got, err := NewGroup(db, nil).CheckKey(ctx, tc.pid, tc.key)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
