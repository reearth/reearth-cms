package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
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
				Id:          p1.ID().Ref(),
				WorkspaceId: p1.Workspace().Ref(),
				Alias:       lo.ToPtr(p1.Alias()),
				Name:        lo.ToPtr(p1.Name()),
				Description: lo.ToPtr(p1.Description()),
				CreatedAt:   lo.ToPtr(p1.CreatedAt()),
				UpdatedAt:   lo.ToPtr(p1.UpdatedAt()),
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
