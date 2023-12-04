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
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), nil)
	res := tb.Tiles(tiles).MustBuild()
	assert.Equal(t, tiles, res.Tiles())
}

func TestBuilder_Terrains(t *testing.T) {
	var tb = New().NewID()
	rid := NewResourceID()
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	terrains := NewResourceList([]*Resource{r}, rid.Ref(), nil)
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
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), nil)
	rid2 := NewResourceID()
	r2 := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	terrains := NewResourceList([]*Resource{r2}, rid2.Ref(), nil)
	ws, err := New().ID(wid).Tiles(tiles).Terrains(terrains).Build()
	expected := &WorkspaceSettings{
		id:       wid,
		tiles:    tiles,
		terrains: terrains,
	}

	assert.NoError(t, err)
	assert.Equal(t, expected, ws)

	ws1, err := New().Tiles(tiles).Terrains(terrains).Build()
	assert.ErrorIs(t, ErrInvalidID, err)
	assert.Nil(t, ws1)
}

func TestBuilder_MustBuild(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	rid := NewResourceID()
	r := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), nil)
	rid2 := NewResourceID()
	r2 := NewResource(rid, "type", "foo", "bar", "baz", nil, nil)
	terrains := NewResourceList([]*Resource{r2}, rid2.Ref(), nil)
	build := func() *WorkspaceSettings {
		return New().
			ID(wid).
			Tiles(tiles).
			Terrains(terrains).
			MustBuild()
	}
	expected := &WorkspaceSettings{
		id:       wid,
		tiles:    tiles,
		terrains: terrains,
	}

	assert.Equal(t, expected, build())

	build1 := func() *WorkspaceSettings {
		return New().
			Tiles(tiles).
			Terrains(terrains).
			MustBuild()
	}
	assert.PanicsWithValue(t, ErrInvalidID, func() { _ = build1() })
}
