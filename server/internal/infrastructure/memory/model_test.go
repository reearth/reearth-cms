package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewModel(t *testing.T) {
	expected := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		now:  &util.TimeNow{},
	}
	got := NewModel()
	assert.Equal(t, expected, got)
}

func TestMemory_Filtered(t *testing.T) {
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	expected := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    r.f.Merge(r.f),
		now:  &util.TimeNow{},
	}
	got := r.Filtered(r.f)
	assert.Equal(t, expected, got)
}

func TestMemory_FindByProject(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	mId := id.NewModelID()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).RandomKey().Project(pId).MustBuild())

	expectedModelList := model.List(r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project() == pId
	})).SortByID()
	var startCursor, endCursor *usecasex.Cursor
	expectedPageInfo := usecasex.NewPageInfo(
		1,
		startCursor,
		endCursor,
		true,
		true,
	)

	gotModelList, gotPageInfo, err := r.FindByProject(ctx, pId, usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil))
	assert.NoError(t, err)
	assert.Equal(t, expectedModelList, gotModelList)
	assert.Equal(t, expectedPageInfo, gotPageInfo)

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}

	gotNilModelList, gotNilPageInfo, gotErr := r.FindByProject(ctx, pId, usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil))
	assert.Equal(t, gotErr, err)
	assert.Nil(t, gotNilModelList)
	assert.Nil(t, gotNilPageInfo)
}

func TestMemory_CountByProject(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	got, err := r.CountByProject(ctx, pId)
	assert.NoError(t, err)
	assert.Equal(t, 0, got)
}

func TestMemory_FindByKey(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	key := "id"
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	expected := r.data.Find(func(_ id.ModelID, m *model.Model) bool {
		return m.Key().String() == key && m.Project() == pId
	})
	got, err := r.FindByKey(ctx, pId, key)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Equal(t, expected, got)
}

func TestMemory_FindByID(t *testing.T) {
	ctx := context.Background()
	mId := id.NewModelID()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	expected := r.data.Find(func(k id.ModelID, m *model.Model) bool {
		return k == mId
	})
	got, err := r.FindByID(ctx, mId)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Equal(t, expected, got)
}

func TestMemory_FindByIDs(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	mId := []id.ModelID{}
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	expectedModelList := model.List(r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project() == pId
	})).SortByID()
	got, err := r.FindByIDs(ctx, mId)
	assert.NoError(t, err)
	assert.Equal(t, expectedModelList, got)
}

func TestMemory_Save(t *testing.T) {
	ctx := context.Background()
	m := &model.Model{}
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(id.NewModelID(), m)
	err := r.Save(ctx, m)
	assert.NoError(t, err)
}

func TestMemory_Remove(t *testing.T) {
	ctx := context.Background()
	m := &model.Model{}
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	err := r.Remove(ctx, m.ID())
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}
