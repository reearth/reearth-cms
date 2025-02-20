package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/util"
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

	pid := id.NewProjectID().String()
	uid := accountdomain.NewUserID().String()
	mid1, mid2 := id.NewModelID().String(), id.NewModelID().String()
	sid1, sid2 := id.NewSchemaID().String(), id.NewSchemaID().String()
	iid1, iid2 := id.NewItemID().String(), id.NewItemID().String()

	i1 := map[string]any{
		"id":        iid1,
		"schema":    sid1,
		"modelid":   mid1,
		"timestamp": util.Now().UTC().Format(time.RFC3339),
		"project":   pid,
		"user":      uid,
		"__r":       []string{"latest"},
	}
	i2 := map[string]any{
		"id":        iid2,
		"schema":    sid1,
		"modelid":   mid1,
		"timestamp": util.Now().UTC().Format(time.RFC3339),
		"project":   pid,
		"user":      uid,
		"__r":       []string{"latest"},
	}

	_, err := w.c.InsertMany(ctx, []any{i1, i2})
	assert.NoError(t, err)

	count, err := w.c.CountDocuments(ctx, bson.M{"schema": sid1})
	assert.NoError(t, err)
	assert.Greater(t, count, int64(0))

	timestamp := util.Now()
	filter := bson.M{"schema": sid1, "__r": bson.M{"$in": []string{"latest"}}}
	changes := task.Changes{
		"id":        {Type: task.ChangeTypeULID, Value: float64(timestamp.UnixMilli())},
		"schema":    {Type: task.ChangeTypeSet, Value: sid2},
		"modelid":   {Type: task.ChangeTypeSet, Value: mid2},
		"timestamp": {Type: task.ChangeTypeSet, Value: timestamp.UTC().Format(time.RFC3339)},
		"project":   {Type: task.ChangeTypeSet, Value: pid},
		"user":      {Type: task.ChangeTypeSet, Value: uid},
		"__r":       {Type: task.ChangeTypeSet, Value: []string{"latest"}},
	}

	cursor, err := w.c.Find(ctx, filter)
	assert.NoError(t, err)

	var beforeCopyDocs []bson.M
	err = cursor.All(ctx, &beforeCopyDocs)
	assert.NoError(t, err)
	assert.Equal(t, len(beforeCopyDocs), 2)

	err = w.Copy(ctx, filter, changes)
	assert.NoError(t, err)

	filter2 := bson.M{"schema": sid2, "__r": bson.M{"$in": []string{"latest"}}}
	cursor, err = w.c.Find(ctx, filter2)
	assert.NoError(t, err)

	var copiedDocs []bson.M
	err = cursor.All(ctx, &copiedDocs)
	assert.NoError(t, err)
	assert.Equal(t, len(copiedDocs), 2)

	for _, doc := range copiedDocs {
		assert.Contains(t, doc, "id")
		assert.Equal(t, mid2, doc["modelid"])
		assert.Equal(t, sid2, doc["schema"])
		assert.Equal(t, pid, doc["project"])
		assert.Equal(t, uid, doc["user"])
		assert.Contains(t, doc, "timestamp")
		assert.Contains(t, doc["__r"], "latest")
	}
}

func TestCopier_GenerateId(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expectOk bool
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
