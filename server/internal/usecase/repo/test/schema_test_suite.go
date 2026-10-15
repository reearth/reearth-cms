package test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type schemaFactory = func(t *testing.T) repo.Schema

func TestSchemaRepo(t *testing.T, newRepo schemaFactory) {
	t.Run("Filtered", func(t *testing.T) { testSchemaFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testSchemaFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testSchemaFindByIDs(t, newRepo) })
	t.Run("Fields", func(t *testing.T) { testSchemaFields(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testSchemaSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testSchemaSaveAll(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testSchemaRemove(t, newRepo) })
}

func newSchema(wid accountdomain.WorkspaceID) *schema.Builder {
	return schema.New().NewID().Workspace(wid).Project(id.NewProjectID())
}

func newSchemaField(tp *schema.TypeProperty) *schema.FieldBuilder {
	return schema.NewField(tp).NewID().RandomKey().UpdatedAt(util.Now().Truncate(time.Millisecond).UTC())
}

func storedSchemas(t *testing.T, r repo.Schema, ids id.SchemaIDList) schema.List {
	t.Helper()
	var res schema.List
	for _, sid := range ids {
		s, err := r.FindByID(context.Background(), sid)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		require.NoError(t, err)
		res = append(res, s)
	}
	return res
}

func testSchemaFiltered(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1, w2, w3 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s1 := newSchema(w1).MustBuild()
	w2s1 := newSchema(w2).MustBuild()
	w3s1 := newSchema(w3).MustBuild()
	seeds := schema.List{w1s1, w2s1, w3s1}

	tests := []struct {
		name      string
		filter    func(r repo.Schema) repo.Schema
		wantRead  schema.List
		wantWrite accountdomain.WorkspaceIDList // workspaces Save must accept
		wantDeny  accountdomain.WorkspaceIDList // workspaces Save must reject
	}{
		{
			name: "must merge readable workspaces of chained filters",
			filter: func(r repo.Schema) repo.Schema {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, nil))
			},
			wantRead: schema.List{w1s1, w2s1},
			wantDeny: accountdomain.WorkspaceIDList{w1, w2, w3},
		},
		{
			name: "must merge writable workspaces of chained filters",
			filter: func(r repo.Schema) repo.Schema {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w1})).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2}))
			},
			wantRead:  schema.List{w1s1, w2s1},
			wantWrite: accountdomain.WorkspaceIDList{w1, w2},
			wantDeny:  accountdomain.WorkspaceIDList{w3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.Schema) repo.Schema {
				return r.Filtered(repo.WorkspaceFilter{}).Filtered(repo.WorkspaceFilter{})
			},
			wantRead:  seeds,
			wantWrite: accountdomain.WorkspaceIDList{w1, w2, w3},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, seeds))
			r := tc.filter(base)

			assert.Equal(t, tc.wantRead, storedSchemas(t, r, seeds.IDs()))
			for _, w := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newSchema(w).MustBuild()))
			}
			for _, w := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newSchema(w).MustBuild()))
			}

			// filtering must not change the base repository
			assert.Equal(t, seeds, storedSchemas(t, base, seeds.IDs()))
		})
	}
}

func testSchemaFindByID(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	f1 := newSchemaField(schema.NewText(nil).TypeProperty()).MustBuild()
	f2 := newSchemaField(schema.NewBool().TypeProperty()).MustBuild()
	w1s1 := newSchema(w1).Fields(schema.FieldList{f1, f2}).TitleField(f1.ID().Ref()).MustBuild()
	w1s2 := newSchema(w1).MustBuild()
	w2s1 := newSchema(w2).MustBuild()
	seeds := schema.List{w1s1, w1s2, w2s1}

	tests := []struct {
		name    string
		seeds   schema.List
		filter  *repo.WorkspaceFilter
		args    id.SchemaID
		want    *schema.Schema
		wantErr error
	}{
		{
			name:  "must find a schema with fields and a title field",
			seeds: seeds,
			args:  w1s1.ID(),
			want:  w1s1,
		},
		{
			name:  "must find a schema without fields",
			seeds: seeds,
			args:  w1s2.ID(),
			want:  w1s2,
		},
		{
			name:   "must find a schema of a readable workspace",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w2}, nil)),
			args:   w2s1.ID(),
			want:   w2s1,
		},
		{
			name:   "must find a schema of any workspace when only writable workspaces are scoped",
			seeds:  seeds,
			filter: &repo.WorkspaceFilter{Writable: accountdomain.WorkspaceIDList{w2}},
			args:   w1s1.ID(),
			want:   w1s1,
		},
		{
			name:    "must not find an unknown schema",
			seeds:   seeds,
			args:    id.NewSchemaID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any schema in an empty repository",
			args:    w1s1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a schema of an unreadable workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2})),
			args:    w1s1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			// reads are scoped by the readable list alone, even though
			// WorkspaceFilter.CanRead treats writable workspaces as readable
			name:    "must not find a schema of a writable-only workspace",
			seeds:   seeds,
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:    w1s1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testSchemaFindByIDs(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s1 := newSchema(w1).MustBuild()
	w1s2 := newSchema(w1).MustBuild()
	w2s1 := newSchema(w2).MustBuild()
	seeds := schema.List{w1s1, w1s2, w2s1}

	tests := []struct {
		name   string
		seeds  schema.List
		filter *repo.WorkspaceFilter
		args   id.SchemaIDList
		want   schema.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.SchemaIDList{},
		},
		{
			// TODO: should return Err
			name:  "must find schemas across workspaces",
			seeds: seeds,
			args:  id.SchemaIDList{w1s1.ID(), w1s2.ID(), w2s1.ID()},
			want:  schema.List{w1s1, w1s2, w2s1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.SchemaIDList{w2s1.ID(), w1s2.ID(), w1s1.ID()},
			want:  schema.List{w2s1, w1s2, w1s1},
		},
		{
			name:   "must find schemas of readable workspaces",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w1, w2}, nil)),
			args:   id.SchemaIDList{w2s1.ID(), w1s1.ID()},
			want:   schema.List{w2s1, w1s1},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.args)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

// testSchemaFields checks that every field type and property survives a
// save and find round trip.
func testSchemaFields(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	text := func(tp *schema.TypeProperty) *schema.FieldBuilder {
		return newSchemaField(tp).DefaultValue(tp.Type().Value("default").AsMultiple())
	}
	tag := schema.NewTag("tag", schema.TagColorRed)
	number := lo.Must(schema.NewNumber(new(-1.5), new(1.5)))
	integer := lo.Must(schema.NewInteger(new(int64(-1)), new(int64(1))))

	tests := []struct {
		name  string
		field *schema.Field
	}{
		{
			name: "must keep the field metadata",
			field: newSchemaField(schema.NewText(nil).TypeProperty()).Name("name").Description("description").
				Key(id.NewKey("field-key")).Order(3).Unique(true).Multiple(true).Required(true).MustBuild(),
		},
		{
			name:  "must keep a text field",
			field: text(schema.NewText(new(10)).TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a text field with multiple default values",
			field: newSchemaField(schema.NewText(nil).TypeProperty()).Multiple(true).
				DefaultValue(value.NewMultiple(value.TypeText, []any{"a", "b"})).MustBuild(),
		},
		{
			name:  "must keep a text area field",
			field: text(schema.NewTextArea(new(10)).TypeProperty()).MustBuild(),
		},
		{
			name:  "must keep a rich text field",
			field: text(schema.NewRichText(new(10)).TypeProperty()).MustBuild(),
		},
		{
			name:  "must keep a markdown field",
			field: text(schema.NewMarkdown(new(10)).TypeProperty()).MustBuild(),
		},
		{
			name:  "must keep an asset field",
			field: newSchemaField(schema.NewAsset().TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a date time field",
			field: newSchemaField(schema.NewDateTime().TypeProperty()).
				DefaultValue(value.TypeDateTime.Value(time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a bool field",
			field: newSchemaField(schema.NewBool().TypeProperty()).
				DefaultValue(value.TypeBool.Value(true).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a checkbox field",
			field: newSchemaField(schema.NewCheckbox().TypeProperty()).
				DefaultValue(value.TypeCheckbox.Value(true).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a select field",
			field: newSchemaField(schema.NewSelect([]string{"a", "b"}).TypeProperty()).
				DefaultValue(value.TypeSelect.Value("b").AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a tag field",
			field: newSchemaField(lo.Must(schema.NewFieldTag(schema.TagList{tag})).TypeProperty()).
				DefaultValue(value.TypeTag.Value(tag.ID().String()).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a number field",
			field: newSchemaField(number.TypeProperty()).
				DefaultValue(value.TypeNumber.Value(0.5).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep an integer field",
			field: newSchemaField(integer.TypeProperty()).
				DefaultValue(value.TypeInteger.Value(int64(1)).AsMultiple()).MustBuild(),
		},
		{
			name: "must keep a reference field",
			field: newSchemaField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), id.NewFieldID().Ref(), nil).
				TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a reference field without a corresponding field",
			field: newSchemaField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).
				TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a url field",
			field: newSchemaField(schema.NewURL().TypeProperty()).
				DefaultValue(value.TypeURL.Value("https://example.com").AsMultiple()).MustBuild(),
		},
		{
			name:  "must keep a group field",
			field: newSchemaField(schema.NewGroup(id.NewGroupID()).TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a geometry object field",
			field: newSchemaField(schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{
				schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypePolygon,
			}).TypeProperty()).MustBuild(),
		},
		{
			name: "must keep a geometry editor field",
			field: newSchemaField(schema.NewGeometryEditor(schema.GeometryEditorSupportedTypeList{
				schema.GeometryEditorSupportedTypeLineString,
			}).TypeProperty()).MustBuild(),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			s := newSchema(accountdomain.NewWorkspaceID()).Fields(schema.FieldList{tc.field}).MustBuild()
			require.NoError(t, r.Save(ctx, s))

			got, err := r.FindByID(ctx, s.ID())
			assert.NoError(t, err)
			assert.Equal(t, s, got)
		})
	}
}

func testSchemaSave(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1 := accountdomain.NewWorkspaceID()
	f1 := newSchemaField(schema.NewText(nil).TypeProperty()).MustBuild()
	w1s1 := newSchema(w1).MustBuild()
	w1s1Updated := schema.New().ID(w1s1.ID()).Workspace(w1).Project(w1s1.Project()).
		Fields(schema.FieldList{f1}).TitleField(f1.ID().Ref()).MustBuild()

	tests := []struct {
		name    string
		seeds   schema.List
		filter  *repo.WorkspaceFilter
		args    *schema.Schema
		want    *schema.Schema // the stored schema afterwards
		wantErr error
	}{
		{
			name: "must save a new schema",
			args: w1s1,
			want: w1s1,
		},
		{
			name:  "must overwrite an existing schema",
			seeds: schema.List{w1s1},
			args:  w1s1Updated,
			want:  w1s1Updated,
		},
		{
			name:   "must save a schema in a writable workspace",
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   w1s1,
			want:   w1s1,
		},
		{
			name:    "must not save a schema in a readable-only workspace",
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:    w1s1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a schema outside writable workspaces",
			seeds:   schema.List{w1s1},
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()})),
			args:    w1s1Updated,
			want:    w1s1, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Save(ctx, tc.args))

			// the stored state is checked unfiltered
			got, err := base.FindByID(ctx, tc.args.ID())
			assert.Equal(t, tc.want, got)
			if tc.want == nil {
				assert.Equal(t, rerror.ErrNotFound, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func testSchemaSaveAll(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s1 := newSchema(w1).MustBuild()
	w1s2 := newSchema(w1).MustBuild()
	w2s1 := newSchema(w2).MustBuild()
	w1s1Updated := schema.New().ID(w1s1.ID()).Workspace(w1).Project(w1s1.Project()).
		Fields(schema.FieldList{newSchemaField(schema.NewBool().TypeProperty()).MustBuild()}).MustBuild()
	all := id.SchemaIDList{w1s1.ID(), w1s2.ID(), w2s1.ID()}

	tests := []struct {
		name    string
		seeds   schema.List
		filter  *repo.WorkspaceFilter
		args    schema.List
		want    schema.List // the stored schemas afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: schema.List{},
		},
		{
			// TODO: should return Err
			name: "must save schemas across workspaces",
			args: schema.List{w1s1, w1s2, w2s1},
			want: schema.List{w1s1, w1s2, w2s1},
		},
		{
			name: "must skip nil schemas",
			args: schema.List{nil, w1s1, nil},
			want: schema.List{w1s1},
		},
		{
			name:  "must overwrite existing schemas",
			seeds: schema.List{w1s1, w1s2},
			args:  schema.List{w1s1Updated},
			want:  schema.List{w1s1Updated, w1s2},
		},
		{
			name:   "must save schemas in a writable workspace",
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   schema.List{w1s1, w1s2},
			want:   schema.List{w1s1, w1s2},
		},
		{
			name:    "must save nothing when any schema is outside writable workspaces",
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:    schema.List{w1s1, w2s1},
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.SaveAll(ctx, tc.args))

			// the stored state is checked unfiltered
			assert.Equal(t, tc.want, storedSchemas(t, base, all))
		})
	}
}

func testSchemaRemove(t *testing.T, newRepo schemaFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s1 := newSchema(w1).MustBuild()
	w1s2 := newSchema(w1).MustBuild()
	w2s1 := newSchema(w2).MustBuild()
	seeds := schema.List{w1s1, w1s2, w2s1}

	tests := []struct {
		name    string
		seeds   schema.List
		filter  *repo.WorkspaceFilter
		args    id.SchemaID
		want    schema.List // schemas that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove a schema",
			seeds: seeds,
			args:  w1s1.ID(),
			want:  schema.List{w1s2, w2s1},
		},
		{
			name:    "must not remove an unknown schema",
			seeds:   seeds,
			args:    id.NewSchemaID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    w1s1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove a schema in a writable workspace",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w2})),
			args:   w2s1.ID(),
			want:   schema.List{w1s1, w1s2},
		},
		{
			// TODO: should return ErrOperationDenied instead of ErrNotFound
			name:    "must not remove a schema in a readable-only workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w2})),
			args:    w1s1.ID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Remove(ctx, tc.args))

			// remaining schemas are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			assert.Equal(t, tc.want, storedSchemas(t, base, seeds.IDs()))
		})
	}
}
