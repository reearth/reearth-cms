package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/stretchr/testify/assert"
)

func TestToView(t *testing.T) {
	vId := view.NewID()
	pId := project.NewID()
	mId := model.NewID()
	tests := []struct {
		name string
		view *view.View
		want *View
	}{
		{
			name: "nil",
			view: nil,
			want: nil,
		},
		{
			name: "success",
			view: view.New().ID(vId).Project(pId).Model(mId).Schema(view.NewSchemaID()).User(view.NewUserID()).
				Name("N1").Order(1).MustBuild(),
			want: &View{
				ID:        IDFrom(vId),
				ProjectID: IDFrom(pId),
				ModelID:   IDFrom(mId),
				Name:      "N1",
				Order:     1,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			got := ToView(tt.view)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestConditionInput_Into(t *testing.T) {
	t.Parallel()
	basicInput := &ConditionInput{Basic: &BasicFieldConditionInput{
		FieldID:  &FieldSelectorInput{Type: FieldTypeID},
		Operator: BasicOperatorEquals,
		Value:    "x",
	}}
	basic := view.Condition{ConditionType: view.ConditionTypeBasic, BasicCondition: &view.BasicCondition{
		Field: view.FieldSelector{Type: view.FieldTypeId},
		Op:    view.BasicOperatorEquals,
		Value: "x",
	}}

	tests := []struct {
		name    string
		args    *ConditionInput
		want    *view.Condition
		wantErr error
	}{
		{
			name: "nil is no filter",
		},
		{
			name: "a condition",
			args: basicInput,
			want: &basic,
		},
		{
			name: "nested conditions",
			args: &ConditionInput{And: &AndConditionInput{Conditions: []*ConditionInput{
				basicInput,
				{Or: &OrConditionInput{Conditions: []*ConditionInput{basicInput}}},
			}}},
			want: &view.Condition{ConditionType: view.ConditionTypeAnd, AndCondition: &view.AndCondition{Conditions: []view.Condition{
				basic,
				{ConditionType: view.ConditionTypeOr, OrCondition: &view.OrCondition{Conditions: []view.Condition{basic}}},
			}}},
		},
		{
			name:    "an input with no condition set is invalid",
			args:    &ConditionInput{},
			want:    &view.Condition{},
			wantErr: view.ErrInvalidCondition,
		},
		{
			name: "a nested input with no condition set is invalid",
			args: &ConditionInput{And: &AndConditionInput{Conditions: []*ConditionInput{basicInput, {}}}},
			want: &view.Condition{ConditionType: view.ConditionTypeAnd, AndCondition: &view.AndCondition{Conditions: []view.Condition{
				basic, {},
			}}},
			wantErr: view.ErrInvalidCondition,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := tc.args.Into()
			assert.Equal(t, tc.want, got)
			if got != nil {
				assert.Equal(t, tc.wantErr, got.Validate())
			}
		})
	}
}
