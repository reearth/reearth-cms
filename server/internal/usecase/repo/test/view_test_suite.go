package test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type viewFactory = func(t *testing.T) repo.View

func TestViewRepo(t *testing.T, newRepo viewFactory) {
	t.Run("Filtered", func(t *testing.T) { testViewFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testViewFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testViewFindByIDs(t, newRepo) })
	t.Run("FindByModel", func(t *testing.T) { testViewFindByModel(t, newRepo) })
	t.Run("Fields", func(t *testing.T) { testViewFields(t, newRepo) })
	t.Run("Conditions", func(t *testing.T) { testViewConditions(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testViewIsolation(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testViewSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testViewSaveAll(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testViewRemove(t, newRepo) })
	t.Run("RemoveByModel", func(t *testing.T) { testViewRemoveByModel(t, newRepo) })
}

func newView(pid id.ProjectID, mid id.ModelID) *view.Buildr {
	return view.New().NewID().Project(pid).Model(mid).Schema(id.NewSchemaID()).
		User(accountdomain.NewUserID()).Columns(&view.ColumnList{}).
		UpdatedAt(util.Now().Truncate(time.Millisecond).UTC())
}

func viewIDs(l view.List) id.ViewIDList {
	return lo.Map(l, func(v *view.View, _ int) id.ViewID { return v.ID() })
}

func storedViews(t *testing.T, r repo.View, ids id.ViewIDList) view.List {
	t.Helper()
	var res view.List
	for _, vid := range ids {
		v, err := r.FindByID(context.Background(), vid)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		require.NoError(t, err)
		res = append(res, v)
	}
	return res
}

func viewSelector(t view.FieldType) view.FieldSelector {
	return view.FieldSelector{Type: t, ID: new(id.NewFieldID())}
}

// TODO: the conditions here are built without ConditionType, because mongo
// drops it on save (mongodoc.FilterDocument.Model never sets it). The
// adapters always set it, and Condition.FieldsByType and the item search
// depend on it, so it must survive a round trip.
func viewBasicCondition(value any) view.Condition {
	return view.Condition{BasicCondition: &view.BasicCondition{
		Field: viewSelector(view.FieldTypeField), Op: view.BasicOperatorEquals, Value: value,
	}}
}

func viewStringCondition() view.Condition {
	return view.Condition{StringCondition: &view.StringCondition{
		Field: viewSelector(view.FieldTypeField), Op: view.StringOperatorContains, Value: "文字列",
	}}
}

func viewNumberCondition() view.Condition {
	return view.Condition{NumberCondition: &view.NumberCondition{
		Field: viewSelector(view.FieldTypeMetaField), Op: view.NumberOperatorGreaterThan, Value: 1.5,
	}}
}

func testViewFiltered(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2, p3 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	seeds := view.List{newView(p1, id.NewModelID()).MustBuild(), newView(p2, id.NewModelID()).MustBuild()}

	tests := []struct {
		name      string
		filter    func(r repo.View) repo.View
		wantWrite id.ProjectIDList // projects SaveAll must accept
		wantDeny  id.ProjectIDList // projects SaveAll must reject
	}{
		{
			name: "must merge readable projects of chained filters",
			filter: func(r repo.View) repo.View {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, nil)).Filtered(pjFilter(id.ProjectIDList{p2}, nil))
			},
			wantDeny: id.ProjectIDList{p1, p2, p3},
		},
		{
			name: "must merge writable projects of chained filters",
			filter: func(r repo.View) repo.View {
				return r.Filtered(pjFilter(id.ProjectIDList{p1}, id.ProjectIDList{p1})).
					Filtered(pjFilter(id.ProjectIDList{p2}, id.ProjectIDList{p2}))
			},
			wantWrite: id.ProjectIDList{p1, p2},
			wantDeny:  id.ProjectIDList{p3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.View) repo.View {
				return r.Filtered(repo.ProjectFilter{}).Filtered(repo.ProjectFilter{})
			},
			wantWrite: id.ProjectIDList{p1, p2, p3},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, seeds))
			r := tc.filter(base)

			for _, p := range tc.wantWrite {
				assert.NoError(t, r.SaveAll(ctx, view.List{newView(p, id.NewModelID()).MustBuild()}))
			}
			for _, p := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.SaveAll(ctx, view.List{newView(p, id.NewModelID()).MustBuild()}))
			}

			// filtering must not change the base repository
			assert.NoError(t, base.SaveAll(ctx, view.List{newView(p3, id.NewModelID()).MustBuild()}))
			assert.Equal(t, seeds, storedViews(t, base, viewIDs(seeds)))
		})
	}
}

func testViewFindByID(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1 := id.NewModelID()
	p1v1 := newView(p1, m1).Name("view").Order(2).
		Sort(&view.Sort{Field: viewSelector(view.FieldTypeField), Direction: view.DirectionDesc}).
		Filter(new(viewStringCondition())).
		Columns(&view.ColumnList{{Field: viewSelector(view.FieldTypeField), Visible: true}}).MustBuild()
	p1v2 := newView(p1, m1).MustBuild()
	p2v1 := newView(p2, id.NewModelID()).MustBuild()
	seeds := view.List{p1v1, p1v2, p2v1}

	tests := []struct {
		name    string
		seeds   view.List
		filter  *repo.ProjectFilter
		args    id.ViewID
		want    *view.View
		wantErr error
	}{
		{
			name:  "must find a view with all its fields",
			seeds: seeds,
			args:  p1v1.ID(),
			want:  p1v1,
		},
		{
			name:  "must find a view with default fields",
			seeds: seeds,
			args:  p1v2.ID(),
			want:  p1v2,
		},
		{
			name:   "must find a view of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   p2v1.ID(),
			want:   p2v1,
		},
		{
			name:    "must not find a view of an unreadable project",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:    p1v1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a view with an empty filter",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{}, id.ProjectIDList{})),
			args:    p1v1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an unknown view",
			seeds:   seeds,
			args:    id.NewViewID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any view in an empty repository",
			args:    p1v1.ID(),
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

func testViewFindByIDs(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1 := id.NewModelID()
	p1v1 := newView(p1, m1).MustBuild()
	p1v2 := newView(p1, m1).Order(1).MustBuild()
	p2v1 := newView(p2, id.NewModelID()).MustBuild()
	seeds := view.List{p1v1, p1v2, p2v1}

	tests := []struct {
		name   string
		seeds  view.List
		filter *repo.ProjectFilter
		args   id.ViewIDList
		want   view.List
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.ViewIDList{},
		},
		{
			name:  "must find views across projects",
			seeds: seeds,
			args:  id.ViewIDList{p1v1.ID(), p1v2.ID(), p2v1.ID()},
			want:  view.List{p1v1, p1v2, p2v1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.ViewIDList{p2v1.ID(), p1v2.ID(), p1v1.ID()},
			want:  view.List{p2v1, p1v2, p1v1},
		},
		{
			name:   "must find views of readable projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1, p2}, nil)),
			args:   id.ViewIDList{p2v1.ID(), p1v1.ID()},
			want:   view.List{p2v1, p1v1},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.ViewIDList{id.NewViewID(), p1v2.ID(), id.NewViewID(), p1v1.ID()},
			want:  view.List{p1v2, p1v1},
		},
		{
			name: "must find nothing for an unknown ID in an empty repository",
			args: id.ViewIDList{id.NewViewID()},
			want: view.List{},
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

func testViewFindByModel(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1, m2, m3 := id.NewModelID(), id.NewModelID(), id.NewModelID()
	// saved in an order that differs from their orders
	m1v1 := newView(p1, m1).Order(1).MustBuild()
	m1v2 := newView(p1, m1).Order(2).MustBuild()
	m1v3 := newView(p1, m1).Order(0).MustBuild()
	m2v1 := newView(p1, m2).MustBuild()
	m3v1 := newView(p2, m3).MustBuild()
	seeds := view.List{m1v1, m1v2, m3v1, m1v3, m2v1}

	tests := []struct {
		name   string
		seeds  view.List
		filter *repo.ProjectFilter
		args   id.ModelID
		want   view.List // sorted by order
	}{
		{
			name:  "must find only the views of the model",
			seeds: seeds,
			args:  m1,
			want:  view.List{m1v3, m1v1, m1v2},
		},
		{
			name:  "must find the only view of a model",
			seeds: seeds,
			args:  m2,
			want:  view.List{m2v1},
		},
		{
			name:  "must find nothing for an unknown model",
			seeds: seeds,
			args:  id.NewModelID(),
		},
		{
			name: "must find nothing in an empty repository",
			args: m1,
		},
		{
			name:   "must find views of a readable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   m3,
			want:   view.List{m3v1},
		},
		{
			name:   "must find nothing in an unreadable project",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p2}, nil)),
			args:   m1,
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

			got, err := r.FindByModel(ctx, tc.args)
			assert.NoError(t, err)
			// neither backend sorts the result; callers sort it by order
			assert.Equal(t, tc.want, got.Ordered())
		})
	}
}

func testViewFields(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	b := func() *view.Buildr { return newView(id.NewProjectID(), id.NewModelID()) }
	allSelectors := []view.FieldSelector{
		{Type: view.FieldTypeId},
		{Type: view.FieldTypeCreationDate},
		{Type: view.FieldTypeCreationUser},
		{Type: view.FieldTypeModificationDate},
		{Type: view.FieldTypeModificationUser},
		{Type: view.FieldTypeStatus},
		viewSelector(view.FieldTypeField),
		viewSelector(view.FieldTypeMetaField),
	}

	tests := []struct {
		name string
		args *view.View
	}{
		{
			name: "must keep a view with default fields",
			args: b().MustBuild(),
		},
		{
			name: "must keep a view with all its fields",
			args: b().Name("一覧 view").Order(5).
				Sort(&view.Sort{Field: viewSelector(view.FieldTypeMetaField), Direction: view.DirectionAsc}).
				Filter(&view.Condition{AndCondition: &view.AndCondition{Conditions: []view.Condition{viewStringCondition(), viewNumberCondition()}}}).
				Columns(&view.ColumnList{
					{Field: viewSelector(view.FieldTypeField), Visible: true},
					{Field: view.FieldSelector{Type: view.FieldTypeStatus}, Visible: false},
				}).MustBuild(),
		},
		{
			name: "must keep a sort by a field",
			args: b().Sort(&view.Sort{Field: viewSelector(view.FieldTypeField), Direction: view.DirectionDesc}).MustBuild(),
		},
		{
			name: "must keep a sort by a selector without a field ID",
			args: b().Sort(&view.Sort{Field: view.FieldSelector{Type: view.FieldTypeCreationDate}, Direction: view.DirectionAsc}).MustBuild(),
		},
		{
			name: "must keep columns of every selector type in order",
			args: b().Columns(new(view.ColumnList(lo.Map(allSelectors, func(s view.FieldSelector, i int) view.Column {
				return view.Column{Field: s, Visible: i%2 == 0}
			})))).MustBuild(),
		},
		{
			name: "must keep a negative order",
			args: b().Order(-1).MustBuild(),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.Save(ctx, tc.args))

			got, err := r.FindByID(ctx, tc.args.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.args, got)
		})
	}
}

func testViewConditions(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	now := util.Now().Truncate(time.Millisecond).UTC()

	tests := []struct {
		name string
		args view.Condition
	}{
		{
			name: "must keep a basic condition with a string value",
			args: viewBasicCondition("value"),
		},
		{
			name: "must keep a basic condition with a number value",
			args: viewBasicCondition(1.5),
		},
		{
			name: "must keep a basic condition with a bool value",
			args: viewBasicCondition(true),
		},
		{
			name: "must keep a basic condition without a value",
			args: viewBasicCondition(nil),
		},
		{
			name: "must keep a nullable condition",
			args: view.Condition{NullableCondition: &view.NullableCondition{
				Field: view.FieldSelector{Type: view.FieldTypeModificationUser}, Op: view.NullableOperatorEmpty,
			}},
		},
		{
			name: "must keep a multiple condition",
			args: view.Condition{MultipleCondition: &view.MultipleCondition{
				Field: viewSelector(view.FieldTypeField), Op: view.MultipleOperatorIncludesAny, Value: []any{"a", "b", 2.5},
			}},
		},
		{
			name: "must keep a bool condition",
			args: view.Condition{BoolCondition: &view.BoolCondition{
				Field: viewSelector(view.FieldTypeMetaField), Op: view.BoolOperatorEquals, Value: true,
			}},
		},
		{
			name: "must keep a string condition",
			args: viewStringCondition(),
		},
		{
			name: "must keep a number condition",
			args: viewNumberCondition(),
		},
		{
			name: "must keep a time condition",
			args: view.Condition{TimeCondition: &view.TimeCondition{
				Field: view.FieldSelector{Type: view.FieldTypeCreationDate}, Op: view.TimeOperatorBefore, Value: now,
			}},
		},
		{
			name: "must keep an and condition",
			args: view.Condition{AndCondition: &view.AndCondition{Conditions: []view.Condition{
				viewStringCondition(), viewNumberCondition(),
			}}},
		},
		{
			name: "must keep an or condition",
			args: view.Condition{OrCondition: &view.OrCondition{Conditions: []view.Condition{
				viewBasicCondition("a"), viewBasicCondition("b"),
			}}},
		},
		{
			name: "must keep nested conditions",
			args: view.Condition{AndCondition: &view.AndCondition{Conditions: []view.Condition{
				viewStringCondition(),
				{OrCondition: &view.OrCondition{Conditions: []view.Condition{
					viewNumberCondition(),
					{AndCondition: &view.AndCondition{Conditions: []view.Condition{viewBasicCondition("deep")}}},
				}}},
			}}},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			v := newView(id.NewProjectID(), id.NewModelID()).Filter(&tc.args).MustBuild()
			require.NoError(t, r.Save(ctx, v))

			got, err := r.FindByID(ctx, v.ID())
			assert.NoError(t, err)
			assert.Equal(t, v, got)
		})
	}
}

func testViewIsolation(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()

	tests := []struct {
		name   string
		mutate func(saved, found *view.View)
	}{
		{
			name:   "must not keep changes made to a saved view",
			mutate: func(saved, _ *view.View) { saved.SetName("changed") },
		},
		{
			name:   "must not keep changes made to a found view",
			mutate: func(_, found *view.View) { found.SetOrder(9) },
		},
		{
			name: "must not keep a filter, sort or columns replaced on a found view",
			mutate: func(_, found *view.View) {
				found.SetFilter(new(viewBasicCondition("changed")))
				found.SetSort(&view.Sort{Field: view.FieldSelector{Type: view.FieldTypeId}, Direction: view.DirectionDesc})
				found.SetColumns(nil)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saved := newView(id.NewProjectID(), id.NewModelID()).Name("original").MustBuild()
			want := saved.Clone()
			require.NoError(t, r.Save(ctx, saved))
			found, err := r.FindByID(ctx, saved.ID())
			require.NoError(t, err)
			assert.Equal(t, want, found)
			assert.NotSame(t, saved, found)

			tc.mutate(saved, found)

			got, err := r.FindByID(ctx, saved.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}

func testViewSave(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1 := id.NewProjectID()
	p1v1 := newView(p1, id.NewModelID()).Name("before").MustBuild()
	p1v1Updated := view.New().ID(p1v1.ID()).Project(p1).Model(p1v1.Model()).Schema(p1v1.Schema()).
		User(p1v1.User()).Name("after").Order(1).Columns(&view.ColumnList{}).
		Filter(new(viewStringCondition())).UpdatedAt(p1v1.UpdatedAt().Add(time.Hour)).MustBuild()
	noUser := view.New().NewID().Project(p1).Model(id.NewModelID()).Schema(id.NewSchemaID()).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		filter  *repo.ProjectFilter
		args    *view.View
		want    *view.View // the stored view afterwards
		wantErr error
	}{
		{
			name: "must save a new view",
			args: p1v1,
			want: p1v1,
		},
		{
			name:    "must not save a view without a user",
			args:    noUser,
			wantErr: view.ErrInvalidID,
		},
		{
			name:    "must not save a view in a readable-only project",
			filter:  new(pjFilter(id.ProjectIDList{p1}, nil)),
			args:    p1v1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a view outside writable projects",
			seeds:   view.List{p1v1},
			filter:  new(pjFilter(nil, id.ProjectIDList{id.NewProjectID()})),
			args:    p1v1Updated,
			want:    p1v1, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:  "must overwrite an existing view",
			seeds: view.List{p1v1},
			args:  p1v1Updated,
			want:  p1v1Updated,
		},
		{
			name:   "must save a view in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   p1v1,
			want:   p1v1,
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
			assert.Equal(t, tc.want, lo.FirstOrEmpty(storedViews(t, base, id.ViewIDList{tc.args.ID()})))
		})
	}
}

func testViewSaveAll(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1 := id.NewModelID()
	p1v1 := newView(p1, m1).MustBuild()
	p1v2 := newView(p1, m1).Order(1).MustBuild()
	p2v1 := newView(p2, id.NewModelID()).MustBuild()
	p1v1Updated := view.New().ID(p1v1.ID()).Project(p1).Model(m1).Schema(p1v1.Schema()).User(p1v1.User()).
		Name("after").Order(2).Columns(&view.ColumnList{}).UpdatedAt(p1v1.UpdatedAt()).MustBuild()
	all := id.ViewIDList{p1v1.ID(), p1v2.ID(), p2v1.ID()}
	noUser := view.New().NewID().Project(p1).Model(m1).Schema(id.NewSchemaID()).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		filter  *repo.ProjectFilter
		args    view.List
		want    view.List // the stored views afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: view.List{},
		},
		{
			name: "must save views across projects",
			args: view.List{p1v1, p1v2, p2v1},
			want: view.List{p1v1, p1v2, p2v1},
		},
		{
			name:  "must overwrite existing views",
			seeds: view.List{p1v1, p1v2},
			args:  view.List{p1v1Updated},
			want:  view.List{p1v1Updated, p1v2},
		},
		{
			name:   "must save views in a writable project",
			filter: new(pjFilter(nil, id.ProjectIDList{p1})),
			args:   view.List{p1v1, p1v2},
			want:   view.List{p1v1, p1v2},
		},
		{
			name:    "must not save views in readable-only projects",
			filter:  new(pjFilter(id.ProjectIDList{p1, p2}, nil)),
			args:    view.List{p1v1, p2v1},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a list that includes an unwritable project",
			filter:  new(pjFilter(nil, id.ProjectIDList{p1})),
			args:    view.List{p1v1, p2v1},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite views outside writable projects",
			seeds:   view.List{p1v1},
			filter:  new(pjFilter(nil, id.ProjectIDList{p2})),
			args:    view.List{p1v1Updated},
			want:    view.List{p1v1}, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save a list that includes a view without a user",
			args:    view.List{p1v1, noUser},
			wantErr: view.ErrInvalidID,
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
			assert.Equal(t, tc.want, storedViews(t, base, all))
		})
	}
}

func testViewRemove(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1 := id.NewModelID()
	p1v1 := newView(p1, m1).MustBuild()
	p1v2 := newView(p1, m1).Order(1).MustBuild()
	p2v1 := newView(p2, id.NewModelID()).MustBuild()
	seeds := view.List{p1v1, p1v2, p2v1}

	tests := []struct {
		name    string
		seeds   view.List
		filter  *repo.ProjectFilter
		args    id.ViewID
		want    view.List // views that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove a view",
			seeds: seeds,
			args:  p1v1.ID(),
			want:  view.List{p1v2, p2v1},
		},
		{
			name:    "must not remove an unknown view",
			seeds:   seeds,
			args:    id.NewViewID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    p1v1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove a view in a writable project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p2})),
			args:   p2v1.ID(),
			want:   view.List{p1v1, p1v2},
		},
		{
			name:    "must not remove a view outside writable projects",
			seeds:   seeds,
			filter:  new(pjFilter(id.ProjectIDList{p1, p2}, id.ProjectIDList{p2})),
			args:    p1v1.ID(),
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

			// remaining views are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			assert.Equal(t, tc.want, storedViews(t, base, viewIDs(seeds)))
		})
	}
}

func testViewRemoveByModel(t *testing.T, newRepo viewFactory) {
	ctx := context.Background()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	m1, m2, m3 := id.NewModelID(), id.NewModelID(), id.NewModelID()
	m1v1 := newView(p1, m1).MustBuild()
	m1v2 := newView(p1, m1).Order(1).MustBuild()
	m2v1 := newView(p1, m2).MustBuild()
	m3v1 := newView(p2, m3).MustBuild()
	seeds := view.List{m1v1, m1v2, m2v1, m3v1}

	tests := []struct {
		name   string
		seeds  view.List
		filter *repo.ProjectFilter
		args   id.ModelID
		want   view.List // views that must remain after the call
	}{
		{
			name:  "must remove every view of the model",
			seeds: seeds,
			args:  m1,
			want:  view.List{m2v1, m3v1},
		},
		{
			name:  "must remove the only view of a model",
			seeds: seeds,
			args:  m3,
			want:  view.List{m1v1, m1v2, m2v1},
		},
		{
			name:  "must remove nothing for an unknown model",
			seeds: seeds,
			args:  id.NewModelID(),
			want:  seeds,
		},
		{
			name: "must remove nothing from an empty repository",
			args: m1,
		},
		{
			name:   "must remove views of a model in a writable project",
			seeds:  seeds,
			filter: new(pjFilter(nil, id.ProjectIDList{p2})),
			args:   m3,
			want:   view.List{m1v1, m1v2, m2v1},
		},
		{
			name:   "must not remove views of a model outside writable projects",
			seeds:  seeds,
			filter: new(pjFilter(id.ProjectIDList{p1, p2}, id.ProjectIDList{p2})),
			args:   m1,
			want:   seeds,
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

			assert.NoError(t, r.RemoveByModel(ctx, tc.args))

			// remaining views are checked unfiltered
			assert.Equal(t, tc.want, storedViews(t, base, viewIDs(seeds)))
		})
	}
}
