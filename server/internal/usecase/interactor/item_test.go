package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	r := repo.Container{}
	i := NewItem(&r)
	assert.NotNil(t, i)
}

func TestItem_FindByID(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Schema(sid).Project(id.NewProjectID()).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Schema(sid).Project(id.NewProjectID()).Build()

	wid := id.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	tests := []struct {
		name  string
		seeds item.List
		args  struct {
			id       id.ItemID
			operator *usecase.Operator
		}
		want        *item.Item
		mockItemErr bool
		wantErr     error
	}{
		{
			name:  "find 1 of 2",
			seeds: item.List{i1, i2},
			args: struct {
				id       id.ItemID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    i1,
			wantErr: nil,
		},
		{
			name:  "find 1 of 0",
			seeds: item.List{},
			args: struct {
				id       id.ItemID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Item.Save(ctx, p)
				assert.NoError(t, err)
			}
			itemUC := NewItem(db)

			got, err := itemUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestItem_FindBySchema(t *testing.T) {
	uid := id.NewUserID()
	wid := id.NewWorkspaceID()
	pid := id.NewProjectID()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	i1 := item.New().NewID().Schema(s1.ID()).Project(pid).MustBuild()
	i2 := item.New().NewID().Schema(s1.ID()).Project(pid).MustBuild()
	i3 := item.New().NewID().Schema(s2.ID()).Project(pid).MustBuild()

	type args struct {
		schema     id.SchemaID
		operator   *usecase.Operator
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedSchema  *schema.Schema
		args        args
		want        item.List
		wantErr     error
		mockItemErr bool
	}{
		{
			name:       "find 2 of 3",
			seedItems:  item.List{i1, i2, i3},
			seedSchema: s1,
			args: args{
				schema: s1.ID(),
				operator: &usecase.Operator{
					User:             uid,
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    item.List{i1, i2},
			wantErr: nil,
		},
		{
			name:       "items not found",
			seedItems:  item.List{},
			seedSchema: s1,
			args: args{
				schema: s1.ID(),
				operator: &usecase.Operator{
					User:             uid,
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:       "schema not found",
			seedItems:  item.List{i1, i2, i3},
			seedSchema: s2,
			args: args{
				schema: s1.ID(),
				operator: &usecase.Operator{
					User:             uid,
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			//t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}

			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}
			if tc.seedSchema != nil {
				err := db.Schema.Save(ctx, tc.seedSchema)
				assert.NoError(t, err)
			}

			itemUC := NewItem(db)

			got, _, err := itemUC.FindBySchema(ctx, tc.args.schema, tc.args.pagination, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestItem_Create(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	wid := id.NewWorkspaceID()
	s := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User:             u.ID(),
		ReadableProjects: []id.ProjectID{pid},
		WritableProjects: []id.ProjectID{pid},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Schema.Save(ctx, s)
	assert.NoError(t, err)

	itemUC := NewItem(db)
	item, err := itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: sid,
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, item)

	_, err = itemUC.FindByID(ctx, item.ID(), op)
	assert.NoError(t, err)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item2, err := itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: sid,
		Fields:   nil,
	}, op)
	assert.Nil(t, item2)
	assert.Equal(t, wantErr, err)
}

func TestItem_Delete(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Schema(sid).Project(id.NewProjectID()).Build()

	wid := id.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	itemUC := NewItem(db)
	err = itemUC.Delete(ctx, id1, op)
	assert.NoError(t, err)

	_, err = itemUC.FindByID(ctx, id1, op)
	assert.Error(t, err)

	// mock item error
	wantErr := rerror.ErrNotFound
	err = itemUC.Delete(ctx, id.NewItemID(), op)
	assert.Equal(t, wantErr, err)
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Build()

	wid := id.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	itemUC := NewItem(db)

	// first version
	res, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, []*version.Value[*item.Item]{
		version.NewValue(res[0].Version(), nil, version.NewRefs(version.Latest), i1),
	}, res)

	// second version
	err = db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	res, err = itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, []*version.Value[*item.Item]{
		version.NewValue(res[0].Version(), nil, nil, i1),
		version.NewValue(res[1].Version(), version.NewVersions(res[0].Version()), version.NewRefs(version.Latest), i1),
	}, res)

	// not found
	res, err = itemUC.FindAllVersionsByID(ctx, id.NewItemID(), op)
	assert.NoError(t, err)
	assert.Empty(t, res)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item2, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.Nil(t, item2)
	assert.Equal(t, wantErr, err)
}

func TestItem_Update(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	f1 := item.NewField(id.NewFieldID(), schema.TypeBool, true)
	f2 := item.NewField(id.NewFieldID(), schema.TypeText, "xxx")
	i1, _ := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Fields([]*item.Field{f1}).Build()

	wid := id.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User:             u.ID(),
		ReadableProjects: []id.ProjectID{i1.Project()},
		WritableProjects: []id.ProjectID{i1.Project()},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	itemUC := NewItem(db)
	i, err := itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID:   id1,
		SchemaID: sid,
		Fields: []interfaces.ItemFieldParam{
			{
				SchemaFieldID: f1.SchemaFieldID(),
				ValueType:     f1.ValueType(),
				Value:         f1.Value(),
			},
			{
				SchemaFieldID: f2.SchemaFieldID(),
				ValueType:     f2.ValueType(),
				Value:         f2.Value(),
			},
		},
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i1, i)

	_, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID:   id1,
		SchemaID: sid,
		Fields:   []interfaces.ItemFieldParam{},
	}, op)
	assert.Equal(t, interfaces.ErrItemFieldRequired, err)
}

func TestItem_FindByProject(t *testing.T) {
	sid1 := id.NewProjectID()
	sid2 := id.NewProjectID()
	wid := id.NewWorkspaceID()
	s1 := project.New().ID(sid1).Workspace(wid).MustBuild()
	s2 := project.New().ID(sid2).Workspace(wid).MustBuild()
	i1, _ := item.New().NewID().Project(sid1).Schema(id.NewSchemaID()).Build()
	i2, _ := item.New().NewID().Project(sid1).Schema(id.NewSchemaID()).Build()
	i3, _ := item.New().NewID().Project(sid2).Schema(id.NewSchemaID()).Build()

	u := user.New().NewID().Email("aaa@bbb.com").Name("foo").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	type args struct {
		id         id.ProjectID
		operator   *usecase.Operator
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedProject *project.Project
		args        args
		want        item.List
		mockItemErr bool
		wantErr     error
	}{
		{
			name:        "find 2 of 3",
			seedItems:   item.List{i1, i2, i3},
			seedProject: s1,
			args: args{
				id:       sid1,
				operator: op,
			},
			want:    item.List{i1, i2},
			wantErr: nil,
		},
		{
			name:        "items not found",
			seedItems:   item.List{},
			seedProject: s1,
			args: args{
				id:       sid1,
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:        "project not found",
			seedItems:   item.List{i1, i2, i3},
			seedProject: s2,
			args: args{
				id:       sid1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			//t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}
			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}
			err := db.Project.Save(ctx, tc.seedProject)
			assert.NoError(t, err)
			itemUC := NewItem(db)

			got, _, err := itemUC.FindByProject(ctx, tc.args.id, tc.args.pagination, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
