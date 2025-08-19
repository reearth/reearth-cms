package interactor

import (
	"context"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	r := repo.Container{}
	i := NewItem(&r, nil)
	assert.NotNil(t, i)
}

func TestItem_FindByID(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1 := item.New().ID(id1).Schema(sid).Model(id.NewModelID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	id2 := id.NewItemID()
	i2 := item.New().ID(id2).Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
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
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, err := itemUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got.Value())
		})
	}
}

func TestItem_FindByIDs(t *testing.T) {
	sid := id.NewSchemaID()

	tests := []struct {
		name    string
		seeds   item.List
		arg     id.ItemIDList
		want    item.VersionedList
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   item.List{},
			arg:     []id.ItemID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with item for another workspaces",
			seeds: item.List{
				item.New().NewID().Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			arg:     []id.ItemID{},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, i := range tc.seeds {
				err := db.Item.Save(ctx, i)
				assert.NoError(t, err)
			}
			itemUC := NewItem(db, nil)

			got, err := itemUC.FindByIDs(ctx, tc.arg, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
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
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1}).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	i1 := item.New().NewID().
		Schema(s1.ID()).
		Model(id.NewModelID()).
		Project(pid).
		Fields([]*item.Field{
			item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil),
		}).
		Thread(id.NewThreadID().Ref()).
		MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second).UTC())
	i2 := item.New().NewID().
		Schema(s1.ID()).
		Model(id.NewModelID()).
		Project(pid).
		Fields([]*item.Field{
			item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil),
		}).
		Thread(id.NewThreadID().Ref()).
		MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second * 2).UTC())
	i3 := item.New().NewID().
		Schema(s2.ID()).
		Model(id.NewModelID()).
		Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
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
					AcOperator: &accountusecase.Operator{
						User: &uid,
					},
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
					AcOperator: &accountusecase.Operator{
						User: &uid,
					},
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    0,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

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

			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, _, err := itemUC.FindBySchema(ctx, tc.args.schema, nil, tc.args.pagination, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1 := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Model(id.NewModelID()).Thread(id.NewThreadID().Ref()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		}}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	// first version
	res, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(res[0].Version(), nil, version.NewRefs(version.Latest), now, i1),
	}, res)

	// second version
	err = db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	res, err = itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(res[0].Version(), nil, nil, now, i1),
		version.NewValue(res[1].Version(), version.NewVersions(res[0].Version()), version.NewRefs(version.Latest), now, i1),
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

func TestItem_Search(t *testing.T) {
	mid := id.NewModelID()
	sid1 := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	f1 := item.NewField(sf1, value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeText.Value("hoge").AsMultiple(), nil)
	id1 := id.NewItemID()
	pid := id.NewProjectID()
	i1 := item.New().ID(id1).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f1}).Thread(id.NewThreadID().Ref()).MustBuild()
	id2 := id.NewItemID()
	i2 := item.New().ID(id2).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f1}).Thread(id.NewThreadID().Ref()).MustBuild()
	id3 := id.NewItemID()
	i3 := item.New().ID(id3).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f2}).Thread(id.NewThreadID().Ref()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).Name("foo").MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
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
				query:    item.NewQuery(pid, mid, nil, "foo", nil),
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
				query:    item.NewQuery(pid, mid, nil, "hoge", nil),
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
				query:    item.NewQuery(pid, mid, nil, "xxx", nil),
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
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, _, err := itemUC.Search(ctx, schema.Package{}, tc.args.query, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

		})
	}
}

func TestItem_IsItemReferenced(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	fid1 := id.NewFieldID()
	fid2 := id.NewFieldID()
	cf1 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	sf1 := schema.NewField(schema.NewReference(id.NewModelID(), sid2, fid2.Ref(), cf1).TypeProperty()).ID(fid1).Name("f").Unique(true).Key(id.RandomKey()).MustBuild()
	s1 := schema.New().ID(sid1).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{sf1}).MustBuild()
	m1 := model.New().NewID().Schema(s1.ID()).Key(id.RandomKey()).Project(s1.Project()).MustBuild()
	fs1 := []*item.Field{item.NewField(sf1.ID(), value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)}
	i1 := item.New().NewID().Schema(s1.ID()).Model(m1.ID()).Project(s1.Project()).Thread(id.NewThreadID().Ref()).Fields(fs1).MustBuild()

	cf2 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	sf2 := schema.NewField(schema.NewReference(id.NewModelID(), sid1, fid1.Ref(), cf2).TypeProperty()).ID(fid2).Name("f").Unique(true).Key(id.RandomKey()).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf2}).MustBuild()
	m2 := model.New().NewID().Schema(s2.ID()).Key(id.RandomKey()).Project(s2.Project()).MustBuild()
	fs2 := []*item.Field{item.NewField(sf2.ID(), value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)}
	i2 := item.New().NewID().Schema(s2.ID()).Model(m2.ID()).Project(s2.Project()).Thread(id.NewThreadID().Ref()).Fields(fs2).MustBuild()

	fid3 := id.NewFieldID()
	sf3 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(fid3).Name("f").Unique(true).Key(id.RandomKey()).MustBuild()
	s3 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf3}).MustBuild()
	m3 := model.New().NewID().Schema(s3.ID()).Key(id.RandomKey()).Project(s3.Project()).MustBuild()
	fs3 := []*item.Field{item.NewField(sf3.ID(), value.TypeReference.Value(nil).AsMultiple(), nil)}
	i3 := item.New().NewID().Schema(s3.ID()).Model(m3.ID()).Project(s3.Project()).Thread(id.NewThreadID().Ref()).Fields(fs3).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s1))
	lo.Must0(db.Model.Save(ctx, m1))
	lo.Must0(db.Item.Save(ctx, i1))
	lo.Must0(db.Schema.Save(ctx, s2))
	lo.Must0(db.Model.Save(ctx, m2))
	lo.Must0(db.Item.Save(ctx, i2))
	lo.Must0(db.Schema.Save(ctx, s3))
	lo.Must0(db.Model.Save(ctx, m3))
	lo.Must0(db.Item.Save(ctx, i3))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{s1.Workspace()},
			WritableWorkspaces: []accountdomain.WorkspaceID{s1.Workspace()},
		},
		ReadableProjects: []id.ProjectID{prj.ID()},
		WritableProjects: []id.ProjectID{prj.ID()},
	}

	// reference item
	b, err := itemUC.IsItemReferenced(ctx, i1.ID(), fid2, op)
	assert.True(t, b)
	assert.Nil(t, err)

	// reference item different field
	b, err = itemUC.IsItemReferenced(ctx, i1.ID(), sf3.ID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// not reference item 1
	b, err = itemUC.IsItemReferenced(ctx, i3.ID(), sf3.ID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// not reference item 2
	b, err = itemUC.IsItemReferenced(ctx, i3.ID(), id.NewFieldID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// item not found
	b, err = itemUC.IsItemReferenced(ctx, id.NewItemID(), sf2.ID(), op)
	assert.False(t, b)
	assert.Error(t, err)
}

func TestItem_Create(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	prj := project.New().NewID().RequestRoles(r).MustBuild()
	sf := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("f").Unique(true).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(s.Project()).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
			WritableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
		},
		ReadableProjects: []id.ProjectID{s.Project()},
		WritableProjects: []id.ProjectID{s.Project()},
	}

	// invalid operator
	item, err := itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)
	assert.Nil(t, item)

	// operation denied
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref()},
	})
	assert.Equal(t, interfaces.ErrOperationDenied, err)
	assert.Nil(t, item)

	// ok
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, item)
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err := db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item, it)
	assert.Equal(t, value.TypeText.Value("xxx").AsMultiple(), it.Value().Field(sf.ID()).Value())

	// ok by key
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Key: sf.Key().Ref(),
				// Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx2",
			},
		},
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, item)
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err = db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item, it)
	assert.Equal(t, value.TypeText.Value("xxx2").AsMultiple(), it.Value().Field(sf.ID()).Value())

	// validate fails
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "abcabcabcabc", // too long
			},
		},
	}, op)
	assert.ErrorContains(t, err, "it sholud be shorter than 10")
	assert.Nil(t, item)

	// duplicated
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
	}, op)
	assert.Equal(t, interfaces.ErrDuplicatedItemValue, err)
	assert.Nil(t, item)

	// required
	sf.SetRequired(true)
	s.RemoveField(sf.ID())
	s.AddField(sf)
	lo.Must0(db.Schema.Save(ctx, s))
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "",
			},
		},
	}, op)
	assert.ErrorIs(t, err, schema.ErrValueRequired)
	assert.Nil(t, item)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields:   nil,
	}, op)
	assert.Equal(t, wantErr, err)
	assert.Nil(t, item)
}

func TestItem_Update(t *testing.T) {
	uId := accountdomain.NewUserID().Ref()
	prj := project.New().NewID().MustBuild()
	sf := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("f").Unique(true).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(s.Project()).MustBuild()
	i := item.New().NewID().User(*uId).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().NewID().User(*uId).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().NewID().User(accountdomain.NewUserID()).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID().Ref()).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))
	lo.Must0(db.Item.Save(ctx, i))
	lo.Must0(db.Item.Save(ctx, i2))
	lo.Must0(db.Item.Save(ctx, i3))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: uId,
		},
		ReadableProjects: []id.ProjectID{s.Project()},
		WritableProjects: []id.ProjectID{s.Project()},
	}
	vi, _ := itemUC.FindByID(ctx, i.ID(), op)

	// ok
	item, err := itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err := db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item.Value(), it.Value())
	assert.Equal(t, value.TypeText.Value("xxx").AsMultiple(), it.Value().Field(sf.ID()).Value())

	// invalid operator
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// ok with key
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Key: sf.Key().Ref(),
				// Type:  value.TypeText,
				Value: "yyy",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err = db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item.Value(), it.Value())
	assert.Equal(t, value.TypeText.Value("yyy").AsMultiple(), it.Value().Field(sf.ID()).Value())
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// validate fails
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "abcabcabcabc", // too long
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.ErrorContains(t, err, "it sholud be shorter than 10")
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// update same item is not a duplicate
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())
	vi3, _ := itemUC.FindByID(ctx, i3.ID(), op)

	// update no permission
	_, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i3.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx",
			},
		},
		Version: lo.ToPtr(vi3.Version()),
	}, op)
	assert.Equal(t, interfaces.ErrOperationDenied, err)
	vi2, _ := itemUC.FindByID(ctx, i2.ID(), op)

	// duplicate
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i2.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
		Version: lo.ToPtr(vi2.Version()),
	}, op)
	assert.Equal(t, interfaces.ErrDuplicatedItemValue, err)
	assert.Nil(t, item)

	// no fields
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{},
	}, op)
	assert.Equal(t, interfaces.ErrItemFieldRequired, err)
	assert.Nil(t, item)

	// required
	sf.SetRequired(true)
	s.RemoveField(sf.ID())
	s.AddField(sf)
	lo.Must0(db.Schema.Save(ctx, s))
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.ErrorIs(t, err, schema.ErrValueRequired)
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				// Type:  value.TypeText,
				Value: "a",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.Equal(t, wantErr, err)
	assert.Nil(t, item)
}

func TestItem_Delete(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	id1 := id.NewItemID()
	id2 := id.NewItemID()
	id3 := id.NewItemID()
	id4 := id.NewItemID()
	i1 := item.New().ID(id1).User(u.ID()).Schema(s1.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := item.New().ID(id2).User(u.ID()).Schema(s2.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := item.New().ID(id3).User(u.ID()).Schema(s1.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
		WritableProjects: id.ProjectIDList{i1.Project()},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i2)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s1)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s2)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i3)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true
	err = itemUC.Delete(ctx, id1, op)
	assert.NoError(t, err)

	// invalid operator
	err = itemUC.Delete(ctx, id2, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)

	// operation denied
	err = itemUC.Delete(ctx, id3, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	})
	assert.Equal(t, interfaces.ErrOperationDenied, err)

	// not found
	err = itemUC.Delete(ctx, id4, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	})
	assert.Equal(t, rerror.ErrNotFound, err)

	_, err = itemUC.FindByID(ctx, id1, op)
	assert.Error(t, err)

	// mock item error
	wantErr := rerror.ErrNotFound
	err = itemUC.Delete(ctx, id.NewItemID(), op)
	assert.Equal(t, wantErr, err)
}

func TestWorkFlow(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	wid := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(wid).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).MustBuild()
	m := model.New().NewID().Project(prj.ID()).Schema(s.ID()).RandomKey().MustBuild()
	i := item.New().NewID().Schema(s.ID()).Model(m.ID()).Project(prj.ID()).Thread(id.NewThreadID().Ref()).MustBuild()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()

	ctx := context.Background()
	db := memory.New()
	err := db.Project.Save(ctx, prj)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s)
	assert.NoError(t, err)
	err = db.Model.Save(ctx, m)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i)
	assert.NoError(t, err)

	vi, err := db.Item.FindByID(ctx, i.ID(), nil)
	assert.NoError(t, err)
	ri, _ := request.NewItem(i.ID(), lo.ToPtr(vi.Version().String()))
	req1 := request.New().
		NewID().
		Workspace(wid).
		Project(prj.ID()).
		Reviewers(accountdomain.UserIDList{u.ID()}).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID().Ref()).
		Items(request.ItemList{ri}).
		Title("foo").
		MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:             lo.ToPtr(u.ID()),
			OwningWorkspaces: id.WorkspaceIDList{wid},
		},
	}

	itemUC := NewItem(db, nil)

	status, err := itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusDraft}, status)

	err = db.Request.Save(ctx, req1)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusReview}, status)

	requestUC := NewRequest(db, nil)
	_, err = requestUC.Approve(ctx, req1.ID(), op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusPublic}, status)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: id.WorkspaceIDList{wid},
		},
	})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusDraft}, status)

	// Publish Item
	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: id.WorkspaceIDList{wid},
		},
	})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusPublic}, status)
}

func TestItem_ItemsAsCSV(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}

	// Geometry Object type
	sid1 := id.NewSchemaID()
	fid1 := id.NewFieldID()
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(id.RandomKey()).ID(fid1).MustBuild()
	s1 := schema.New().ID(sid1).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{sf1}).MustBuild()
	sp1 := schema.NewPackage(s1, nil, nil, nil)
	m1 := model.New().NewID().Schema(s1.ID()).Key(id.RandomKey()).Project(s1.Project()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fs1 := []*item.Field{fi1}
	i1 := item.New().ID(id.NewItemID()).Schema(s1.ID()).Model(m1.ID()).Project(s1.Project()).Thread(id.NewThreadID().Ref()).Fields(fs1).MustBuild()
	i1IDStr := i1.ID().String()

	// GeometryEditor type item
	sid2 := id.NewSchemaID()
	fid2 := id.NewFieldID()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(id.RandomKey()).ID(fid2).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf2}).MustBuild()
	m2 := model.New().NewID().Schema(s2.ID()).Key(id.RandomKey()).Project(s2.Project()).MustBuild()
	fi2 := item.NewField(sf2.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[  ],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fs2 := []*item.Field{fi2}
	i2 := item.New().NewID().Schema(s2.ID()).Model(m2.ID()).Project(s2.Project()).Thread(id.NewThreadID().Ref()).Fields(fs2).MustBuild()
	sp2 := schema.NewPackage(s2, nil, nil, nil)

	// integer type item
	fid3 := id.NewFieldID()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf3 := schema.NewField(tp4).NewID().Name("age").Key(id.RandomKey()).ID(fid3).MustBuild()
	s3 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf3}).MustBuild()
	m3 := model.New().NewID().Schema(s3.ID()).Key(id.RandomKey()).Project(s3.Project()).MustBuild()
	fs3 := []*item.Field{item.NewField(sf3.ID(), value.TypeReference.Value(nil).AsMultiple(), nil)}
	i3 := item.New().NewID().Schema(s3.ID()).Model(m3.ID()).Project(s3.Project()).Thread(id.NewThreadID().Ref()).Fields(fs3).MustBuild()
	sp3 := schema.NewPackage(s3, nil, nil, nil)

	page1 := 1
	perPage1 := 10

	wid := accountdomain.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).Name("foo").MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	}

	opUserNil := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}
	ctx := context.Background()

	type args struct {
		ctx           context.Context
		schemaPackage *schema.Package
		page          *int
		perPage       *int
		op            *usecase.Operator
	}
	tests := []struct {
		name        string
		args        args
		seedsItems  item.List
		seedSchemas *schema.Schema
		seedModels  *model.Model
		want        []byte
		wantError   error
	}{
		{
			name: "success",
			args: args{
				ctx:           ctx,
				schemaPackage: sp1,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i1},
			seedSchemas: s1,
			seedModels:  m1,
			want:        []byte("id,location_lat,location_lng\n" + i1IDStr + ",36.58570985749664,139.28179282584915\n"),
			wantError:   nil,
		},
		{
			name: "success geometry editor type",
			args: args{
				ctx:           ctx,
				schemaPackage: sp2,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i2},
			seedSchemas: s2,
			seedModels:  m2,
			want:        []byte("id,location_lat,location_lng\n"),
			wantError:   nil,
		},
		{
			name: "error point type is not supported in any geometry field non geometry field",
			args: args{
				ctx:           ctx,
				schemaPackage: sp3,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i3},
			seedSchemas: s3,
			seedModels:  m3,
			want:        []byte(nil),
			wantError:   pointFieldIsNotSupportedError,
		},
		{
			name: "error operator user is nil",
			args: args{
				ctx:           ctx,
				schemaPackage: sp3,
				page:          &page1,
				perPage:       &perPage1,
				op:            opUserNil,
			},
			want:      []byte(nil),
			wantError: interfaces.ErrInvalidOperator,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			db := memory.New()
			for _, seed := range tt.seedsItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}

			if tt.seedSchemas != nil {
				err := db.Schema.Save(ctx, tt.seedSchemas)
				assert.NoError(t, err)
			}
			if tt.seedModels != nil {
				err := db.Model.Save(ctx, tt.seedModels)
				assert.NoError(t, err)
			}
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			pr, err := itemUC.ItemsAsCSV(ctx, tt.args.schemaPackage, tt.args.page, tt.args.perPage, tt.args.op)

			var result []byte
			if pr.PipeReader != nil {
				result, _ = io.ReadAll(pr.PipeReader)
			}

			assert.Equal(t, tt.want, result)
			assert.Equal(t, tt.wantError, err)
		})
	}
}

func TestItem_ItemsAsGeoJSON(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString}

	sid1 := id.NewSchemaID()
	fid1 := id.NewFieldID()
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(id.RandomKey()).ID(fid1).MustBuild()
	s1 := schema.New().ID(sid1).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{sf1}).MustBuild()
	sp1 := schema.NewPackage(s1, nil, nil, nil)
	m1 := model.New().NewID().Schema(s1.ID()).Key(id.RandomKey()).Project(s1.Project()).MustBuild()
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}").AsMultiple(), nil)
	fs1 := []*item.Field{fi1}
	i1 := item.New().ID(id.NewItemID()).Schema(s1.ID()).Model(m1.ID()).Project(s1.Project()).Thread(id.NewThreadID().Ref()).Fields(fs1).MustBuild()

	v1 := version.New()
	vi1 := version.MustBeValue(v1, nil, version.NewRefs(version.Latest), util.Now(), i1)
	// with geometry fields
	ver1 := item.VersionedList{vi1}

	fc1, _ := featureCollectionFromItems(ver1, sp1)

	sid2 := id.NewSchemaID()
	fid2 := id.NewFieldID()
	sf2 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("geo2").Key(id.RandomKey()).ID(fid2).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf2}).MustBuild()
	sp2 := schema.NewPackage(s2, nil, nil, nil)
	m2 := model.New().NewID().Schema(s2.ID()).Key(id.RandomKey()).Project(s2.Project()).MustBuild()
	fi2 := item.NewField(sf2.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fs2 := []*item.Field{fi2}
	i2 := item.New().NewID().Schema(s2.ID()).Model(m2.ID()).Project(s2.Project()).Thread(id.NewThreadID().Ref()).Fields(fs2).MustBuild()
	v2 := version.New()
	vi2 := version.MustBeValue(v2, nil, version.NewRefs(version.Latest), util.Now(), i2)

	ver2 := item.VersionedList{vi2}
	fc2, _ := featureCollectionFromItems(ver2, sp2)

	fid3 := id.NewFieldID()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf3 := schema.NewField(tp4).NewID().Name("age").Key(id.RandomKey()).ID(fid3).MustBuild()
	s3 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf3}).MustBuild()
	sp3 := schema.NewPackage(s3, nil, nil, nil)
	m3 := model.New().NewID().Schema(s3.ID()).Key(id.RandomKey()).Project(s3.Project()).MustBuild()
	fs3 := []*item.Field{item.NewField(sf3.ID(), value.TypeReference.Value(nil).AsMultiple(), nil)}
	i3 := item.New().NewID().Schema(s3.ID()).Model(m3.ID()).Project(s3.Project()).Thread(id.NewThreadID().Ref()).Fields(fs3).MustBuild()

	page1 := 1
	perPage1 := 10

	wid := accountdomain.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).Name("foo").MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	}

	opUserNil := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	type args struct {
		ctx           context.Context
		schemaPackage *schema.Package
		page          *int
		perPage       *int
		op            *usecase.Operator
	}
	tests := []struct {
		name        string
		args        args
		seedsItems  item.List
		seedSchemas *schema.Schema
		seedModels  *model.Model
		want        *integrationapi.FeatureCollection
		wantError   error
	}{
		{
			name: "success",
			args: args{
				ctx:           context.Background(),
				schemaPackage: sp1,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i1},
			seedSchemas: s1,
			seedModels:  m1,
			want:        fc1,
			wantError:   nil,
		},
		{
			name: "success geometry editor type",
			args: args{
				ctx:           context.Background(),
				schemaPackage: sp2,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i2},
			seedSchemas: s2,
			seedModels:  m2,
			want:        fc2,
			wantError:   nil,
		},
		{
			name: "success operator user is nil",
			args: args{
				ctx:           context.Background(),
				schemaPackage: sp2,
				page:          &page1,
				perPage:       &perPage1,
				op:            opUserNil,
			},
			seedsItems:  item.List{i2},
			seedSchemas: s2,
			seedModels:  m2,
			want:        fc2,
			wantError:   nil,
		},
		{
			name: "error no geometry field in this model / integer",
			args: args{
				ctx:           context.Background(),
				schemaPackage: sp3,
				page:          &page1,
				perPage:       &perPage1,
				op:            op,
			},
			seedsItems:  item.List{i3},
			seedSchemas: s3,
			seedModels:  m3,
			want:        nil,
			wantError:   rerror.NewE(i18n.T("no geometry field in this model")),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()

			db := memory.New()

			for _, seed := range tt.seedsItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}

			if tt.seedSchemas != nil {
				err := db.Schema.Save(ctx, tt.seedSchemas)
				assert.NoError(t, err)
			}
			if tt.seedModels != nil {
				err := db.Model.Save(ctx, tt.seedModels.Clone())
				assert.NoError(t, err)
			}
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true
			result, err := itemUC.ItemsAsGeoJSON(ctx, tt.args.schemaPackage, tt.args.page, tt.args.perPage, tt.args.op)

			assert.Equal(t, tt.want, result.FeatureCollections)
			assert.Equal(t, tt.wantError, err)
		})
	}
}

func TestItem_validateAndConvertFieldValue(t *testing.T) {
	item := &Item{}

	// Helper function to create schema fields
	createSchemaField := func(fieldType value.Type) *schema.Field {
		var typeProperty *schema.TypeProperty
		switch fieldType {
		case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeTag:
			typeProperty = schema.NewText(nil).TypeProperty()
		case value.TypeInteger:
			integer, _ := schema.NewInteger(nil, nil)
			typeProperty = integer.TypeProperty()
		case value.TypeNumber:
			number, _ := schema.NewNumber(nil, nil)
			typeProperty = number.TypeProperty()
		case value.TypeBool, value.TypeCheckbox:
			typeProperty = schema.NewBool().TypeProperty()
		case value.TypeURL:
			typeProperty = schema.NewURL().TypeProperty()
		case value.TypeSelect:
			typeProperty = schema.NewSelect([]string{"option1", "option2"}).TypeProperty()
		case value.TypeGeometryObject:
			typeProperty = schema.NewGeometryObject(nil).TypeProperty()
		case value.TypeGeometryEditor:
			typeProperty = schema.NewGeometryEditor(nil).TypeProperty()
		case value.TypeAsset:
			typeProperty = schema.NewAsset().TypeProperty()
		case value.TypeReference:
			typeProperty = schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()
		}

		return schema.NewField(typeProperty).NewID().Key(id.RandomKey()).MustBuild()
	}

	tests := []struct {
		name      string
		fieldType value.Type
		input     interface{}
		expected  interface{}
		wantErr   bool
	}{
		// Nil value test
		{"nil value", value.TypeText, nil, nil, false},

		// Text field types
		{"text string", value.TypeText, "hello", "hello", false},
		{"text from int", value.TypeText, 123, "123", false},
		{"text from bool", value.TypeText, true, "true", false},
		{"text from float", value.TypeText, 45.67, "45.67", false},
		{"textarea string", value.TypeTextArea, "long text", "long text", false},
		{"richtext string", value.TypeRichText, "<b>rich</b>", "<b>rich</b>", false},
		{"markdown string", value.TypeMarkdown, "# Header", "# Header", false},
		{"tag string", value.TypeTag, "tag1", "tag1", false},

		// Integer field type
		{"integer from int", value.TypeInteger, 42, 42, false},
		{"integer from int64", value.TypeInteger, int64(42), 42, false},
		{"integer from float64", value.TypeInteger, 42.0, 42, false},
		{"integer from float64 truncate", value.TypeInteger, 42.9, 42, false},
		{"integer from string valid", value.TypeInteger, "42", 42, false},
		{"integer from string invalid", value.TypeInteger, "not a number", nil, true},

		// Number field type
		{"number from float64", value.TypeNumber, 42.5, 42.5, false},
		{"number from float32", value.TypeNumber, float32(42.5), 42.5, false},
		{"number from int", value.TypeNumber, 42, 42.0, false},
		{"number from int64", value.TypeNumber, int64(42), 42.0, false},
		{"number from string valid", value.TypeNumber, "42.5", 42.5, false},
		{"number from string invalid", value.TypeNumber, "not a number", nil, true},

		// Boolean field types
		{"bool true", value.TypeBool, true, true, false},
		{"bool false", value.TypeBool, false, false, false},
		{"bool from string true", value.TypeBool, "true", true, false},
		{"bool from string false", value.TypeBool, "false", false, false},
		{"bool from string 1", value.TypeBool, "1", true, false},
		{"bool from string 0", value.TypeBool, "0", false, false},
		{"bool from int non-zero", value.TypeBool, 42, true, false},
		{"bool from int zero", value.TypeBool, 0, false, false},
		{"bool from float64 non-zero", value.TypeBool, 42.0, true, false},
		{"bool from float64 zero", value.TypeBool, 0.0, false, false},
		{"bool from string invalid", value.TypeBool, "maybe", nil, true},
		{"checkbox true", value.TypeCheckbox, true, true, false},
		{"checkbox false", value.TypeCheckbox, false, false, false},

		// URL field type
		{"url valid", value.TypeURL, "https://example.com", "https://example.com", false},
		{"url empty", value.TypeURL, "", "", false},
		{"url relative", value.TypeURL, "not a url", "not a url", false},            // Go's url.Parse is permissive
		{"url with invalid char", value.TypeURL, "ht\ttp://example.com", nil, true}, // Contains invalid character
		{"url non-string", value.TypeURL, 123, nil, true},

		// Select field type
		{"select string", value.TypeSelect, "option1", "option1", false},
		{"select from number", value.TypeSelect, 123, "123", false},
		{"select from boolean", value.TypeSelect, true, "true", false},

		// Geometry field types
		{"geometry valid JSON", value.TypeGeometryObject, `{"coordinates":[139.28179282584915,36.58570985749664],"type":"Point"}`, `{"coordinates":[139.28179282584915,36.58570985749664],"type":"Point"}`, false},
		{"geometry invalid JSON", value.TypeGeometryObject, `{"invalid json"`, nil, true},
		{"geometry non-string", value.TypeGeometryObject, 123, nil, true},
		{"geometry editor valid JSON", value.TypeGeometryEditor, `{"type":"Point","coordinates":[0,0]}`, `{"type":"Point","coordinates":[0,0]}`, false},
		{"geometry editor invalid JSON", value.TypeGeometryEditor, `{"invalid`, nil, true},

		// Asset field type
		{"asset valid string", value.TypeAsset, "asset123", "asset123", false},
		{"asset non-string", value.TypeAsset, 123, nil, true},

		// Reference field type
		{"reference valid string", value.TypeReference, "item123", "item123", false},
		{"reference non-string", value.TypeReference, 123, nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			field := createSchemaField(tt.fieldType)
			result, err := item.validateAndConvertFieldValue(tt.input, field)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestItem_importGeoJSONToItems(t *testing.T) {
	tests := []struct {
		name            string
		geoJSONContent  string
		expectedSuccess int
		expectedFailed  int
		expectError     bool
	}{
		{
			name: "valid FeatureCollection with Point geometry",
			geoJSONContent: `{
				"type": "FeatureCollection",
				"features": [
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [139.28179282584915, 36.58570985749664]
						},
						"properties": {
							"name": "Tokyo Station"
						}
					}
				]
			}`,
			expectedSuccess: 1,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "valid FeatureCollection with multiple features",
			geoJSONContent: `{
				"type": "FeatureCollection",
				"features": [
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [139.28179282584915, 36.58570985749664]
						},
						"properties": {
							"name": "Tokyo Station"
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [139.70133018493652, 35.68947395325154]
						},
						"properties": {
							"name": "Shibuya Station"
						}
					}
				]
			}`,
			expectedSuccess: 2,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "feature without geometry field",
			geoJSONContent: `{
				"type": "FeatureCollection",
				"features": [
					{
						"type": "Feature",
						"properties": {
							"name": "No geometry"
						}
					}
				]
			}`,
			expectedSuccess: 1,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "invalid JSON structure",
			geoJSONContent: `{
				"type": "InvalidType",
				"features": []
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "malformed JSON",
			geoJSONContent: `{
				"type": "FeatureCollection"
				"features": [
			`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "not a FeatureCollection",
			geoJSONContent: `{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [0, 0]
				},
				"properties": {}
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "empty FeatureCollection",
			geoJSONContent: `{
				"type": "FeatureCollection",
				"features": []
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create separate instances for each test to avoid race conditions
			r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
			w := accountdomain.NewWorkspaceID()
			prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

			gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}

			// Create schema with geometry and text fields
			sid := id.NewSchemaID()
			fid1 := id.NewFieldID()
			textField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.RandomKey()).ID(fid1).MustBuild()

			fid2 := id.NewFieldID()
			geometryField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geometry").Key(id.RandomKey()).ID(fid2).MustBuild()

			testSchema := schema.New().ID(sid).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{textField, geometryField}).MustBuild()

			testModel := model.New().NewID().Schema(testSchema.ID()).Key(id.RandomKey()).Project(testSchema.Project()).MustBuild()

			uid := accountdomain.NewUserID()
			op := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					User:               &uid,
					ReadableWorkspaces: []accountdomain.WorkspaceID{w},
					WritableWorkspaces: []accountdomain.WorkspaceID{w},
				},
				ReadableProjects: []id.ProjectID{prj.ID()},
				WritableProjects: []id.ProjectID{prj.ID()},
			}

			// Setup in-memory database
			ctx := context.Background()
			db := memory.New()

			// Save the project, schema, and model
			err := db.Project.Save(ctx, prj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, testSchema)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, testModel)
			assert.NoError(t, err)

			// Create Item instance
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			// Execute the function
			successful, failed, err := itemUC.importGeoJSONToItems(
				ctx,
				[]byte(tt.geoJSONContent),
				testSchema,
				testModel,
				op,
			)

			// Verify results
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedSuccess, successful, "successful count should match")
				assert.Equal(t, tt.expectedFailed, failed, "failed count should match")
			}
		})
	}
}

func TestItem_importGeoJSONToItems_SchemaWithoutGeometry(t *testing.T) {
	// Test with schema that has no geometry fields - follow same pattern
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	// Create schema with only text field (no geometry)
	sid := id.NewSchemaID()
	fid := id.NewFieldID()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.RandomKey()).ID(fid).MustBuild()

	noGeometrySchema := schema.New().ID(sid).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{textField}).MustBuild()

	testModel := model.New().NewID().Schema(noGeometrySchema.ID()).Key(id.RandomKey()).Project(noGeometrySchema.Project()).MustBuild()

	uid := accountdomain.NewUserID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               &uid,
			ReadableWorkspaces: []accountdomain.WorkspaceID{w},
			WritableWorkspaces: []accountdomain.WorkspaceID{w},
		},
		ReadableProjects: []id.ProjectID{prj.ID()},
		WritableProjects: []id.ProjectID{prj.ID()},
	}

	geoJSONContent := `{
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [139.28179282584915, 36.58570985749664]
				},
				"properties": {
					"name": "Tokyo Station"
				}
			}
		]
	}`

	ctx := context.Background()
	db := memory.New()

	// Save the project
	err := db.Project.Save(ctx, prj)
	assert.NoError(t, err)

	err = db.Schema.Save(ctx, noGeometrySchema)
	assert.NoError(t, err)
	err = db.Model.Save(ctx, testModel)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	successful, failed, err := itemUC.importGeoJSONToItems(
		ctx,
		[]byte(geoJSONContent),
		noGeometrySchema,
		testModel,
		op,
	)

	// Should succeed but skip features with geometry
	assert.NoError(t, err)
	assert.Equal(t, 0, successful)
	assert.Equal(t, 1, failed) // Feature was skipped because no geometry field exists
}

func TestItem_importJSONToItems(t *testing.T) {
	tests := []struct {
		name            string
		jsonContent     string
		expectedSuccess int
		expectedFailed  int
		expectError     bool
	}{
		{
			name: "valid JSON with single item",
			jsonContent: `{
				"items": [
					{
						"name": "Test Item",
						"description": "This is a test item"
					}
				]
			}`,
			expectedSuccess: 1,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "valid JSON with multiple items",
			jsonContent: `{
				"items": [
					{
						"name": "Item 1",
						"description": "First item"
					},
					{
						"name": "Item 2", 
						"description": "Second item"
					},
					{
						"name": "Item 3",
						"description": "Third item"
					}
				]
			}`,
			expectedSuccess: 3,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "JSON with items having invalid data types",
			jsonContent: `{
				"items": [
					{
						"name": "Valid Item",
						"description": "This is valid",
						"age": 25
					},
					{
						"name": "Valid Item 2", 
						"description": "This is also valid",
						"age": 30
					}
				]
			}`,
			expectedSuccess: 2,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "invalid JSON structure - missing items array",
			jsonContent: `{
				"data": [
					{"name": "test"}
				]
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "invalid JSON structure - items is null",
			jsonContent: `{
				"items": null
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "malformed JSON",
			jsonContent: `{
				"items": [
					{"name": "test"
			`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     true,
		},
		{
			name: "empty items array",
			jsonContent: `{
				"items": []
			}`,
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "JSON with various data types",
			jsonContent: `{
				"items": [
					{
						"name": "Multi-type Item",
						"age": 25,
						"active": true,
						"description": "Item with various data types"
					}
				]
			}`,
			expectedSuccess: 1,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name: "JSON with mixed valid and invalid items",
			jsonContent: `{
				"items": [
					{
						"name": "Valid Item",
						"description": "This is valid"
					},
					{
						"description": "Item without required name field"
					}
				]
			}`,
			expectedSuccess: 1,
			expectedFailed:  1,
			expectError:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create separate instances for each test to avoid race conditions
			r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
			w := accountdomain.NewWorkspaceID()
			prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

			// Create schema with multiple field types for comprehensive testing
			sid := id.NewSchemaID()

			// Name field (text) - make it required for some test cases
			fid1 := id.NewFieldID()
			nameField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.RandomKey()).ID(fid1).MustBuild()

			// For mixed valid/invalid test, make name field required
			if tt.name == "JSON with mixed valid and invalid items" {
				nameField = schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.RandomKey()).ID(fid1).Required(true).MustBuild()
			}

			// Description field (textarea)
			fid2 := id.NewFieldID()
			descriptionField := schema.NewField(schema.NewTextArea(nil).TypeProperty()).NewID().Name("description").Key(id.RandomKey()).ID(fid2).MustBuild()

			// Age field (integer)
			fid3 := id.NewFieldID()
			ageInteger, _ := schema.NewInteger(nil, nil)
			ageField := schema.NewField(ageInteger.TypeProperty()).NewID().Name("age").Key(id.RandomKey()).ID(fid3).MustBuild()

			// Active field (boolean)
			fid4 := id.NewFieldID()
			activeField := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("active").Key(id.RandomKey()).ID(fid4).MustBuild()

			testSchema := schema.New().ID(sid).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{nameField, descriptionField, ageField, activeField}).MustBuild()

			testModel := model.New().NewID().Schema(testSchema.ID()).Key(id.RandomKey()).Project(testSchema.Project()).MustBuild()

			uid := accountdomain.NewUserID()
			op := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					User:               &uid,
					ReadableWorkspaces: []accountdomain.WorkspaceID{w},
					WritableWorkspaces: []accountdomain.WorkspaceID{w},
				},
				ReadableProjects: []id.ProjectID{prj.ID()},
				WritableProjects: []id.ProjectID{prj.ID()},
			}

			// Setup in-memory database
			ctx := context.Background()
			db := memory.New()

			// Save the project, schema, and model
			err := db.Project.Save(ctx, prj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, testSchema)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, testModel)
			assert.NoError(t, err)

			// Create Item instance
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			// Execute the function
			successful, failed, err := itemUC.importJSONToItems(
				ctx,
				[]byte(tt.jsonContent),
				testSchema,
				testModel,
				op,
			)

			// Verify results
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedSuccess, successful, "successful count should match")
				assert.Equal(t, tt.expectedFailed, failed, "failed count should match")
			}
		})
	}
}

// mockFile implements the File interface for testing
type mockFile struct {
	content []byte
	err     error
}

func (m *mockFile) Read(p []byte) (int, error) {
	if m.err != nil {
		return 0, m.err
	}
	if len(m.content) == 0 {
		return 0, io.EOF
	}
	n := copy(p, m.content)
	if n == len(m.content) {
		m.content = nil
		return n, io.EOF
	}
	m.content = m.content[n:]
	return n, nil
}

func TestItem_ImportAssetToItems(t *testing.T) {
	tests := []struct {
		name            string
		fileContent     string
		contentType     string
		expectedSuccess int
		expectedFailed  int
		expectError     bool
	}{
		{
			name:            "Valid JSON import",
			fileContent:     `{"items": [{"name": "Test Item", "age": 25, "active": true}]}`,
			contentType:     "application/json",
			expectedSuccess: 1,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name:            "Empty JSON array",
			fileContent:     `{"items": []}`,
			contentType:     "application/json",
			expectedSuccess: 0,
			expectedFailed:  0,
			expectError:     false,
		},
		{
			name:            "Mixed valid and invalid items",
			fileContent:     `{"items": [{"name": "Valid Item", "age": 25}, {"name": "", "age": "invalid"}]}`,
			contentType:     "application/json",
			expectedSuccess: 1,
			expectedFailed:  1,
			expectError:     false,
		},
		{
			name:        "Unsupported file format",
			fileContent: "This is plain text",
			contentType: "text/plain",
			expectError: true,
		},
		{
			name:        "Invalid JSON structure",
			fileContent: `{"invalid": "structure"}`,
			contentType: "application/json",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var err error
			// Create separate instances to avoid race conditions
			r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
			w := accountdomain.NewWorkspaceID()
			prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

			// Create schema with fields
			sid := id.NewSchemaID()
			fid1 := id.NewFieldID()
			textField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Name("name").Key(id.NewKey("name")).ID(fid1).Required(true).MustBuild()

			fid2 := id.NewFieldID()
			newIntField, _ := schema.NewInteger(nil, nil)
			intField := schema.NewField(newIntField.TypeProperty()).NewID().Name("age").Key(id.NewKey("age")).ID(fid2).MustBuild()

			fid3 := id.NewFieldID()
			boolField := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("active").Key(id.NewKey("active")).ID(fid3).MustBuild()

			testSchema := schema.New().ID(sid).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{textField, intField, boolField}).MustBuild()

			// Create model
			testModel := model.New().NewID().Schema(testSchema.ID()).Key(id.RandomKey()).Project(testSchema.Project()).MustBuild()

			uid := accountdomain.NewUserID()
			op := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					User:               &uid,
					ReadableWorkspaces: []accountdomain.WorkspaceID{w},
					WritableWorkspaces: []accountdomain.WorkspaceID{w},
				},
				ReadableProjects: []id.ProjectID{prj.ID()},
				WritableProjects: []id.ProjectID{prj.ID()},
			}

			// Setup in-memory database
			ctx := context.Background()
			db := memory.New()

			// Save the project, schema, and model
			err = db.Project.Save(ctx, prj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, testSchema)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, testModel)
			assert.NoError(t, err)

			// Create asset and asset file
			assetID := id.NewAssetID()
			testAsset := asset.New().
				ID(assetID).
				Project(prj.ID()).
				FileName("test.json").
				Size(uint64(len(tt.fileContent))).
				UUID("test-uuid").
				CreatedByUser(uid).
				MustBuild()

			testAssetFile := asset.NewFile().
				Name("test.json").
				Size(uint64(len(tt.fileContent))).
				ContentType(tt.contentType).
				Build()

			// Save asset and asset file to database
			err = db.Asset.Save(ctx, testAsset)
			assert.NoError(t, err)
			err = db.AssetFile.Save(ctx, assetID, testAssetFile)
			assert.NoError(t, err)

			// Create mock file gateway
			mockFileGW := &gateway.Container{
				File: &mockFileGateway{
					files: map[string]*mockFile{
						"test-uuid": {
							content: []byte(tt.fileContent),
							err:     nil,
						},
					},
				},
			}

			// Create Item instance with mock gateway
			itemUC := NewItem(db, mockFileGW)
			itemUC.ignoreEvent = true

			// Execute the function
			param := interfaces.ImportAssetToItemsParam{
				AssetID: assetID,
				ModelID: testModel.ID(),
			}

			result, err := itemUC.ImportAssetToItems(ctx, param, op)

			// Verify results
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedSuccess, result.Successful, "successful count should match")
				assert.Equal(t, tt.expectedFailed, result.Failed, "failed count should match")
				assert.Equal(t, tt.expectedSuccess+tt.expectedFailed, result.Total, "total should equal successful + failed")
			}
		})
	}
}

// mockFileGateway implements the File gateway interface for testing
type mockFileGateway struct {
	files map[string]*mockFile
}

func (m *mockFileGateway) ReadAsset(ctx context.Context, uuid string, filename string, opts map[string]string) (io.ReadCloser, map[string]string, error) {
	// Use UUID as the key for our mock
	if file, exists := m.files[uuid]; exists {
		return io.NopCloser(file), nil, nil
	}
	return nil, nil, errors.New("asset not found")
}

func (m *mockFileGateway) GetAssetFiles(ctx context.Context, workspaceID string) ([]gateway.FileEntry, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) UploadAsset(ctx context.Context, file *file.File) (string, int64, error) {
	return "", 0, errors.New("not implemented")
}

func (m *mockFileGateway) Read(ctx context.Context, key string, opts map[string]string) (io.ReadCloser, map[string]string, error) {
	return nil, nil, errors.New("not implemented")
}

func (m *mockFileGateway) Upload(ctx context.Context, file *file.File, key string) (int64, error) {
	return 0, errors.New("not implemented")
}

func (m *mockFileGateway) DeleteAsset(ctx context.Context, workspace string, key string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) DeleteAssets(ctx context.Context, keys []string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) PublishAsset(ctx context.Context, workspace string, key string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) UnpublishAsset(ctx context.Context, workspace string, key string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) GetAccessInfoResolver() asset.AccessInfoResolver {
	return nil
}

func (m *mockFileGateway) GetAccessInfo(asset *asset.Asset) *asset.AccessInfo {
	return nil
}

func (m *mockFileGateway) GetBaseURL() string {
	return ""
}

func (m *mockFileGateway) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) UploadedAsset(ctx context.Context, upload *asset.Upload) (*file.File, error) {
	return nil, errors.New("not implemented")
}
