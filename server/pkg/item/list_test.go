package item

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Item{id: id2},
		&Item{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Item{id: id1},
		&Item{id: id2},
	}, res)
	assert.Equal(t, List{
		&Item{id: id2},
		&Item{id: id1},
	}, list)
}
