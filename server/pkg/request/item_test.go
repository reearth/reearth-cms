package request

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	vor := version.New().OrRef()
	iid := id.NewItemID()
	itm, err := NewItemWithVersion(iid, vor)
	assert.NoError(t, err)
	assert.Equal(t, vor, itm.Pointer())
	assert.Equal(t, iid, itm.Item())
}

func TestItemList_IDs(t *testing.T) {
	i1, _ := NewItem(id.NewItemID(), new(version.New().String()))
	i2, _ := NewItem(id.NewItemID(), new(version.New().String()))
	i3, _ := NewItem(id.NewItemID(), new(version.New().String()))
	list := ItemList{i1, i2, i3}
	ids := id.ItemIDList{i1.Item(), i2.Item(), i3.Item()}
	assert.Equal(t, ids, list.IDs())
}

func TestItemList_HasDuplication(t *testing.T) {
	i1, _ := NewItem(id.NewItemID(), new(version.New().String()))
	i2, _ := NewItem(id.NewItemID(), new(version.New().String()))
	i3, _ := NewItem(id.NewItemID(), new(version.New().String()))
	input1 := ItemList{i1, i2, i3, i2}
	input2 := ItemList{i1, i2, i3}
	assert.Equal(t, true, input1.HasDuplication())
	assert.Equal(t, false, input2.HasDuplication())
}

func TestItemList_Clone(t *testing.T) {
	i1, _ := NewItemWithVersion(id.NewItemID(), version.New().OrRef())
	i2, _ := NewItemWithVersion(id.NewItemID(), version.Latest.OrVersion())
	list := ItemList{i1, i2}

	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
	assert.NotSame(t, list[1], got[1])

	got[0].SetPointer(version.Public.OrVersion())
	assert.NotEqual(t, got[0].Pointer(), list[0].Pointer())

	assert.Equal(t, ItemList{}, ItemList{}.Clone())
	assert.Nil(t, ItemList(nil).Clone())
	assert.Nil(t, (*Item)(nil).Clone())
}
