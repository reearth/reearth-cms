package repo

import (
	"testing"

	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestNormalizeRequestSort(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		args *usecasex.Sort
		want *usecasex.Sort
	}{
		{name: "nil", args: nil, want: nil},
		{name: "must keep a document field", args: &usecasex.Sort{Key: "title"}, want: &usecasex.Sort{Key: "title"}},
		{name: "must lower a camelCase key", args: &usecasex.Sort{Key: "updatedAt", Reverted: true}, want: &usecasex.Sort{Key: "updatedat", Reverted: true}},
		{name: "must map a snake_case key", args: &usecasex.Sort{Key: "updated_at"}, want: &usecasex.Sort{Key: "updatedat"}},
		{name: "must trim spaces", args: &usecasex.Sort{Key: " state "}, want: &usecasex.Sort{Key: "state"}},
		{name: "must sort by ID for the creation time", args: &usecasex.Sort{Key: "createdAt", Reverted: true}, want: &usecasex.Sort{Key: "id", Reverted: true}},
		{name: "must sort by ID for the snake_case creation time", args: &usecasex.Sort{Key: "created_at"}, want: &usecasex.Sort{Key: "id"}},
		{name: "must sort by ID for the approval time", args: &usecasex.Sort{Key: "approvedAt"}, want: &usecasex.Sort{Key: "id"}},
		{name: "must sort by ID for the close time", args: &usecasex.Sort{Key: "closedat"}, want: &usecasex.Sort{Key: "id"}},
		{name: "must sort by ID for an unknown key", args: &usecasex.Sort{Key: "unknown"}, want: &usecasex.Sort{Key: "id"}},
		{name: "must sort by ID for an empty key", args: &usecasex.Sort{}, want: &usecasex.Sort{Key: "id"}},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, NormalizeRequestSort(tc.args))
		})
	}
}
