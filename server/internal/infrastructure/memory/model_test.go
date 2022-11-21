package memory

import (
	"context"
	"errors"
	"testing"
	"time"

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

func TestModelRepo_Filtered(t *testing.T) {
	r := &Model{}
	pid := id.NewProjectID()

	assert.Equal(t, &Model{
		f: repo.ProjectFilter{
			Readable: id.ProjectIDList{pid},
			Writable: nil,
		},
		now: &util.TimeNow{},
	}, r.Filtered(repo.ProjectFilter{
		Readable: id.ProjectIDList{pid},
		Writable: nil,
	}))
}

func TestModelRepo_FindByID(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	sid1 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()

	tests := []struct {
		name    string
		seeds   model.List
		arg     id.ModelID
		filter  *repo.ProjectFilter
		want    *model.Model
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   model.List{},
			arg:     id.NewModelID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: model.List{
				model.New().NewID().Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.NewModelID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: model.List{
				m1,
			},
			arg:     id1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewModel()
			defer MockModelNow(r, mocknow)()
			ctx := context.Background()

			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestModelRepo_FindByIDs(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	id2 := id.NewModelID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()
	m2 := model.New().ID(id2).Project(pid1).Schema(sid2).Key(k).UpdatedAt(mocknow).MustBuild()

	tests := []struct {
		name    string
		seeds   model.List
		arg     id.ModelIDList
		filter  *repo.ProjectFilter
		want    model.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   model.List{},
			arg:     id.ModelIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with model for another workspaces",
			seeds: model.List{
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.ModelIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single model",
			seeds: model.List{
				m1,
			},
			arg:     id.ModelIDList{id1},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "1 count with multi models",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.ModelIDList{id1},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "2 count with multi models",
			seeds: model.List{
				m1,
				m2,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.ModelIDList{id1, id2},
			want:    model.List{m1, m2},
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.ModelIDList{id1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.ModelIDList{id1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewModel()
			defer MockModelNow(r, mocknow)()
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestModelRepo_FindByProject(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	id2 := id.NewModelID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()
	m2 := model.New().ID(id2).Project(pid1).Schema(sid2).Key(k).UpdatedAt(mocknow).MustBuild()

	type args struct {
		tid   id.ProjectID
		pInfo *usecasex.Pagination
	}
	tests := []struct {
		name    string
		seeds   model.List
		args    args
		filter  *repo.ProjectFilter
		want    model.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   model.List{},
			args:    args{id.NewProjectID(), nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with model for another projects",
			seeds: model.List{
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{id.NewProjectID(), nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single model",
			seeds: model.List{
				m1,
			},
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "1 count with multi models",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "2 count with multi models",
			seeds: model.List{
				m1,
				m2,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			want:    model.List{m1, m2},
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewModel()
			defer MockModelNow(r, mocknow)()
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, _, err := r.FindByProject(ctx, tc.args.tid, tc.args.pInfo)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}
