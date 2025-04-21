package view

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_Ordered(t *testing.T) {
	pid := id.NewProjectID()
	v1 := New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).Order(0).MustBuild()
	v2 := New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).Order(1).MustBuild()
	v3 := New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).Order(2).MustBuild()
	views := List{v3, v1, v2}
	ordered := views.Ordered()
	assert.NotEqual(t, views, ordered)
	assert.Equal(t, List{v1, v2, v3}, ordered)
}
