package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
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
			Posting:    &PostingSettings{Enabled: false, AllowedOrigins: []string{}},
		},
		RequestRoles: []Role{RoleOwner},
	}
	assert.Equal(t, want, ToProject(p))

	var p2 *project.Project
	assert.Nil(t, ToProject(p2))
}

// --- ToPublication ---

func TestToPublication(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, ToPublication(nil))
	})

	t.Run("non-nil returns mapped value", func(t *testing.T) {
		t.Parallel()
		mid := id.NewModelID()
		pub := project.NewPublicationSettings(project.ModelIDList{mid}, true)
		got := ToPublication(pub)
		assert.NotNil(t, got)
		assert.True(t, got.PublicAssets)
		assert.Len(t, got.PublicModels, 1)
	})
}

// --- ToAPIKey / ToAPIKeys / ToAPIKeyPayload ---

func TestToAPIKey(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, ToAPIKey(nil))
	})

	t.Run("non-nil maps all fields", func(t *testing.T) {
		t.Parallel()
		key := project.NewAPIKeyBuilder().NewID().Name("k").Description("d").GenerateKey().
			Publication(project.NewPublicationSettings(nil, false)).Build()
		got := ToAPIKey(key)
		assert.NotNil(t, got)
		assert.Equal(t, key.Name(), got.Name)
		assert.Equal(t, key.Description(), got.Description)
		assert.Equal(t, key.Key(), got.Key)
	})
}

func TestToAPIKeys(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, ToAPIKeys(nil))
	})

	t.Run("non-empty list maps all entries", func(t *testing.T) {
		t.Parallel()
		key := project.NewAPIKeyBuilder().NewID().Name("k").Description("d").GenerateKey().
			Publication(project.NewPublicationSettings(nil, false)).Build()
		got := ToAPIKeys(project.APIKeys{key})
		assert.Len(t, got, 1)
	})
}

func TestToAPIKeyPayload(t *testing.T) {
	t.Parallel()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	buildProjectWithKey := func() (*project.Project, project.APIKeyID) {
		kid := id.NewAPIKeyID()
		key := project.NewAPIKeyBuilder().ID(kid).Name("k").Description("d").GenerateKey().
			Publication(project.NewPublicationSettings(nil, false)).Build()
		a11y := project.NewAccessibility(project.VisibilityPublic, nil, nil, project.APIKeys{key})
		p := project.New().ID(pid).Workspace(wid).Accessibility(a11y).MustBuild()
		return p, kid
	}

	t.Run("nil project returns nil", func(t *testing.T) {
		t.Parallel()
		kid := id.NewAPIKeyID()
		assert.Nil(t, ToAPIKeyPayload(nil, kid))
	})

	t.Run("key not found returns payload with nil APIKey", func(t *testing.T) {
		t.Parallel()
		p, _ := buildProjectWithKey()
		missingKid := id.NewAPIKeyID()
		got := ToAPIKeyPayload(p, missingKid)
		assert.NotNil(t, got)
		assert.Nil(t, got.APIKey)
	})

	t.Run("key found returns payload with APIKey", func(t *testing.T) {
		t.Parallel()
		p, kid := buildProjectWithKey()
		got := ToAPIKeyPayload(p, kid)
		assert.NotNil(t, got)
		assert.NotNil(t, got.APIKey)
		assert.Equal(t, "k", got.APIKey.Name)
	})
}

// --- ToPostingSettings ---

func TestToPostingSettings(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		p    *project.PostingSettings
		want PostingSettings
	}{
		{
			name: "nil receiver — enabled=false, origins empty",
			p:    nil,
			want: PostingSettings{Enabled: false, AllowedOrigins: []string{}},
		},
		{
			name: "enabled=true, no origins",
			p:    project.NewPostingSettings(true, []string{}),
			want: PostingSettings{Enabled: true, AllowedOrigins: []string{}},
		},
		{
			name: "enabled=false, no origins",
			p:    project.NewPostingSettings(false, []string{}),
			want: PostingSettings{Enabled: false, AllowedOrigins: []string{}},
		},
		{
			name: "enabled=true, with origins",
			p:    project.NewPostingSettings(true, []string{"https://a.com", "https://b.com"}),
			want: PostingSettings{Enabled: true, AllowedOrigins: []string{"https://a.com", "https://b.com"}},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, &tt.want, ToPostingSettings(tt.p))
		})
	}
}

// --- ToProjectAccessibility ---

func TestToProjectAccessibility(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, ToProjectAccessibility(nil))
	})

	t.Run("non-nil maps all fields", func(t *testing.T) {
		t.Parallel()
		ps := project.NewPostingSettings(true, []string{"https://x.com"})
		a11y := project.NewAccessibility(project.VisibilityPrivate, nil, ps, nil)
		got := ToProjectAccessibility(a11y)
		assert.NotNil(t, got)
		assert.Equal(t, ProjectVisibilityPrivate, got.Visibility)
		assert.NotNil(t, got.Posting)
		assert.True(t, got.Posting.Enabled)
	})
}

// --- ToProjectVisibility ---

func TestToProjectVisibility(t *testing.T) {
	t.Parallel()

	tests := []struct {
		in   project.Visibility
		want ProjectVisibility
	}{
		{project.VisibilityPublic, ProjectVisibilityPublic},
		{project.VisibilityPrivate, ProjectVisibilityPrivate},
		{"unknown", ProjectVisibilityPublic}, // default falls through to PUBLIC
	}

	for _, tt := range tests {
		tt := tt
		t.Run(string(tt.in), func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToProjectVisibility(tt.in))
		})
	}
}

// --- FromProjectVisibility ---

func TestFromProjectVisibility(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, FromProjectVisibility(nil))
	})

	t.Run("PUBLIC maps to VisibilityPublic", func(t *testing.T) {
		t.Parallel()
		v := ProjectVisibilityPublic
		got := FromProjectVisibility(&v)
		assert.Equal(t, lo.ToPtr(project.VisibilityPublic), got)
	})

	t.Run("PRIVATE maps to VisibilityPrivate", func(t *testing.T) {
		t.Parallel()
		v := ProjectVisibilityPrivate
		got := FromProjectVisibility(&v)
		assert.Equal(t, lo.ToPtr(project.VisibilityPrivate), got)
	})
}

// --- FromPublicationSettings ---

func TestFromPublicationSettings(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, FromPublicationSettings(nil))
	})

	t.Run("non-nil maps fields", func(t *testing.T) {
		t.Parallel()
		mid := id.NewModelID()
		input := &UpdatePublicationSettingsInput{
			PublicModels: []ID{IDFrom(mid)},
			PublicAssets: true,
		}
		got := FromPublicationSettings(input)
		assert.NotNil(t, got)
		assert.True(t, got.PublicAssets)
		assert.Len(t, got.PublicModels, 1)
	})

	t.Run("invalid model ID returns nil", func(t *testing.T) {
		t.Parallel()
		input := &UpdatePublicationSettingsInput{
			PublicModels: []ID{"not-a-valid-id"},
			PublicAssets: false,
		}
		assert.Nil(t, FromPublicationSettings(input))
	})
}

// --- FromPostingSettings ---

func TestFromPostingSettings(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		p    *UpdatePostingSettingsInput
		want *interfaces.PostingSettingsParam
	}{
		{name: "nil returns nil", p: nil, want: nil},
		{
			name: "enabled=true, no origins",
			p:    &UpdatePostingSettingsInput{Enabled: true, AllowedOrigins: []string{}},
			want: &interfaces.PostingSettingsParam{Enabled: true, AllowedOrigins: []string{}},
		},
		{
			name: "enabled=false, no origins",
			p:    &UpdatePostingSettingsInput{Enabled: false, AllowedOrigins: []string{}},
			want: &interfaces.PostingSettingsParam{Enabled: false, AllowedOrigins: []string{}},
		},
		{
			name: "nil AllowedOrigins normalises to empty slice",
			p:    &UpdatePostingSettingsInput{Enabled: true, AllowedOrigins: nil},
			want: &interfaces.PostingSettingsParam{Enabled: true, AllowedOrigins: []string{}},
		},
		{
			name: "with origins",
			p:    &UpdatePostingSettingsInput{Enabled: true, AllowedOrigins: []string{"https://a.com"}},
			want: &interfaces.PostingSettingsParam{Enabled: true, AllowedOrigins: []string{"https://a.com"}},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, FromPostingSettings(tt.p))
		})
	}
}
