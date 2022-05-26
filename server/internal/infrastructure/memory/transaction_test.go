package memory

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTransaction(t *testing.T) {
	ctx := context.Background()

	expected := &Transaction{}
	got := NewTransaction()
	assert.Equal(t, expected, got)

	gotBegin, err := got.Begin()
	assert.Equal(t, &Tx{}, gotBegin)
	assert.NoError(t, err)

	err = gotBegin.End(ctx)
	assert.NoError(t, err)
}
