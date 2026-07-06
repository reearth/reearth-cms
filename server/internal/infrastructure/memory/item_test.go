package memory

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// The interface-level tests for the item repository live in the shared suite
// (internal/usecase/repo/test) and run through TestItemRepo in
// repo_suite_test.go. This file only contains memory-specific tests.

// TestItem_MemorySpecific_RemoveSemantics tests the error values the memory
// implementation returns when removing missing or non-writable items; mongo
// folds the project filter into the delete query and cannot distinguish these
// cases, so they are not part of the shared interface suite.
func TestItem_MemorySpecific_RemoveSemantics(t *testing.T) {
	ctx := context.Background()
	pid, pid2 := id.NewProjectID(), id.NewProjectID()
	i1 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(pid2).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i1)
	_ = r.Save(ctx, i2)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	assert.NoError(t, r.Remove(ctx, i1.ID()))
	assert.Equal(t, rerror.ErrNotFound, r.Remove(ctx, i1.ID()))
	assert.Equal(t, repo.ErrOperationDenied, r.Remove(ctx, i2.ID()))
	assert.Equal(t, repo.ErrOperationDenied, r.BatchRemove(ctx, id.ItemIDList{i2.ID()}))
}

// TestItem_MemorySpecific_Errors tests the SetItemError injection helper used
// by interactor tests to simulate repository failures.
func TestItem_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	i := item.New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	r := NewItem()
	_ = r.Save(ctx, i)
	SetItemError(r, wantErr)

	_, err := r.FindByID(ctx, i.ID(), nil)
	assert.Same(t, wantErr, err)
	assert.Same(t, wantErr, r.Save(ctx, i))
	assert.Same(t, wantErr, r.Remove(ctx, i.ID()))
	assert.Same(t, wantErr, r.BatchRemove(ctx, id.ItemIDList{i.ID()}))
	assert.Same(t, wantErr, r.UpdateRef(ctx, i.ID(), version.Ref("xxx"), nil))
	_, _, err = r.Search(ctx, schema.Package{}, item.NewQuery(i.Project(), i.Model(), nil, "", nil), nil)
	assert.Same(t, wantErr, err)
	_, err = r.FindByModelAndValue(ctx, i.Model(), nil, nil)
	assert.Same(t, wantErr, err)
	_, err = r.FindByAssets(ctx, nil, nil)
	assert.Same(t, wantErr, err)
	got, err := r.CountByModel(ctx, i.Model())
	assert.Equal(t, 0, got)
	assert.Same(t, wantErr, err)
}

// TestItem_MemorySpecific_Copy tests the memory-specific filter returned by
// Copy (a plain map without the Mongo version-metadata query).
func TestItem_MemorySpecific_Copy(t *testing.T) {
	ctx := context.Background()
	r := NewItem()

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

	wantFilter, err := json.Marshal(map[string]any{"schema": params.OldSchema.String()})
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
