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
	"github.com/reearth/reearthx/rerror"
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
				assert.Nil(t, err)
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
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Schema(sid1).Project(id.NewProjectID()).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Schema(sid1).Project(id.NewProjectID()).Build()
	id3 := id.NewItemID()
	i3, _ := item.New().ID(id3).Schema(sid2).Project(id.NewProjectID()).Build()
	wid := id.NewWorkspaceID()
	pid := id.NewProjectID()
	s1 := schema.New().ID(sid1).Workspace(wid).Project(pid).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(wid).Project(pid).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	tests := []struct {
		name  string
		seeds struct {
			items  item.List
			schema *schema.Schema
		}
		args struct {
			id       id.SchemaID
			operator *usecase.Operator
		}
		want        int
		mockItemErr bool
		wantErr     error
	}{
		{
			name: "find 2 of 3",
			seeds: struct {
				items  item.List
				schema *schema.Schema
			}{
				items:  item.List{i1, i2, i3},
				schema: s1,
			},
			args: struct {
				id       id.SchemaID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    2,
			wantErr: nil,
		},
		{
			name: "find 1 of 3",
			seeds: struct {
				items  item.List
				schema *schema.Schema
			}{
				items:  item.List{i1, i2, i3},
				schema: s2,
			},
			args: struct {
				id       id.SchemaID
				operator *usecase.Operator
			}{
				id:       sid2,
				operator: op,
			},
			want:    1,
			wantErr: nil,
		},
		{
			name: "items not found",
			seeds: struct {
				items  item.List
				schema *schema.Schema
			}{
				items:  item.List{},
				schema: s1,
			},
			args: struct {
				id       id.SchemaID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    0,
			wantErr: nil,
		},
		{
			name: "schema not found",
			seeds: struct {
				items  item.List
				schema *schema.Schema
			}{
				items:  item.List{i1, i2, i3},
				schema: s2,
			},
			args: struct {
				id       id.SchemaID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    0,
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
			for _, seed := range tc.seeds.items {
				err := db.Item.Save(ctx, seed)
				assert.Nil(t, err)
			}
			err := db.Schema.Save(ctx, tc.seeds.schema)
			assert.Nil(t, err)
			itemUC := NewItem(db)

			got, _, err := itemUC.FindBySchema(ctx, tc.args.id, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

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
		User: u.ID(),
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Schema.Save(ctx, s)
	assert.Nil(t, err)

	itemUC := NewItem(db)
	item, err := itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: sid,
	}, op)

	assert.Nil(t, err)
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
	assert.Nil(t, err)

	itemUC := NewItem(db)
	err = itemUC.Delete(ctx, id1, op)
	assert.Nil(t, err)

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
	assert.Nil(t, err)

	itemUC := NewItem(db)

	// first version
	vl, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(vl))

	// second version
	err = db.Item.Save(ctx, i1)
	assert.Nil(t, err)
	vl, err = itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.Nil(t, err)
	assert.Equal(t, 2, len(vl))

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item2, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.Nil(t, item2)
	assert.Equal(t, wantErr, err)
}

func TestItem_UpdateItem(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	f1 := item.NewField(id.NewFieldID(), schema.TypeBool, true)
	f2 := item.NewField(id.NewFieldID(), schema.TypeText, "xxx")
	i1, _ := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Fields([]*item.Field{f1}).Build()

	wid := id.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.Nil(t, err)

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
	assert.Nil(t, err)
	assert.Equal(t, []*item.Field{f1, f2}, i.Fields())

	// mock item error
	wantErr := rerror.ErrNotFound
	_, err = itemUC.Update(ctx, interfaces.UpdateItemParam{}, op)
	assert.Equal(t, wantErr, err)
}

func TestItem_FindByProject(t *testing.T) {
	sid1 := id.NewProjectID()
	sid2 := id.NewProjectID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Project(sid1).Schema(id.NewSchemaID()).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Project(sid1).Schema(id.NewSchemaID()).Build()
	id3 := id.NewItemID()
	i3, _ := item.New().ID(id3).Project(sid2).Schema(id.NewSchemaID()).Build()
	wid := id.NewWorkspaceID()
	s1 := project.New().ID(sid1).Workspace(wid).MustBuild()
	s2 := project.New().ID(sid2).Workspace(wid).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Name("foo").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	tests := []struct {
		name  string
		seeds struct {
			items   item.List
			project *project.Project
		}
		args struct {
			id       id.ProjectID
			operator *usecase.Operator
		}
		want        int
		mockItemErr bool
		wantErr     error
	}{
		{
			name: "find 2 of 3",
			seeds: struct {
				items   item.List
				project *project.Project
			}{
				items:   item.List{i1, i2, i3},
				project: s1,
			},
			args: struct {
				id       id.ProjectID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    2,
			wantErr: nil,
		},
		{
			name: "find 1 of 3",
			seeds: struct {
				items   item.List
				project *project.Project
			}{
				items:   item.List{i1, i2, i3},
				project: s2,
			},
			args: struct {
				id       id.ProjectID
				operator *usecase.Operator
			}{
				id:       sid2,
				operator: op,
			},
			want:    1,
			wantErr: nil,
		},
		{
			name: "items not found",
			seeds: struct {
				items   item.List
				project *project.Project
			}{
				items:   item.List{},
				project: s1,
			},
			args: struct {
				id       id.ProjectID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    0,
			wantErr: nil,
		},
		{
			name: "project not found",
			seeds: struct {
				items   item.List
				project *project.Project
			}{
				items:   item.List{i1, i2, i3},
				project: s2,
			},
			args: struct {
				id       id.ProjectID
				operator *usecase.Operator
			}{
				id:       sid1,
				operator: op,
			},
			want:    0,
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
			for _, seed := range tc.seeds.items {
				err := db.Item.Save(ctx, seed)
				assert.Nil(t, err)
			}
			err := db.Project.Save(ctx, tc.seeds.project)
			assert.Nil(t, err)
			itemUC := NewItem(db)

			got, _, err := itemUC.FindByProject(ctx, tc.args.id, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

		})
	}
}

func TestItem_FindByFieldValue(t *testing.T) {
	sid1 := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	f1 := item.NewField(sf1, schema.TypeText, "foo")
	f2 := item.NewField(sf2, schema.TypeText, "hoge")
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Schema(sid1).Fields([]*item.Field{f1}).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Schema(sid1).Fields([]*item.Field{f1}).Build()
	id3 := id.NewItemID()
	i3, _ := item.New().ID(id3).Schema(sid1).Fields([]*item.Field{f2}).Build()

	wid := id.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	tests := []struct {
		name  string
		seeds struct {
			items item.List
		}
		args struct {
			find     string
			operator *usecase.Operator
		}
		want        int
		mockItemErr bool
		wantErr     error
	}{
		{
			name: "find 2 of 3",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				find     string
				operator *usecase.Operator
			}{
				find:     "foo",
				operator: op,
			},
			want:    2,
			wantErr: nil,
		},
		{
			name: "find 1 of 3",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				find     string
				operator *usecase.Operator
			}{
				find:     "hoge",
				operator: op,
			},
			want:    1,
			wantErr: nil,
		},
		{
			name: "items not found",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				find     string
				operator *usecase.Operator
			}{
				find:     "xxx",
				operator: op,
			},
			want:    0,
			wantErr: nil,
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
			for _, seed := range tc.seeds.items {
				err := db.Item.Save(ctx, seed)
				assert.Nil(t, err)
			}
			itemUC := NewItem(db)

			got, _, err := itemUC.FindByFieldValue(ctx, tc.args.find, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

		})
	}
}
