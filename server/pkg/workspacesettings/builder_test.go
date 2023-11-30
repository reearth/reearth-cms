package workspacesettings

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	var tb = New()
	assert.NotNil(t, tb)
}

func TestBuilder_ID(t *testing.T) {
	var tb = New()
	res := tb.ID(NewID()).MustBuild()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Tiles(t *testing.T) {
	var tb = New().NewID()
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	tiles := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	res := tb.Tiles(tiles).MustBuild()
	assert.Equal(t, tiles, res.Tiles())
}

func TestBuilder_Terrains(t *testing.T) {
	var tb = New().NewID()
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	terrains := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	res := tb.Terrains(terrains).MustBuild()
	assert.Equal(t, terrains, res.Terrains())
}

func TestBuilder_NewID(t *testing.T) {
	var tb = New()
	res := tb.NewID().MustBuild()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Build(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	tiles := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	rid2 := NewResourceID()
	r2 := NewResource(rid2, "foo", "bar", "baz")
	terrains := NewWorkspaceResourceList([]*Resource{r2}, rid2.Ref(), true)
	ws, err := New().ID(wid).Tiles(tiles).Terrains(terrains).Build()
	expected := &WorkspaceSettings{
		id:          wid,
		tiles:       tiles,
		terrains:    terrains,
	}

	assert.NoError(t, err)
	assert.Equal(t, expected, ws)

	ws1, err := New().ID(wid).Tiles(tiles).Terrains(terrains).Build()
	assert.ErrorIs(t, ErrInvalidID, err)
	assert.Nil(t, ws1)

	ws2, err := New().ID(wid).Tiles(tiles).Terrains(terrains).Build()
	assert.ErrorIs(t, ErrInvalidID, err)
	assert.Nil(t, ws2)
}

func TestBuilder_MustBuild(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	rid := NewResourceID()
	r := NewResource(rid, "foo", "bar", "baz")
	tiles := NewWorkspaceResourceList([]*Resource{r}, rid.Ref(), true)
	rid2 := NewResourceID()
	r2 := NewResource(rid2, "foo", "bar", "baz")
	terrains := NewWorkspaceResourceList([]*Resource{r2}, rid2.Ref(), true)
	build := func() *WorkspaceSettings {
		return New().
			ID(wid).
			Tiles(tiles).
			Terrains(terrains).
			MustBuild()
	}
	expected := &WorkspaceSettings{
		id:          wid,
		tiles:       tiles,
		terrains:    terrains,
	}

	assert.Equal(t, expected, build())

	build1 := func() *WorkspaceSettings {
		return New().
			ID(wid).
			Tiles(tiles).
			Terrains(terrains).
			MustBuild()
	}
	assert.PanicsWithValue(t, ErrInvalidID, func() { _ = build1() })

	build2 := func() *WorkspaceSettings {
		return New().
			ID(wid).
			Tiles(tiles).
			Terrains(terrains).
			MustBuild()
	}
	assert.PanicsWithValue(t, ErrInvalidID, func() { _ = build2() })
}
