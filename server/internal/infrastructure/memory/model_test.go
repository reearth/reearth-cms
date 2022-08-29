package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	// "github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
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

	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}

	modelList := model.List(r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project().Equal(pId)
	})).SortByID()

	pageInfo := usecase.NewPageInfo(
		0,
		lo.ToPtr(usecase.Cursor("")),
		lo.ToPtr(usecase.Cursor("")),
		true,
		true,
	)
	var arg *usecase.Cursor
	resModelList, respageInfo, err := r.FindByProject(ctx, pId, usecase.NewPagination(lo.ToPtr(1), lo.ToPtr(1), arg, arg))

	assert.NoError(t, err)
	assert.Equal(t, modelList, resModelList)
	assert.Equal(t, pageInfo, respageInfo)
}

func TestMemory_CountByProject(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()

	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}

	res, err := r.CountByProject(ctx, pId)

	assert.NoError(t, err)
	assert.Equal(t, res, 0)
}

func TestMemory_FindByKey(t *testing.T) {
	ctx := context.Background()
	pId := id.NewProjectID()
	key := "id"
	r := &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		f:    repo.WorkspaceFilter{},
	}
	m := r.data.Find(func(_ id.ModelID, m *model.Model) bool {
		return m.Key().String() == key && m.Project().Equal(pId)
	})

	res, err := r.FindByKey(ctx, pId, key)

	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Equal(t, m, res)
}