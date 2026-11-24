package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestModelRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestModelRepo(t, func(t *testing.T) repo.Model {
		return NewModel(mongox.NewClientWithDatabase(init(t)))
	})
}

func Test_normalize(t *testing.T) {
	tests := []struct {
		name     string
		input    *usecasex.Sort
		expected *usecasex.Sort
	}{
		{
			name:  "nil input",
			input: nil,
			expected: &usecasex.Sort{
				Key:      "order",
				Reverted: true,
			},
		},
		{
			name: "sort by CreatedAt ascending",
			input: &usecasex.Sort{
				Key:      "CREATED_AT",
				Reverted: false,
			},
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: false,
			},
		},
		{
			name: "sort by CreatedAt descending",
			input: &usecasex.Sort{
				Key:      "CREATED_AT",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: true,
			},
		},
		{
			name: "sort by UpdatedAt ascending",
			input: &usecasex.Sort{
				Key:      "UPDATED_AT",
				Reverted: false,
			},
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: false,
			},
		},
		{
			name: "sort by UpdatedAt descending",
			input: &usecasex.Sort{
				Key:      "UPDATED_AT",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: true,
			},
		},
		{
			name: "invalid column",
			input: &usecasex.Sort{
				Key:      "invalid_column",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "order",
				Reverted: true,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result := normalize(tc.input)
			assert.Equal(t, tc.expected, result)
		})
	}
}
