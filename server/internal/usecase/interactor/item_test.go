package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
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
	i1, _ := item.New().ID(id1).Schema(sid).Model(id.NewModelID()).Model(id.NewModelID()).Project(id.NewProjectID()).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Build()

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
	v1 := true
	sf1 := schema.NewFieldBool(&v1).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1}).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	i1 := item.New().NewID().Schema(s1.ID()).Model(id.NewModelID()).Project(pid).Fields([]*item.Field{item.NewField(sf1.ID(), schema.TypeBool, "true")}).MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second).UTC())
	i2 := item.New().NewID().Schema(s1.ID()).Model(id.NewModelID()).Project(pid).Fields([]*item.Field{item.NewField(sf1.ID(), schema.TypeBool, "true")}).MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second * 2).UTC())
	i3 := item.New().NewID().Schema(s2.ID()).Model(id.NewModelID()).Project(pid).MustBuild()
	restore()

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
		want        int
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
			want:    2,
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
			want:    0,
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
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestItem_Create(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	wid := id.NewWorkspaceID()
	sf1 := schema.NewFieldBool(lo.ToPtr(true)).NewID().Key(key.Random()).MustBuild()
	sf2 := schema.NewFieldText(lo.ToPtr("x"), lo.ToPtr(10)).NewID().Key(key.Random()).MustBuild()
	s := schema.New().ID(sid).Workspace(wid).Project(pid).Fields(schema.FieldList{sf1, sf2}).MustBuild()

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
		Fields: []interfaces.ItemFieldParam{
			{
				SchemaFieldID: sf1.ID(),
				ValueType:     schema.TypeBool,
				Value:         false,
			},
			{
				SchemaFieldID: sf2.ID(),
				ValueType:     schema.TypeText,
				Value:         "xxx",
			},
		},
		ModelID: id.NewModelID(),
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
		ModelID:  id.NewModelID(),
		Fields:   nil,
	}, op)
	assert.Nil(t, item2)
	assert.Equal(t, wantErr, err)
}

func TestItem_Delete(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1, _ := item.New().ID(id1).Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Build()

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
	i1, _ := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Model(id.NewModelID()).Build()

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
	pid := id.NewProjectID()
	wid := id.NewWorkspaceID()
	mid := id.NewModelID()
	sf1 := schema.NewFieldBool(lo.ToPtr(true)).NewID().Key(key.Random()).MustBuild()
	sf2 := schema.NewFieldText(lo.ToPtr("x"), lo.ToPtr(10)).NewID().Key(key.Random()).MustBuild()
	s := schema.New().ID(sid).Workspace(wid).Project(pid).Fields(schema.FieldList{sf1, sf2}).MustBuild()
	f1 := item.NewField(sf1.ID(), schema.TypeBool, true)
	f2 := item.NewField(sf2.ID(), schema.TypeText, "xxx")
	i1 := item.New().ID(id1).Project(id.NewProjectID()).Model(mid).Schema(sid).Fields([]*item.Field{}).MustBuild()

	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User:             u.ID(),
		ReadableProjects: []id.ProjectID{i1.Project()},
		WritableProjects: []id.ProjectID{i1.Project()},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Schema.Save(ctx, s)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i1)
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
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	i1, _ := item.New().NewID().Project(sid1).Schema(id.NewSchemaID()).Model(id.NewModelID()).Build()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second).UTC())
	i2, _ := item.New().NewID().Project(sid1).Schema(id.NewSchemaID()).Model(id.NewModelID()).Build()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second * 2).UTC())
	i3, _ := item.New().NewID().Project(sid2).Schema(id.NewSchemaID()).Model(id.NewModelID()).Build()
	restore()

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

func TestItem_Search(t *testing.T) {
	sid1 := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	f1 := item.NewField(sf1, schema.TypeText, "foo")
	f2 := item.NewField(sf2, schema.TypeText, "hoge")
	id1 := id.NewItemID()
	pid := id.NewProjectID()
	i1, _ := item.New().ID(id1).Schema(sid1).Model(id.NewModelID()).Project(pid).Fields([]*item.Field{f1}).Build()
	id2 := id.NewItemID()
	i2, _ := item.New().ID(id2).Schema(sid1).Model(id.NewModelID()).Project(pid).Fields([]*item.Field{f1}).Build()
	id3 := id.NewItemID()
	i3, _ := item.New().ID(id3).Schema(sid1).Model(id.NewModelID()).Project(pid).Fields([]*item.Field{f2}).Build()

	wid := id.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).Name("foo").MustBuild()
	op := &usecase.Operator{
		User: u.ID(),
	}

	tests := []struct {
		name  string
		seeds struct {
			items item.List
		}
		args struct {
			query    *item.Query
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
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(id.NewWorkspaceID(), pid, "foo"),
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
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(id.NewWorkspaceID(), pid, "hoge"),
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
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(id.NewWorkspaceID(), pid, "xxx"),
				operator: op,
			},
			want:    0,
			wantErr: nil,
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
			for _, seed := range tc.seeds.items {
				err := db.Item.Save(ctx, seed)
				assert.Nil(t, err)
			}
			itemUC := NewItem(db)

			got, _, err := itemUC.Search(ctx, tc.args.query, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

		})
	}
}

func Test_validateFields(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	wid := id.NewWorkspaceID()
	sfInt := schema.NewFieldInteger(lo.ToPtr(6), lo.ToPtr(5), lo.ToPtr(10)).NewID().Key(key.Random()).MustBuild()
	sfText := schema.NewFieldText(lo.ToPtr("x"), lo.ToPtr(5)).NewID().Key(key.Random()).MustBuild()
	sfTextArea := schema.NewFieldTextArea(lo.ToPtr("x"), lo.ToPtr(10)).NewID().Key(key.Random()).MustBuild()
	sfRichText := schema.NewFieldRichText(lo.ToPtr("x"), lo.ToPtr(10)).NewID().Key(key.Random()).MustBuild()
	sfMarkdown := schema.NewFieldMarkdown(lo.ToPtr("x"), lo.ToPtr(20)).NewID().Key(key.Random()).MustBuild()
	sfURL := schema.NewFieldURL(lo.ToPtr("http://xxx.aa")).NewID().Key(key.Random()).MustBuild()
	s := schema.New().
		ID(sid).
		Workspace(wid).
		Project(pid).
		Fields(schema.FieldList{sfInt, sfText, sfTextArea, sfMarkdown, sfRichText, sfURL}).
		MustBuild()
	type args struct {
		itemFields []interfaces.ItemFieldParam
		s          *schema.Schema
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "all pass",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfInt.ID(),
						ValueType:     schema.TypeInteger,
						Value:         9,
					},
					{
						SchemaFieldID: sfText.ID(),
						ValueType:     schema.TypeText,
						Value:         "foo",
					},
					{
						SchemaFieldID: sfTextArea.ID(),
						ValueType:     schema.TypeTextArea,
						Value:         "foo hoge",
					},
					{
						SchemaFieldID: sfMarkdown.ID(),
						ValueType:     schema.TypeMarkdown,
						Value:         "<h1>foo</h1>",
					},
					{
						SchemaFieldID: sfRichText.ID(),
						ValueType:     schema.TypeRichText,
						Value:         "hoge",
					},
					{
						SchemaFieldID: sfURL.ID(),
						ValueType:     schema.TypeURL,
						Value:         "https://example.com",
					},
				},
				s: s,
			},
			wantErr: false,
		},
		{
			name: "Integer fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfInt.ID(),
						ValueType:     schema.TypeInteger,
						Value:         14,
					},
				},
				s: s,
			},
			wantErr: true,
		},
		{
			name: "Text fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfText.ID(),
						ValueType:     schema.TypeText,
						Value:         "foofoofoofoo",
					},
				},
				s: s,
			},
			wantErr: true,
		},
		{
			name: "Textarea fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfTextArea.ID(),
						ValueType:     schema.TypeTextArea,
						Value:         "foo foo foo foo foo",
					},
				},
				s: s,
			},
			wantErr: true,
		},
		{
			name: "Markdown fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfMarkdown.ID(),
						ValueType:     schema.TypeMarkdown,
						Value:         `<h1>foo</h1> <h1>foo</h1> <h1>foo</h1> `,
					},
				},
				s: s,
			},
			wantErr: true,
		},
		{
			name: "Richtext fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfRichText.ID(),
						ValueType:     schema.TypeRichText,
						Value:         "hoge hoge hoge hoge hoge hoge ",
					},
				},
				s: s,
			},
			wantErr: true,
		},
		{
			name: "Richtext fail",
			args: args{
				itemFields: []interfaces.ItemFieldParam{
					{
						SchemaFieldID: sfURL.ID(),
						ValueType:     schema.TypeURL,
						Value:         "example.com",
					},
				},
				s: s,
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			err := validateFields(tc.args.itemFields, tc.args.s)
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
