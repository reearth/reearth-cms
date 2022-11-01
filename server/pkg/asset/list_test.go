package asset

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
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
	uid := NewUserID()

	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(id.NewThreadID()).MustBuild()

	list := List{a}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}
