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
