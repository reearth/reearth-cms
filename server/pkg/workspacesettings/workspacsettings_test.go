package workspacesettings

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_SetTiles(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := &WorkspaceSettings{}
	ws.SetTiles(tiles)
	assert.Equal(t, tiles, ws.Tiles())
	ws.SetTiles(nil)
	assert.Nil(t, ws.Tiles())
}

func TestWorkspaceSettings_SetTerrains(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	terrains := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := &WorkspaceSettings{}
	ws.SetTerrains(terrains)
	assert.Equal(t, terrains, ws.Terrains())
	ws.SetTerrains(nil)
	assert.Nil(t, ws.Terrains())
}

func TestWorkspaceSettings_SetResources(t *testing.T) {
	rid := NewResourceID()
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	rs := []*Resource{r}
	ws := &ResourceList{}
	ws.SetResources(rs)
	assert.Equal(t, rs, ws.Resources())
}

func TestWorkspaceSettings_SetDefaultResource(t *testing.T) {
	rid := NewResourceID()
	ws := &ResourceList{}
	ws.SetSelectedResource(rid.Ref())
	assert.Equal(t, rid.Ref(), ws.SelectedResource())
}

func TestWorkspaceSettings_SetEnabled(t *testing.T) {
	ws := &ResourceList{}
	e := lo.ToPtr(true)
	ws.SetEnabled(e)
	assert.Equal(t, e, ws.Enabled())
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
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	rid2 := NewResourceID()
	r2 := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	terrains := NewResourceList([]*Resource{r2}, rid2.Ref(), lo.ToPtr(true))
	ws := New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()
	got := ws.Clone()
	assert.Equal(t, ws, got)
	assert.NotSame(t, ws, got)
	assert.NotSame(t, ws.tiles, got.tiles)
	assert.NotSame(t, ws.terrains, got.terrains)
	assert.Nil(t, (*WorkspaceSettings)(nil).Clone())
}
