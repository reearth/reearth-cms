package item

import (
	"testing"
	"time"

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

func TestList_SortByTimestamp(t *testing.T) {
	id1 := NewID()
	id2 := NewID()
	now1 := time.Now()
	now2 := time.Now().Add(time.Second)

	list := List{
		&Item{id: id2, timestamp: now2},
		&Item{id: id1, timestamp: now1},
	}
	res := list.SortByTimestamp()
	assert.Equal(t, List{
		&Item{id: id1, timestamp: now1},
		&Item{id: id2, timestamp: now2},
	}, res)
	assert.Equal(t, List{
		&Item{id: id2, timestamp: now2},
		&Item{id: id1, timestamp: now1},
	}, list)
}
