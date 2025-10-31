package gqlmodel

import (
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspace"
	"github.com/stretchr/testify/assert"
)

func Test_ToWorkspaceFromValue(t *testing.T) {
	tests := []struct {
		name     string
		input    workspace.Workspace
		expected *Workspace
	}{
		{
			name: "valid workspace",
			input: *workspace.New().
				NewID().
				Name("Test Workspace").
				Alias("test-workspace").
				Personal(false).
				Metadata(workspace.NewMetadata().
					Description("Test description").
					Website("https://example.com").
					Location("Tokyo").
					BillingEmail("billing@example.com").
					PhotoURL("https://example.com/photo.jpg").
					MustBuild()).
				MustBuild(),
			expected: func() *Workspace {
				ws := workspace.New().
					NewID().
					Name("Test Workspace").
					Alias("test-workspace").
					Personal(false).
					Metadata(workspace.NewMetadata().
						Description("Test description").
						Website("https://example.com").
						Location("Tokyo").
						BillingEmail("billing@example.com").
						PhotoURL("https://example.com/photo.jpg").
						MustBuild()).
					MustBuild()
				alias := ws.Alias()
				return &Workspace{
					ID:       IDFrom(ws.ID()),
					Name:     ws.Name(),
					Alias:    &alias,
					Personal: ws.Personal(),
					Members:  []WorkspaceMember{},
				}
			}(),
		},
		{
			name: "personal workspace",
			input: *workspace.New().
				NewID().
				Name("Personal Workspace").
				Alias("personal").
				Personal(true).
				Metadata(workspace.NewMetadata().MustBuild()).
				MustBuild(),
			expected: func() *Workspace {
				ws := workspace.New().
					NewID().
					Name("Personal Workspace").
					Alias("personal").
					Personal(true).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				alias := ws.Alias()
				return &Workspace{
					ID:       IDFrom(ws.ID()),
					Name:     ws.Name(),
					Alias:    &alias,
					Personal: ws.Personal(),
					Members:  []WorkspaceMember{},
				}
			}(),
		},
		{
			name: "workspace with empty alias",
			input: *workspace.New().
				NewID().
				Name("No Alias Workspace").
				Alias("").
				Personal(false).
				Metadata(workspace.NewMetadata().MustBuild()).
				MustBuild(),
			expected: func() *Workspace {
				ws := workspace.New().
					NewID().
					Name("No Alias Workspace").
					Alias("").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				alias := ws.Alias()
				return &Workspace{
					ID:       IDFrom(ws.ID()),
					Name:     ws.Name(),
					Alias:    &alias,
					Personal: ws.Personal(),
					Members:  []WorkspaceMember{},
				}
			}(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ToWorkspaceFromValue(tt.input)
			assert.NotNil(t, result)
			assert.Equal(t, tt.expected.Name, result.Name)
			assert.Equal(t, tt.expected.Personal, result.Personal)
			assert.Equal(t, tt.expected.Members, result.Members)
			if tt.expected.Alias != nil && result.Alias != nil {
				assert.Equal(t, *tt.expected.Alias, *result.Alias)
			}
			// ID comparison - just check it's not empty
			assert.NotEmpty(t, result.ID)
		})
	}
}

func Test_ToWorkspaceFromValue_EmptyID(t *testing.T) {
	// Create a workspace with empty ID
	ws := workspace.Workspace{}
	result := ToWorkspaceFromValue(ws)
	assert.Nil(t, result, "should return nil for workspace with empty ID")
}

func Test_ToWorkspaces(t *testing.T) {
	tests := []struct {
		name     string
		input    workspace.WorkspaceList
		expected []*Workspace
	}{
		{
			name:     "nil workspace list",
			input:    nil,
			expected: []*Workspace{},
		},
		{
			name:     "empty workspace list",
			input:    workspace.WorkspaceList{},
			expected: []*Workspace{},
		},
		{
			name: "single workspace",
			input: workspace.WorkspaceList{
				*workspace.New().
					NewID().
					Name("Single Workspace").
					Alias("single").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild(),
			},
			expected: func() []*Workspace {
				ws := workspace.New().
					NewID().
					Name("Single Workspace").
					Alias("single").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				alias := ws.Alias()
				return []*Workspace{
					{
						ID:       IDFrom(ws.ID()),
						Name:     ws.Name(),
						Alias:    &alias,
						Personal: ws.Personal(),
						Members:  []WorkspaceMember{},
					},
				}
			}(),
		},
		{
			name: "multiple workspaces",
			input: workspace.WorkspaceList{
				*workspace.New().
					NewID().
					Name("Workspace 1").
					Alias("workspace-1").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild(),
				*workspace.New().
					NewID().
					Name("Workspace 2").
					Alias("workspace-2").
					Personal(true).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild(),
			},
			expected: func() []*Workspace {
				ws1 := workspace.New().
					NewID().
					Name("Workspace 1").
					Alias("workspace-1").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				ws2 := workspace.New().
					NewID().
					Name("Workspace 2").
					Alias("workspace-2").
					Personal(true).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				alias1 := ws1.Alias()
				alias2 := ws2.Alias()
				return []*Workspace{
					{
						ID:       IDFrom(ws1.ID()),
						Name:     ws1.Name(),
						Alias:    &alias1,
						Personal: ws1.Personal(),
						Members:  []WorkspaceMember{},
					},
					{
						ID:       IDFrom(ws2.ID()),
						Name:     ws2.Name(),
						Alias:    &alias2,
						Personal: ws2.Personal(),
						Members:  []WorkspaceMember{},
					},
				}
			}(),
		},
		{
			name: "workspace list with empty ID workspace (should be filtered out)",
			input: workspace.WorkspaceList{
				*workspace.New().
					NewID().
					Name("Valid Workspace").
					Alias("valid").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild(),
				workspace.Workspace{}, // Empty workspace with no ID
			},
			expected: func() []*Workspace {
				ws := workspace.New().
					NewID().
					Name("Valid Workspace").
					Alias("valid").
					Personal(false).
					Metadata(workspace.NewMetadata().MustBuild()).
					MustBuild()
				alias := ws.Alias()
				return []*Workspace{
					{
						ID:       IDFrom(ws.ID()),
						Name:     ws.Name(),
						Alias:    &alias,
						Personal: ws.Personal(),
						Members:  []WorkspaceMember{},
					},
				}
			}(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ToWorkspaces(tt.input)
			assert.Equal(t, len(tt.expected), len(result))

			for i, expected := range tt.expected {
				if i < len(result) {
					assert.Equal(t, expected.Name, result[i].Name)
					assert.Equal(t, expected.Personal, result[i].Personal)
					assert.Equal(t, expected.Members, result[i].Members)
					if expected.Alias != nil && result[i].Alias != nil {
						assert.Equal(t, *expected.Alias, *result[i].Alias)
					}
					// ID comparison - just check it's not empty
					assert.NotEmpty(t, result[i].ID)
				}
			}
		})
	}
}

func Test_ToWorkspaces_Performance(t *testing.T) {
	// Test with a large number of workspaces to ensure performance is reasonable
	var workspaces workspace.WorkspaceList
	for i := 0; i < 100; i++ {
		ws := workspace.New().
			NewID().
			Name(fmt.Sprintf("Workspace-%d", i)).
			Alias(fmt.Sprintf("workspace-%d", i)).
			Personal(i%2 == 0).
			Metadata(workspace.NewMetadata().MustBuild()).
			MustBuild()
		workspaces = append(workspaces, *ws)
	}

	result := ToWorkspaces(workspaces)
	assert.Equal(t, 100, len(result))

	// Spot check a few workspaces
	assert.Contains(t, result[0].Name, "Workspace")
	assert.NotEmpty(t, result[0].ID)
	assert.Equal(t, []WorkspaceMember{}, result[0].Members)
}
