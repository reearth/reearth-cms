package memory

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/stretchr/testify/assert"
	"github.com/reearth/reearthx/util"
)

func TestNewModel(t *testing.T) {
	expected := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		now:  &util.TimeNow{},
	}

	got := NewModel()
	assert.Equal(t, expected, got)
}
