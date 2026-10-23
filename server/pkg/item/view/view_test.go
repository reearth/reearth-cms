package view

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestView(t *testing.T) {
	// Create an instance of View, v
	v := &View{
		id:        NewID(), // Assuming NewID() gives a unique ID
		name:      "test",
		schema:    NewSchemaID(),  // Assuming NewSchemaID() gives a unique SchemaID
		model:     NewModelID(),   // Assuming NewModelID() gives a unique ModelID
		project:   NewProjectID(), // Assuming NewProjectID() gives a unique ProjectID
		user:      NewUserID(),    // Assuming NewUserID() gives a unique UserID
		updatedAt: time.Now(),
		order:     1,
	}

	// Test ID()
	assert.Equal(t, v.id, v.ID())

	// Test Model()
	assert.Equal(t, v.model, v.Model())

	// Test Project()
	assert.Equal(t, v.project, v.Project())

	// Test Name()
	assert.Equal(t, v.name, v.Name())

	// Test User()
	assert.Equal(t, v.user, v.User())

	// Test Schema()
	assert.Equal(t, v.schema, v.Schema())

	// Test UpdatedAt()
	assert.Equal(t, v.updatedAt, v.UpdatedAt())

	// Test Order()
	assert.Equal(t, v.order, v.Order())

	// Create new settings for Setters
	newCondition := Condition{} // assuming Condition struct or type exists
	newSort := Sort{}           // assuming Sort struct or type exists
	columns := ColumnList{}     // assuming FieldSelectorList struct or type exists
	updateTime := time.Now()

	// Update fields using Setters
	v.SetName("updatedName")   // Assuming name is "updatedName"
	v.SetSort(&newSort)        // Assuming newSort has been set
	v.SetFilter(&newCondition) // Assuming newCondition has been set
	v.SetColumns(&columns)     // Assuming newFields has been set
	v.SetUpdatedAt(updateTime) // Assuming updateTime has been set
	v.SetOrder(2)

	// Test that updated fields are set correctly
	assert.Equal(t, "updatedName", v.Name())
	assert.Equal(t, &newSort, v.Sort())
	assert.Equal(t, &newCondition, v.Filter())
	assert.Equal(t, &columns, v.Columns())
	assert.Equal(t, updateTime, v.UpdatedAt())
	assert.Equal(t, 2, v.Order())

	// Test Clone Function
	cloned := v.Clone()
	assert.EqualValues(t, v, cloned)
}

func TestView_Validate(t *testing.T) {
	t.Parallel()
	leaf := Condition{ConditionType: ConditionTypeBool, BoolCondition: &BoolCondition{}}
	// valid builds a valid view, then breaks it the way the builder would reject
	valid := func(f func(*View)) *View {
		v := New().NewID().Project(NewProjectID()).Model(NewModelID()).Schema(NewSchemaID()).User(NewUserID()).MustBuild()
		if f != nil {
			f(v)
		}
		return v
	}

	tests := []struct {
		name string
		args *View
		want error
	}{
		{name: "must accept a view without a filter", args: valid(nil)},
		{
			name: "must accept nested conditions",
			args: valid(func(v *View) {
				v.filter = &Condition{ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{Conditions: []Condition{
					leaf, {ConditionType: ConditionTypeOr, OrCondition: &OrCondition{Conditions: []Condition{leaf}}},
				}}}
			}),
		},
		{name: "must reject a nil view", want: rerror.ErrInvalidParams},
		{name: "must reject a view without an ID", args: valid(func(v *View) { v.id = ID{} }), want: id.ErrInvalidID},
		{name: "must reject a view without a project", args: valid(func(v *View) { v.project = ProjectID{} }), want: id.ErrInvalidID},
		{name: "must reject a view without a model", args: valid(func(v *View) { v.model = ModelID{} }), want: id.ErrInvalidID},
		{name: "must reject a view without a schema", args: valid(func(v *View) { v.schema = SchemaID{} }), want: id.ErrInvalidID},
		{name: "must reject a view without a user", args: valid(func(v *View) { v.user = UserID{} }), want: id.ErrInvalidID},
		{name: "must reject an empty filter", args: valid(func(v *View) { v.filter = &Condition{} }), want: ErrEmptyCondition},
		{
			name: "must reject an empty nested condition",
			args: valid(func(v *View) {
				v.filter = &Condition{ConditionType: ConditionTypeOr, OrCondition: &OrCondition{Conditions: []Condition{
					leaf, {ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{Conditions: []Condition{{}}}},
				}}}
			}),
			want: ErrEmptyCondition,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.args.Validate())
			assert.Equal(t, tc.want, List{valid(nil), tc.args}.Validate())
		})
	}
}
