package project

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestCheckAliasPattern(t *testing.T) {
	testCase := []struct {
		name, alias string
		expexted    bool
	}{
		{
			name:     "accepted regex",
			alias:    "xxxxx",
			expexted: true,
		},
		{
			name:     "refused regex",
			alias:    "xxx",
			expexted: false,
		},
	}

	for _, tt := range testCase {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expexted, CheckAliasPattern(tt.alias))
		})
	}
}

func TestProject_SetUpdatedAt(t *testing.T) {
	p := &Project{}
	p.SetUpdatedAt(time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC), p.UpdatedAt())
}

func TestProject_SetImageURL(t *testing.T) {
	testCase := []struct {
		name        string
		image       *url.URL
		p           *Project
		expectedNil bool
	}{
		{
			name:        "nil image",
			image:       nil,
			p:           &Project{},
			expectedNil: true,
		},
		{
			name:        "set new image",
			image:       &url.URL{},
			p:           &Project{},
			expectedNil: false,
		},
	}

	for _, tt := range testCase {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.p.SetImageURL(tt.image)
			if tt.expectedNil {
				assert.Nil(t, tt.p.ImageURL())
			} else {
				assert.NotNil(t, tt.p.ImageURL())
			}
		})
	}
}

func TestProject_UpdateName(t *testing.T) {
	p := &Project{}
	p.UpdateName("foo")
	assert.Equal(t, "foo", p.Name())
}

func TestProject_Publication(t *testing.T) {
	p := &Project{}
	pp := Accessibility{
		visibility: VisibilityPublic,
		apiKeys:    nil,
	}
	p.SetAccessibility(pp)
	assert.Equal(t, &pp, p.Accessibility())
}

func TestProject_UpdateDescription(t *testing.T) {
	p := &Project{}
	p.UpdateDescription("aaa")
	assert.Equal(t, "aaa", p.Description())
}

func TestProject_SetRequestRoles(t *testing.T) {
	p := &Project{}
	r := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}
	p.SetRequestRoles(r)
	assert.Equal(t, p.RequestRoles(), r)
}

func TestProject_SetTopics(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "nil topics",
			input:    nil,
			expected: []string{}, // SetTopics always initializes the slice
		},
		{
			name:     "empty topics",
			input:    []string{},
			expected: []string{}, // SetTopics always initializes the slice
		},
		{
			name:     "topics with spaces",
			input:    []string{" topic1 ", "  topic2  "},
			expected: []string{"topic1", "topic2"},
		},
		{
			name:     "topics with empty strings",
			input:    []string{"topic1", "", "topic2", "   ", "topic3"},
			expected: []string{"topic1", "topic2", "topic3"},
		},
		{
			name:     "duplicate topics",
			input:    []string{"topic1", "topic2", "topic1", "topic2", "topic3"},
			expected: []string{"topic1", "topic2", "topic3"},
		},
		{
			name:     "mixed case with spaces, empties, and duplicates",
			input:    []string{" topic1 ", "", "Topic1", "   ", " topic2  ", "topic2"},
			expected: []string{"topic1", "Topic1", "topic2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &Project{}
			p.SetTopics(tt.input)
			assert.Equal(t, tt.expected, p.Topics())
		})
	}

	t.Run("nil receiver", func(t *testing.T) {
		var p *Project
		p.SetTopics([]string{"topic1"}) // should not panic
	})
}

func TestProject_UpdateAlias(t *testing.T) {
	tests := []struct {
		name, a  string
		expected string
		err      error
	}{
		{
			name:     "accepted alias",
			a:        "xxxxx",
			expected: "xxxxx",
			err:      nil,
		},
		{
			name:     "fail: invalid alias",
			a:        "xxx",
			expected: "",
			err:      ErrInvalidAlias,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &Project{}
			err := p.UpdateAlias(tt.a)
			if tt.err == nil {
				assert.Equal(t, tt.expected, p.Alias())
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestProject_Clone(t *testing.T) {
	posting, err := NewPostingSettings(true, []string{"https://example.com"})
	assert.NoError(t, err)
	key := NewAPIKeyBuilder().NewID().GenerateKey().Name("key").
		Publication(NewPublicationSettings(ModelIDList{NewModelID()}, true)).Build()
	u1 := accountdomain.NewUserID()

	tests := []struct {
		name string
		p    *Project
	}{
		{
			name: "must clone a project with all fields",
			p: New().NewID().Workspace(accountdomain.NewWorkspaceID()).
				Alias("alias-one").Name("name").Description("description").
				Readme("readme").License("license").
				ImageURL(lo.Must(url.Parse("https://example.com/image.png"))).
				StarCount(1).StarredBy([]string{u1.String()}).
				Topics([]string{"topic1", "topic2"}).
				UpdatedAt(time.Now()).
				Accessibility(NewAccessibility(VisibilityPrivate, NewPublicationSettings(ModelIDList{NewModelID()}, false), posting, APIKeys{key})).
				RequestRoles([]workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}).
				MustBuild(),
		},
		{
			name: "must clone a project with default fields",
			p:    New().NewID().MustBuild(),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := tc.p.Clone()
			assert.Equal(t, tc.p, got)
			assert.NotSame(t, tc.p, got)
			assert.NotSame(t, tc.p.Accessibility(), got.Accessibility())

			// changing the clone must not change the original
			want := tc.p.Clone()
			got.Star(accountdomain.NewUserID())
			got.SetTopics(append(got.Topics(), "topic3"))
			got.SetRequestRoles(append(got.RequestRoles(), workspace.RoleReader))
			if len(got.StarredBy()) > 1 {
				got.StarredBy()[0] = "changed"
			}
			if len(got.Topics()) > 1 {
				got.Topics()[0] = "changed"
			}
			if len(got.RequestRoles()) > 1 {
				got.RequestRoles()[0] = workspace.RoleReader
			}
			assert.Equal(t, want, tc.p)
		})
	}

	assert.Nil(t, (*Project)(nil).Clone())
}
