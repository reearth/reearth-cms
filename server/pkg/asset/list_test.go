package asset

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Asset{id: id2},
		&Asset{id: id1},
	}
	res := list.SortByID()

	assert.Equal(t, List{
		&Asset{id: id1},
		&Asset{id: id2},
	}, res)

	assert.Equal(t, List{
		&Asset{id: id2},
		&Asset{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()

	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()

	list := List{a}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}

func TestList_Map(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()

	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()

	assert.Equal(t, Map{
		a.ID(): a,
	}, List{a, nil}.Map())
	assert.Equal(t, Map{}, List(nil).Map())
}

func TestList_IDs(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()
	a1 := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()
	a2 := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()
	al := List{a1, a2}
	assert.Equal(t, al.IDs(), id.AssetIDList{a1.ID(), a2.ID()})
}
