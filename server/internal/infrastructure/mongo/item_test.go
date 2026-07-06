package mongo

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

// The interface-level tests for the item repository live in the shared suite
// (internal/usecase/repo/test) and run through TestItemRepo in
// repo_suite_test.go. This file only contains Mongo-specific tests.

// TestItem_MongoSpecific_Archive tests the persistence format of the archived
// flag and its upsert semantics; the interface-level Archive behavior is
// covered by the shared suite.
func TestItem_MongoSpecific_Archive(t *testing.T) {
	iid := id.NewItemID()
	pid := id.NewProjectID()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))
	ctx := context.Background()

	r := NewItem(client).Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	// archiving is an upsert: it works even before the item is saved
	err := r.Archive(ctx, iid, pid, true)
	assert.NoError(t, err)

	var d bson.M
	err = client.Database().Collection("item").FindOne(ctx, bson.M{
		"__": true,
		"id": iid.String(),
	}).Decode(&d)
	assert.NoError(t, err)
	assert.Equal(t, bson.M{
		"_id":      d["_id"],
		"__":       true,
		"id":       iid.String(),
		"project":  pid.String(),
		"archived": true,
	}, d)

	res, err := r.IsArchived(ctx, iid)
	assert.NoError(t, err)
	assert.True(t, res)
}

// TestItem_MongoSpecific_Copy tests the Mongo-specific filter returned by
// Copy (a BSON query including the version metadata).
func TestItem_MongoSpecific_Copy(t *testing.T) {
	ctx := context.Background()
	init := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(init(t))
	r := NewItem(client)

	s1 := id.NewSchemaID()
	s2 := id.NewSchemaID()
	m2 := id.NewModelID()
	timestamp := time.Now()
	uid := accountdomain.NewUserID().Ref().StringRef()
	params := repo.CopyParams{
		OldSchema:   s1,
		NewSchema:   s2,
		NewModel:    m2,
		Timestamp:   timestamp,
		User:        uid,
		Integration: nil,
	}

	filter, changes, err := r.Copy(ctx, params)
	assert.NoError(t, err)

	wantFilter, err := json.Marshal(bson.M{"schema": params.OldSchema.String(), "__r": bson.M{"$in": []string{"latest"}}})
	assert.NoError(t, err)
	assert.Equal(t, filter, lo.ToPtr(string(wantFilter)))

	wantChanges, err := json.Marshal(task.Changes{
		"id":                   {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"schema":               {Type: task.ChangeTypeSet, Value: params.NewSchema.String()},
		"modelid":              {Type: task.ChangeTypeSet, Value: params.NewModel.String()},
		"timestamp":            {Type: task.ChangeTypeSet, Value: params.Timestamp.UTC().Format("2006-01-02T15:04:05.000+00:00")},
		"updatedbyuser":        {Type: task.ChangeTypeSet, Value: nil},
		"updatedbyintegration": {Type: task.ChangeTypeSet, Value: nil},
		"originalitem":         {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"metadataitem":         {Type: task.ChangeTypeULID, Value: params.Timestamp.UnixMilli()},
		"thread":               {Type: task.ChangeTypeSet, Value: nil},
		"__r":                  {Type: task.ChangeTypeSet, Value: []string{"latest"}},
		"__w":                  {Type: task.ChangeTypeSet, Value: nil},
		"__v":                  {Type: task.ChangeTypeNew, Value: "version"},
		"user":                 {Type: task.ChangeTypeSet, Value: *params.User},
	})
	assert.NoError(t, err)
	assert.Equal(t, changes, lo.ToPtr(string(wantChanges)))
}
