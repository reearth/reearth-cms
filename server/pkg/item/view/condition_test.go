package view

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCondition_Validate(t *testing.T) {
	t.Parallel()
	basic := Condition{ConditionType: ConditionTypeBasic, BasicCondition: &BasicCondition{}}

	tests := []struct {
		name    string
		args    Condition
		wantErr error
	}{
		{
			name: "must accept a condition",
			args: basic,
		},
		{
			name: "must accept nested conditions",
			args: Condition{ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{Conditions: []Condition{
				basic,
				{ConditionType: ConditionTypeOr, OrCondition: &OrCondition{Conditions: []Condition{basic}}},
			}}},
		},
		{
			name: "must accept an and condition without conditions",
			args: Condition{ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{}},
		},
		{
			name: "must accept an or condition without conditions",
			args: Condition{ConditionType: ConditionTypeOr, OrCondition: &OrCondition{}},
		},
		{
			name:    "must reject an empty condition",
			args:    Condition{},
			wantErr: ErrInvalidCondition,
		},
		{
			name:    "must reject a condition without a type",
			args:    Condition{BasicCondition: &BasicCondition{}},
			wantErr: ErrInvalidCondition,
		},
		{
			name:    "must reject a condition of an unknown type",
			args:    Condition{ConditionType: "UNKNOWN", BasicCondition: &BasicCondition{}},
			wantErr: ErrInvalidCondition,
		},
		{
			name:    "must reject a condition whose type doesn't match the condition set",
			args:    Condition{ConditionType: ConditionTypeString, BasicCondition: &BasicCondition{}},
			wantErr: ErrInvalidCondition,
		},
		{
			name:    "must reject an and condition without its and condition",
			args:    Condition{ConditionType: ConditionTypeAnd},
			wantErr: ErrInvalidCondition,
		},
		{
			name: "must reject an empty condition in an and condition",
			args: Condition{ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{Conditions: []Condition{
				basic, {},
			}}},
			wantErr: ErrInvalidCondition,
		},
		{
			name: "must reject an empty condition nested in an or condition",
			args: Condition{ConditionType: ConditionTypeAnd, AndCondition: &AndCondition{Conditions: []Condition{
				{ConditionType: ConditionTypeOr, OrCondition: &OrCondition{Conditions: []Condition{basic, {}}}},
			}}},
			wantErr: ErrInvalidCondition,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.wantErr, tc.args.Validate())

			// a view with the condition as its filter is validated the same way
			v := &View{id: NewID(), project: NewProjectID(), model: NewModelID(), schema: NewSchemaID(), user: NewUserID(), filter: &tc.args}
			assert.Equal(t, tc.wantErr, v.Validate())
		})
	}
}
