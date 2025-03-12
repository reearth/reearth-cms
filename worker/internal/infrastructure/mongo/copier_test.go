package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestCopier_SetCollection(t *testing.T) {
	db := mongotest.Connect(t)(t)
	w := NewCopier(db)
	w.SetCollection(db.Collection("item"))
	assert.Equal(t, "item", w.c.Name())
}

func TestCopier_Copy(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	w := NewCopier(db)
	iCol := db.Collection("item")
	w.SetCollection(iCol)

	mid1 := id.NewModelID()
	sid1 := id.NewSchemaID()
	mid2 := id.NewModelID()
	sid2 := id.NewSchemaID()
	i1 := item.New().ID(id.NewItemID()).Schema(sid1).Model(mid1).Project(id.NewProjectID()).MustBuild()
	i2 := item.New().ID(id.NewItemID()).Schema(sid1).Model(mid1).Project(id.NewProjectID()).MustBuild()

	_, err := iCol.InsertMany(ctx, []any{i1, i2})
	assert.NoError(t, err)

	filter := bson.M{"schema": sid1.String()}
	changes := task.Changes{
		"id": {
			Type:  task.ChangeTypeNew,
			Value: "item",
		},
		"schema": {
			Type:  task.ChangeTypeSet,
			Value: sid2.String(),
		},
		"model": {
			Type:  task.ChangeTypeSet,
			Value: mid2.String(),
		},
	}

	err = w.Copy(ctx, filter, changes)
	assert.NoError(t, err)
}

func TestCopier_GenerateId(t *testing.T) {
	tests := []struct {
		name       string
		input      string
		expectOk   bool
	}{
		{
			name:     "Valid input - item",
			input:    "item",
			expectOk: true,
		},
		{
			name:     "Valid input - schema",
			input:    "schema",
			expectOk: true,
		},
		{
			name:     "Valid input - model",
			input:    "model",
			expectOk: true,
		},
		{
			name:     "Invalid input - unknown type",
			input:    "unknown",
			expectOk: false,
		},
		{
			name:     "Empty input",
			input:    "",
			expectOk: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, ok := generateId(tt.input)
			assert.Equal(t, tt.expectOk, ok)
		})
	}
}
