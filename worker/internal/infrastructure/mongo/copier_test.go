package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func TestCopier(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	w := NewCopier(db)
	w.SetCollection(db.Collection("item"))

	assert.NoError(t, w.InitIndex(ctx))
	assert.NoError(t, w.InitIndex(ctx)) // second
}
