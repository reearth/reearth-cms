package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
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
	startCursor := lo.ToPtr(usecasex.Cursor(expectedModelList[0].ID().String()))
	endCursor := lo.ToPtr(usecasex.Cursor(expectedModelList[len(expectedModelList)-1].ID().String()))
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
	mId := id.NewModelID()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).RandomKey().Project(pId).MustBuild())

	got, err := r.CountByProject(ctx, pId)
	assert.NoError(t, err)
	assert.Equal(t, 1, got)

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	got, gotErr := r.CountByProject(ctx, pId)
	assert.Equal(t, gotErr, err)
	assert.Equal(t, 0, got)
}

func TestMemory_FindByKey(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	mId := id.NewModelID()
	key := key.Random()

	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).Key(key).Project(pId).MustBuild())
	expected := r.data.Find(func(_ id.ModelID, m *model.Model) bool {
		return m.Key().String() == key.String() && m.Project() == pId
	})
	got, err := r.FindByKey(ctx, pId, key.String())
	assert.Nil(t, err)
	assert.Equal(t, expected, got)

	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	got, gotErr := r.FindByKey(ctx, pId, key.String())
	assert.Equal(t, gotErr, rerror.ErrNotFound)
	assert.Nil(t, got)

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	got, gotErr = r.FindByKey(ctx, pId, key.String())
	assert.Nil(t, got)
	assert.Equal(t, gotErr, errors.New("test"))
}

func TestMemory_FindByID(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	mId := id.NewModelID()
	key := key.Random()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	got, err := r.FindByID(ctx, mId)
	assert.Nil(t, got)
	assert.ErrorIs(t, err, rerror.ErrNotFound)

	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).Key(key).Project(pId).MustBuild())
	expected := r.data.Find(func(k id.ModelID, m *model.Model) bool {
		return k == mId
	})
	got, err = r.FindByID(ctx, mId)
	assert.Nil(t, err)
	assert.Equal(t, expected, got)

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	got, gotErr := r.FindByID(ctx, mId)
	assert.Equal(t, gotErr, err)
	assert.Nil(t, got)
}

func TestMemory_FindByIDs(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	mId := id.NewModelID()
	key := key.Random()
	mIds := id.ModelIDList{}
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).Key(key).Project(pId).MustBuild())

	expectedModelList := model.List(r.data.FindAll(func(k id.ModelID, m *model.Model) bool {
		return mIds.Has(k)
	})).SortByID()
	got, err := r.FindByIDs(ctx, mIds)
	assert.NoError(t, err)
	assert.Equal(t, expectedModelList, got)

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	got, gotErr := r.FindByIDs(ctx, mIds)
	assert.Equal(t, gotErr, err)
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

	err = errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	gotErr := r.Save(ctx, m)
	assert.Equal(t, gotErr, err)
}

func TestMemory_Remove(t *testing.T) {
	ctx := context.Background()
	m := &model.Model{}
	pId := id.NewProjectID()
	mId := id.NewModelID()
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	r.data.Store(mId, model.New().NewID().Schema(id.NewSchemaID()).RandomKey().Project(pId).MustBuild())
	gotErr := r.Remove(ctx, m.ID())
	assert.ErrorIs(t, gotErr, rerror.ErrNotFound)

	got := r.Remove(ctx, mId)
	assert.Nil(t, got)

	err := errors.New("test")
	r = &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
		err:  err,
	}
	gotErr = r.Remove(ctx, m.ID())
	assert.Equal(t, gotErr, err)
}
