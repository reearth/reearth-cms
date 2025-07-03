package main

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_updateProject(t *testing.T) {
	tests := []struct {
		name    string
		models  map[string][]OldModelDocument
		project ProjectDocument
		want    ProjectDocument
	}{
		{
			name:   "public project with no publication",
			models: map[string][]OldModelDocument{},
			project: ProjectDocument{
				ID: "project1",
				Publication: &ProjectPublicationDocument{
					Scope: "public",
				},
			},
			want: ProjectDocument{
				//Publication: &ProjectPublicationDocument{
				//	Scope: "PUBLIC",
				//},
				Accessibility: &ProjectAccessibilityDocument{
					Visibility:  "public",
					Publication: nil,
					Keys:        nil,
				},
			},
		},
		{
			name:   "private project with publication",
			models: map[string][]OldModelDocument{},
			project: ProjectDocument{
				ID: "project2",
				Publication: &ProjectPublicationDocument{
					Scope: "private",
				},
			},
			want: ProjectDocument{
				//Publication: &ProjectPublicationDocument{
				//	Scope: "private",
				//},
				Accessibility: &ProjectAccessibilityDocument{
					Visibility: "private",
					Publication: &PublicationSettingsDocument{
						PublicModels: []string{},
						PublicAssets: false,
					},
				},
			},
		},
		{
			name: "limited project with models",
			models: map[string][]OldModelDocument{
				"project3": {
					{
						ID:      "model1",
						Project: "project3",
						Public:  true,
					},
					{
						ID:      "model2",
						Project: "project3",
						Public:  false,
					},
				},
			},
			project: ProjectDocument{
				ID: "project3",
				Publication: &ProjectPublicationDocument{
					Scope:       "limited",
					AssetPublic: true,
					Token:       lo.ToPtr("secret_123"),
				},
			},
			want: ProjectDocument{
				//Publication: &ProjectPublicationDocument{
				//	Scope:       "limited",
				//	AssetPublic: true,
				//	Token:       lo.ToPtr("secret_123"),
				//},
				Accessibility: &ProjectAccessibilityDocument{
					Visibility: "private",
					Publication: &PublicationSettingsDocument{
						PublicModels: []string{},
						PublicAssets: false,
					},
					Keys: []APIKeyDocument{
						{
							//ID:          "project3-key",
							Name:        "limited migration key",
							Description: "Key for limited publication migration",
							Key:         "secret_123",
							Publication: &PublicationSettingsDocument{
								PublicModels: []string{"model1"},
								PublicAssets: true,
							},
						},
					},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := updateProject(tt.models)(tt.project)
			if got.Accessibility != nil && len(got.Accessibility.Keys) == 1 {
				assert.NotNil(t, got.Accessibility.Keys[0].ID)
				got.Accessibility.Keys[0].ID = ""
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
