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
				Id:           p1.ID().Ref(),
				WorkspaceId:  p1.Workspace().Ref(),
				Alias:        lo.ToPtr(p1.Alias()),
				Name:         lo.ToPtr(p1.Name()),
				Description:  lo.ToPtr(p1.Description()),
				CreatedAt:    lo.ToPtr(p1.CreatedAt()),
				UpdatedAt:    lo.ToPtr(p1.UpdatedAt()),
				Publication:  nil,
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
	// owner
	assert.Equal(t, lo.ToPtr(OWNER), ToRequestRole(workspace.RoleOwner))

	// maintainer
	assert.Equal(t, lo.ToPtr(MAINTAINER), ToRequestRole(workspace.RoleMaintainer))

	// writer
	assert.Equal(t, lo.ToPtr(WRITER), ToRequestRole(workspace.RoleWriter))

	// reader
	assert.Equal(t, lo.ToPtr(READER), ToRequestRole(workspace.RoleReader))

	// unknown
	assert.Nil(t, ToRequestRole("UNKNOWN_ROLE"))
}

func Test_ToProjectPublicationScope(t *testing.T) {
	// public
	assert.Equal(t, lo.ToPtr(PUBLIC), ToProjectPublicationScope(project.PublicationScopePublic))

	// private
	assert.Equal(t, lo.ToPtr(PRIVATE), ToProjectPublicationScope(project.PublicationScopePrivate))

	// limited
	assert.Equal(t, lo.ToPtr(LIMITED), ToProjectPublicationScope(project.PublicationScopeLimited))

	// unknown
	assert.Nil(t, ToProjectPublicationScope("SOMETHING_ELSE"))
}
