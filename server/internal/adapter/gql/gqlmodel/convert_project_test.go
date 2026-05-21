package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"
)

func TestConvertProject_ToProject(t *testing.T) {
	mocktime := time.Now()
	wid := accountdomain.NewWorkspaceID()
	r := []workspace.Role{workspace.RoleOwner}
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(wid).RequestRoles(r).UpdatedAt(mocktime.Add(-time.Second)).MustBuild()
	want := &Project{
		ID:          IDFrom(pid),
		Name:        p.Name(),
		Description: p.Description(),
		Alias:       p.Alias(),
		WorkspaceID: IDFrom(wid),
		Workspace:   nil,
		CreatedAt:   p.CreatedAt(),
		UpdatedAt:   p.UpdatedAt(),
		Accessibility: &ProjectAccessibility{
			Visibility: ProjectVisibilityPublic,
			Posting:    &PostingSettings{Enabled: false},
		},
		RequestRoles: []Role{RoleOwner},
	}
	assert.Equal(t, want, ToProject(p))

	var p2 *project.Project
	assert.Nil(t, ToProject(p2))
}

func TestToPostingSettings(t *testing.T) {

	tests := []struct {
		name string
		p    *project.PostingSettings
		want PostingSettings
	}{
		{name: "nil returns enabled=false", p: nil, want: PostingSettings{Enabled: false}},
		{name: "enabled=true", p: project.NewPostingSettings(true), want: PostingSettings{Enabled: true}},
		{name: "enabled=false", p: project.NewPostingSettings(false), want: PostingSettings{Enabled: false}},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, &tt.want, ToPostingSettings(tt.p))
		})
	}
}

func TestFromPostingSettings(t *testing.T) {

	tests := []struct {
		name string
		p    *UpdatePostingSettingsInput
		want *interfaces.PostingSettingsParam
	}{
		{name: "nil returns nil", p: nil, want: nil},
		{name: "enabled=true", p: &UpdatePostingSettingsInput{Enabled: true}, want: &interfaces.PostingSettingsParam{Enabled: true}},
		{name: "enabled=false", p: &UpdatePostingSettingsInput{Enabled: false}, want: &interfaces.PostingSettingsParam{Enabled: false}},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, FromPostingSettings(tt.p))
		})
	}
}
