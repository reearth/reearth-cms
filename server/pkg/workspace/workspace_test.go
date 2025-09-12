package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateAlias(t *testing.T) {
	tests := []struct {
		name     string
		alias    string
		expected bool
	}{
		{
			name:     "valid alias alphanumeric",
			alias:    "workspace123",
			expected: true,
		},
		{
			name:     "valid alias with underscore",
			alias:    "workspace_name",
			expected: true,
		},
		{
			name:     "valid alias with hyphen",
			alias:    "workspace-name",
			expected: true,
		},
		{
			name:     "valid alias mixed",
			alias:    "workspace_name-123",
			expected: true,
		},
		{
			name:     "valid alias minimum length",
			alias:    "abc",
			expected: true,
		},
		{
			name:     "valid alias maximum length",
			alias:    "abcdefghijklmnopqrstuvwxyz123456",
			expected: true,
		},
		{
			name:     "empty alias (optional)",
			alias:    "",
			expected: true,
		},
		{
			name:     "invalid alias too short",
			alias:    "ab",
			expected: false,
		},
		{
			name:     "invalid alias too long",
			alias:    "abcdefghijklmnopqrstuvwxyz1234567",
			expected: false,
		},
		{
			name:     "invalid alias with space",
			alias:    "workspace name",
			expected: false,
		},
		{
			name:     "invalid alias with special characters",
			alias:    "workspace@name",
			expected: false,
		},
		{
			name:     "invalid alias with dot",
			alias:    "workspace.name",
			expected: false,
		},
		{
			name:     "invalid alias with slash",
			alias:    "workspace/name",
			expected: false,
		},
		{
			name:     "invalid alias with plus",
			alias:    "workspace+name",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateAlias(tt.alias)
			assert.Equal(t, tt.expected, result)
		})
	}
}
