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
