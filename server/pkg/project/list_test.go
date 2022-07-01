package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Project{id: id2},
		&Project{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Project{id: id1},
		&Project{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Project{id: id2},
		&Project{id: id1},
	}, list)
}
