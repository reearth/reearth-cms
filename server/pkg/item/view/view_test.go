package view

import (
	"testing"
	"time"

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
	valid := func() *View {
		return &View{id: NewID(), project: NewProjectID(), model: NewModelID(), schema: NewSchemaID(), user: NewUserID()}
	}

	tests := []struct {
		name    string
		mutate  func(v *View)
		wantErr error
	}{
		{name: "must accept a view with every ID", mutate: func(*View) {}},
		{name: "must reject a view without an ID", mutate: func(v *View) { v.id = ID{} }, wantErr: ErrInvalidID},
		{name: "must reject a view without a project", mutate: func(v *View) { v.project = ProjectID{} }, wantErr: ErrInvalidID},
		{name: "must reject a view without a model", mutate: func(v *View) { v.model = ModelID{} }, wantErr: ErrInvalidID},
		{name: "must reject a view without a schema", mutate: func(v *View) { v.schema = SchemaID{} }, wantErr: ErrInvalidID},
		{name: "must reject a view without a user", mutate: func(v *View) { v.user = UserID{} }, wantErr: ErrInvalidID},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			v := valid()
			tc.mutate(v)
			assert.Equal(t, tc.wantErr, v.Validate())
			assert.Equal(t, tc.wantErr, List{valid(), v}.Validate())
		})
	}
}
