package util

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestMockNow(t *testing.T) {
	ti := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.UTC)
	assert.NotEqual(t, ti, Now())
	d := MockNow(ti)
	assert.Equal(t, ti, Now())
	d()
	assert.NotEqual(t, ti, Now())
}
