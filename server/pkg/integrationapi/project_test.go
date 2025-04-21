package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_NewProject(t *testing.T) {
	timeNow := time.Now()
	p1 := project.New().ID(project.NewID()).Workspace(project.NewWorkspaceID()).
		Name("test").Description("testing").Alias("testalias").UpdatedAt(timeNow).MustBuild()
	tests := []struct {
		name string
		p    *project.Project
		want Project
	}{
		{
			name: "success",
			p:    p1,
			want: Project{
				Id:           p1.ID(),
				WorkspaceId:  p1.Workspace(),
				Alias:        p1.Alias(),
				Name:         p1.Name(),
				Description:  p1.Description(),
				CreatedAt:    p1.CreatedAt(),
				UpdatedAt:    p1.UpdatedAt(),
				Publication:  &ProjectPublication{Scope: lo.ToPtr(PRIVATE)},
				RequestRoles: nil,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NewProject(tt.p)
			assert.Equal(t, tt.want, result)
		})
	}
}

func Test_ToRequestRole(t *testing.T) {
	t.Run("owner", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(OWNER), ToRequestRole(workspace.RoleOwner))
	})

	t.Run("maintainer", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(MAINTAINER), ToRequestRole(workspace.RoleMaintainer))
	})

	t.Run("writer", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(WRITER), ToRequestRole(workspace.RoleWriter))
	})

	t.Run("reader", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(READER), ToRequestRole(workspace.RoleReader))
	})

	t.Run("unknown role", func(t *testing.T) {
		assert.Nil(t, ToRequestRole("UNKNOWN_ROLE"))
	})
}

func Test_ToProjectPublicationScope(t *testing.T) {
	t.Run("public", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(PUBLIC), ToProjectPublicationScope(project.PublicationScopePublic))
	})

	t.Run("private", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(PRIVATE), ToProjectPublicationScope(project.PublicationScopePrivate))
	})

	t.Run("limited", func(t *testing.T) {
		assert.Equal(t, lo.ToPtr(LIMITED), ToProjectPublicationScope(project.PublicationScopeLimited))
	})

	t.Run("unknown scope", func(t *testing.T) {
		assert.Nil(t, ToProjectPublicationScope("SOMETHING_ELSE"))
	})
}
