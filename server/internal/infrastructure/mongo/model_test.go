package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestModel_Filtered(t *testing.T) {
	r := &Model{}
	pid := id.NewProjectID()

	assert.Equal(t, &Model{
		f: repo.ProjectFilter{
			Readable: id.ProjectIDList{pid},
			Writable: nil,
		},
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
	k := id.NewKey("T123456")
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

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewModel(client)
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

func TestModelRepo_FindBySchema(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	sid1 := id.NewSchemaID()
	k := id.NewKey("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()

	tests := []struct {
		name    string
		seeds   model.List
		arg     id.SchemaID
		filter  *repo.ProjectFilter
		want    *model.Model
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   model.List{},
			arg:     id.NewSchemaID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: model.List{
				model.New().NewID().Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     id.NewSchemaID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: model.List{
				m1,
			},
			arg:     sid1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     sid1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     sid1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			arg:     sid1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewModel(client)
			ctx := context.Background()

			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindBySchema(ctx, tc.arg)
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
	k := id.NewKey("T123456")
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
			want:    model.List{},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewModel(client)
			ctx := context.Background()
			err := r.SaveAll(ctx, tc.seeds)
			assert.NoError(t, err)

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
	k := id.NewKey("T123456")
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
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
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
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
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
			args:    args{pid1, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewModel(client)
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a)
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

func TestModelRepo_FindByProjectAndKeyword(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	id2 := id.NewModelID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := id.NewKey("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).Name("m1").UpdatedAt(mocknow).MustBuild()
	m2 := model.New().ID(id2).Project(pid1).Schema(sid2).Key(k).Name("m2").UpdatedAt(mocknow).MustBuild()

	type args struct {
		pId     id.ProjectID
		keyword *string
		sort    *usecasex.Sort
		pInfo   *usecasex.Pagination
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
			args:    args{id.NewProjectID(), nil, nil, nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with model for another projects",
			seeds: model.List{
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{id.NewProjectID(), nil, nil, nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single model",
			seeds: model.List{
				m1,
			},
			args:    args{pid1, nil, &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
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
			args:    args{pid1, nil, &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
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
			args:    args{pid1, nil, &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			want:    model.List{m1, m2},
			wantErr: nil,
		},
		{
			name: "1 count with multi models with keyword",
			seeds: model.List{
				m1,
				m2,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, lo.ToPtr("1"), &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			want:    model.List{m1},
			wantErr: nil,
		},
		{
			name: "1 count with multi models with keyword",
			seeds: model.List{
				m1,
				m2,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, lo.ToPtr("2"), &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			want:    model.List{m2},
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: model.List{
				m1,
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
				model.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild(),
			},
			args:    args{pid1, lo.ToPtr(""), &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
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
			args:    args{pid1, lo.ToPtr(""), &usecasex.Sort{Key: "CREATED_AT"}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewModel(client)
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, _, err := r.FindByProjectAndKeyword(ctx, tc.args.pId, tc.args.keyword, tc.args.sort, tc.args.pInfo)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestSortModels(t *testing.T) {
	tests := []struct {
		name     string
		input    *usecasex.Sort
		expected *usecasex.Sort
	}{
		{
			name:  "nil input",
			input: nil,
			expected: &usecasex.Sort{
				Key:      "order",
				Reverted: true,
			},
		},
		{
			name: "sort by CreatedAt ascending",
			input: &usecasex.Sort{
				Key:      "CREATED_AT",
				Reverted: false,
			},
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: false,
			},
		},
		{
			name: "sort by CreatedAt descending",
			input: &usecasex.Sort{
				Key:      "CREATED_AT",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: true,
			},
		},
		{
			name: "sort by UpdatedAt ascending",
			input: &usecasex.Sort{
				Key:      "UPDATED_AT",
				Reverted: false,
			},
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: false,
			},
		},
		{
			name: "sort by UpdatedAt descending",
			input: &usecasex.Sort{
				Key:      "UPDATED_AT",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: true,
			},
		},
		{
			name: "invalid column",
			input: &usecasex.Sort{
				Key:      "invalid_column",
				Reverted: true,
			},
			expected: &usecasex.Sort{
				Key:      "order",
				Reverted: true,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result := normalize(tc.input)
			assert.Equal(t, tc.expected, result)
		})
	}
}

func TestModel_CountByProject(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	k := id.NewKey("T123456")

	m1 := model.New().NewID().Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()
	m2 := model.New().NewID().Project(pid1).Schema(sid2).Key(k).UpdatedAt(mocknow).MustBuild()
	m3 := model.New().NewID().Project(pid2).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()
	m4 := model.New().NewID().Project(pid3).Schema(sid3).Key(k).UpdatedAt(mocknow).MustBuild()

	tests := []struct {
		name        string
		projectID   id.ProjectID
		seeds       model.List
		filter      repo.ProjectFilter
		expected    int
		expectedErr error
	}{
		{
			name:      "count models for project with 2 models",
			projectID: pid1,
			seeds:     model.List{m1, m2, m3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
			},
			expected: 2,
		},
		{
			name:      "count models for project with 1 model",
			projectID: pid2,
			seeds:     model.List{m1, m2, m3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1, pid2},
				Writable: []id.ProjectID{pid1, pid2},
			},
			expected: 1,
		},
		{
			name:      "count models for project with no models",
			projectID: id.NewProjectID(),
			seeds:     model.List{m1, m2, m3},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1, pid2},
				Writable: []id.ProjectID{pid1, pid2},
			},
			expected: 0,
		},
		{
			name:      "count models with permission filter (no access)",
			projectID: pid1,
			seeds:     model.List{m4},
			filter: repo.ProjectFilter{
				Readable: []id.ProjectID{},
				Writable: []id.ProjectID{},
			},
			expected: 0,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			repo := NewModel(client)

			ctx := context.Background()
			// Clone all models to avoid mutations
			seedModels := make(model.List, len(tc.seeds))
			for i, m := range tc.seeds {
				seedModels[i] = m.Clone()
			}
			err := repo.SaveAll(ctx, seedModels)
			assert.NoError(t, err)

			filteredRepo := repo.Filtered(tc.filter)
			got, err := filteredRepo.CountByProject(ctx, tc.projectID)
			assert.Equal(t, tc.expectedErr, err)
			assert.Equal(t, tc.expected, got)
		})
	}
}
