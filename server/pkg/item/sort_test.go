package item

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSortTypeFrom(t *testing.T) {
	input := "Date"
	want := SortTypeDate
	assert.Equal(t, want, SortTypeFrom(input))
	assert.Equal(t, SortType(""), SortTypeFrom("xxx"))
}
