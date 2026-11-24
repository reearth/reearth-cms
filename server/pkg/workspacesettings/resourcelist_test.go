package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewResourceList(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	e := new(true)
	rl := NewResourceList([]*Resource{r}, rid.Ref(), e)
	assert.Equal(t, rl.resources, []*Resource{r})
	assert.Equal(t, rl.selectedResource.String(), rid.String())
	assert.Equal(t, rl.enabled, e)
}

func TestResourceList_Clone(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(ResourceTypeTile, NewTileResource(rid, TileTypeDefault, NewURLResourceProps("foo", "bar", "baz")), nil)

	tests := []struct {
		name string
		rl   *ResourceList
	}{
		{name: "must clone a list with resources", rl: NewResourceList([]*Resource{r, nil}, rid.Ref(), new(true))},
		{name: "must clone an empty list", rl: NewResourceList([]*Resource{}, nil, nil)},
		{name: "must clone a list without resources", rl: NewResourceList(nil, nil, nil)},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := tc.rl.Clone()
			assert.Equal(t, tc.rl, got)
			assert.NotSame(t, tc.rl, got)
			if tc.rl.resources != nil {
				for i := range tc.rl.resources {
					assert.Equal(t, tc.rl.resources[i], got.resources[i])
					if tc.rl.resources[i] != nil {
						assert.NotSame(t, tc.rl.resources[i], got.resources[i])
					}
				}
			}
		})
	}

	assert.Nil(t, (*ResourceList)(nil).Clone())
}
