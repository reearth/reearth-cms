package workspacesettings

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_SetTiles(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	tiles := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	ws := &WorkspaceSettings{}
	ws.SetTiles(tiles)
	assert.Equal(t, tiles, ws.Tiles())
	ws.SetTiles(nil)
	assert.Nil(t, ws.Tiles())
}

func TestWorkspaceSettings_SetTerrains(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	terrains := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	ws := &WorkspaceSettings{}
	ws.SetTerrains(terrains)
	assert.Equal(t, terrains, ws.Terrains())
	ws.SetTerrains(nil)
	assert.Nil(t, ws.Terrains())
}

func TestWorkspaceSettings_SetResources(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	rs := []*Resource{r}
	ws := &WorkspaceResourceList{}
	ws.SetResources(rs)
	assert.Equal(t, rs, ws.Resources())
}

func TestWorkspaceSettings_SetDefaultResource(t *testing.T) {
	rid := NewResourceID()
	ws := &WorkspaceResourceList{}
	ws.SetDefaultResource(rid.Ref())
	assert.Equal(t, rid.Ref(), ws.DefaultResource())
}

func TestWorkspaceSettings_SetAllowSwitch(t *testing.T) {
	ws := &WorkspaceResourceList{}
	ws.SetAllowSwitch(true)
	assert.True(t, ws.AllowSwitch())
}

func TestWorkspaceSettings_SetName(t *testing.T) {
	r := &Resource{}
	r.SetName("foo")
	assert.Equal(t, "foo", r.Name())
}

func TestWorkspaceSettings_SetURL(t *testing.T) {
	r := &Resource{}
	r.SetURL("foo")
	assert.Equal(t, "foo", r.URL())
}

func TestWorkspaceSettings_SetImage(t *testing.T) {
	r := &Resource{}
	r.SetImage("foo")
	assert.Equal(t, "foo", r.Image())
}

func TestWorkspaceSettings_Clone(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	rid2 := NewResourceID()
	r2 := NewResource(rid2, "foo", "bar", "baz")
	tiles := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	terrains := NewWorkspaceResourceList([]*Resource{r2}, rid2.Ref(), true)
	ws := New().NewID().Workspace(accountdomain.NewWorkspaceID()).Tiles(tiles).Terrains(terrains).MustBuild()
	got := ws.Clone()
	assert.Equal(t, ws, got)
	assert.NotSame(t, ws, got)
	assert.NotSame(t, ws.tiles, got.tiles)
	assert.NotSame(t, ws.terrains, got.terrains)
	assert.Nil(t, (*WorkspaceSettings)(nil).Clone())
}
