package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldSelectorTypeInto(t *testing.T) {
	tests := []struct {
		name     string
		input    FieldSelectorType
		expected view.FieldType
	}{
		{
			name:     "FieldSelectorTypeId",
			input:    FieldSelectorTypeId,
			expected: view.FieldTypeId,
		},
		{
			name:     "FieldSelectorTypeCreationDate",
			input:    FieldSelectorTypeCreationDate,
			expected: view.FieldTypeCreationDate,
		},
		{
			name:     "FieldSelectorTypeModificationDate",
			input:    FieldSelectorTypeModificationDate,
			expected: view.FieldTypeModificationDate,
		},
		{
			name:     "FieldSelectorTypeStatus",
			input:    FieldSelectorTypeStatus,
			expected: view.FieldTypeStatus,
		},
		{
			name:     "FieldSelectorTypeCreationUser",
			input:    FieldSelectorTypeCreationUser,
			expected: view.FieldTypeCreationUser,
		},
		{
			name:     "FieldSelectorTypeModificationUser",
			input:    FieldSelectorTypeModificationUser,
			expected: view.FieldTypeModificationUser,
		},
		{
			name:     "FieldSelectorTypeField",
			input:    FieldSelectorTypeField,
			expected: view.FieldTypeField,
		},
		{
			name:     "FieldSelectorTypeMetaField",
			input:    FieldSelectorTypeMetaField,
			expected: view.FieldTypeMetaField,
		},
		{
			name:     "Default case",
			input:    FieldSelectorType("999"), // An unrecognized type
			expected: view.FieldTypeId,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestStringOperatorInto(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionStringOperator
		expected view.StringOperator
	}{
		{
			name:     "contains",
			input:    Contains,
			expected: view.StringOperatorContains,
		},
		{
			name:     "NotContains",
			input:    NotContains,
			expected: view.StringOperatorNotContains,
		},
		{
			name:     "StartsWith",
			input:    StartsWith,
			expected: view.StringOperatorStartsWith,
		},
		{
			name:     "NotStartsWith",
			input:    NotStartsWith,
			expected: view.StringOperatorNotStartsWith,
		},
		{
			name:     "EndsWith",
			input:    EndsWith,
			expected: view.StringOperatorEndsWith,
		},
		{
			name:     "NotEndsWith",
			input:    NotEndsWith,
			expected: view.StringOperatorNotEndsWith,
		},
		{
			name:     "Default case",
			input:    ConditionStringOperator("999"), // An unrecognized type
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNumberOperatorInto(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionNumberOperator
		expected view.NumberOperator
	}{
		{
			name:     "GreaterThan",
			input:    GreaterThan,
			expected: view.NumberOperatorGreaterThan,
		},
		{
			name:     "GreaterThanOrEqualTo",
			input:    GreaterThanOrEqualTo,
			expected: view.NumberOperatorGreaterThanOrEqualTo,
		},
		{
			name:     "LessThan",
			input:    LessThan,
			expected: view.NumberOperatorLessThan,
		},
		{
			name:     "LessThanOrEqualTo",
			input:    LessThanOrEqualTo,
			expected: view.NumberOperatorLessThanOrEqualTo,
		},
		{
			name:     "Default case",
			input:    ConditionNumberOperator("999"), // An unrecognized type
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestBasicOperatorInto(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionBasicOperator
		expected view.BasicOperator
	}{
		{
			name:     "Equals",
			input:    ConditionBasicOperatorEquals,
			expected: view.BasicOperatorEquals,
		},
		{
			name:     "NotEquals",
			input:    ConditionBasicOperatorNotEquals,
			expected: view.BasicOperatorNotEquals,
		},
		{
			name:     "Default case",
			input:    ConditionBasicOperator("999"), // An unrecognized type
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestTimeOperatorInto(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionTimeOperator
		expected view.TimeOperator
	}{
		{
			name:     "After",
			input:    After,
			expected: view.TimeOperatorAfter,
		},
		{
			name:     "AfterOrOn",
			input:    AfterOrOn,
			expected: view.TimeOperatorAfterOrOn,
		},
		{
			name:     "Before",
			input:    Before,
			expected: view.TimeOperatorBefore,
		},
		{
			name:     "BeforeOrOn",
			input:    BeforeOrOn,
			expected: view.TimeOperatorBeforeOrOn,
		},
		{
			name:     "OfThisWeek",
			input:    OfThisWeek,
			expected: view.TimeOperatorOfThisWeek,
		},
		{
			name:     "OfThisMonth",
			input:    OfThisMonth,
			expected: view.TimeOperatorOfThisMonth,
		},
		{
			name:     "OfThisYear",
			input:    OfThisYear,
			expected: view.TimeOperatorOfThisYear,
		},
		{
			name:     "Default case",
			input:    ConditionTimeOperator("999"), // An unrecognized type
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestBoolOperatorInto(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionBoolOperator
		expected view.BoolOperator
	}{
		{
			name:     "equals",
			input:    ConditionBoolOperatorEquals,
			expected: view.BoolOperatorEquals,
		},
		{
			name:     "not equals",
			input:    ConditionBoolOperatorNotEquals,
			expected: view.BoolOperatorNotEquals,
		},
		{
			name:     "Default case",
			input:    ConditionBoolOperator("999"), // An unrecognized type
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.input.Into()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConditionNullableOperator_Into(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionNullableOperator
		expected view.NullableOperator
	}{
		{"success nullable operator", Empty, view.NullableOperatorEmpty},
		{"success nullable operator not empty", NotEmpty, view.NullableOperatorNotEmpty},
		{"success default case", ConditionNullableOperator("99"), ""}, // Test for default case
	}

	for _, test := range tests {
		t.Run(string(test.name), func(t *testing.T) {
			t.Parallel()
			result := test.input.Into()
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestConditionMultipleOperator_Into(t *testing.T) {
	tests := []struct {
		name     string
		input    ConditionMultipleOperator
		expected view.MultipleOperator
	}{
		{"success IncludeAny", IncludesAny, view.MultipleOperatorIncludesAny},
		{"success NotIncludesAny", NotIncludesAny, view.MultipleOperatorNotIncludesAny},
		{"success IncludesAll", IncludesAll, view.MultipleOperatorIncludesAll},
		{"success NotIncludesAll", NotIncludesAll, view.MultipleOperatorNotIncludesAll},
		{"success default case", ConditionMultipleOperator("99"), ""}, // Test for default case
	}

	for _, test := range tests {
		t.Run(string(test.name), func(t *testing.T) {
			t.Parallel()
			result := test.input.Into()
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestFieldSelector_Into(t *testing.T) {
	fieldType := FieldSelector{
		FieldId: id.NewFieldID().Ref(),
		Type:    lo.ToPtr(FieldSelectorTypeId),
	}
	tests := []struct {
		name     string
		input    FieldSelector
		expected view.FieldSelector
	}{
		{
			name: "success",
			input: FieldSelector{
				FieldId: fieldType.FieldId,
				Type:    fieldType.Type,
			},
			expected: view.FieldSelector{
				Type: view.FieldTypeId,
				ID:   fieldType.FieldId,
			},
		},
	}

	for _, test := range tests {
		t.Run(string(test.name), func(t *testing.T) {
			t.Parallel()
			result := test.input.Into()
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestConditionInto(t *testing.T) {
	fieldID := id.NewFieldID().Ref()
	var pIntf *interface{}
	var emptyInterface interface{}
	pIntf = &emptyInterface
	*pIntf = "test"
	timeNow := time.Now()

	tests := []struct {
		name      string
		condition *Condition
		want      *view.Condition
	}{
		{
			name: "success bool",
			condition: &Condition{
				Bool: &struct {
					FieldId  FieldSelector         "json:\"fieldId\""
					Operator ConditionBoolOperator "json:\"operator\""
					Value    bool                  "json:\"value\""
				}{
					FieldId: FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: ConditionBoolOperatorEquals,
					Value:    true,
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeBool,
				BoolCondition: &view.BoolCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op:    view.BoolOperatorEquals,
					Value: true,
				},
			},
		},
		{
			name: "success type string",
			condition: &Condition{
				String: &struct {
					FieldId  FieldSelector           "json:\"fieldId\""
					Operator ConditionStringOperator "json:\"operator\""
					Value    string                  "json:\"value\""
				}{
					FieldId: FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: Contains,
					Value:    "CONTAINS",
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeString,
				StringCondition: &view.StringCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op:    view.StringOperatorContains,
					Value: "CONTAINS",
				},
			},
		},
		{
			name: "success number",
			condition: &Condition{
				Number: &struct {
					FieldId  FieldSelector           "json:\"fieldId\""
					Operator ConditionNumberOperator "json:\"operator\""
					Value    float32                 "json:\"value\""
				}{
					FieldId: FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: GreaterThanOrEqualTo,
					Value:    float32(2),
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeNumber,
				NumberCondition: &view.NumberCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op:    view.NumberOperatorGreaterThanOrEqualTo,
					Value: float64(2),
				},
			},
		},
		{
			name: "success basic",
			condition: &Condition{
				Basic: &struct {
					FieldId  *FieldSelector          "json:\"fieldId,omitempty\""
					Operator *ConditionBasicOperator "json:\"operator,omitempty\""
					Value    *interface{}            "json:\"value,omitempty\""
				}{
					FieldId: &FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: lo.ToPtr(ConditionBasicOperatorEquals),
					Value:    pIntf,
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeBasic,
				BasicCondition: &view.BasicCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op:    view.BasicOperatorEquals,
					Value: "test",
				},
			},
		},
		{
			name: "success time",
			condition: &Condition{
				Time: &struct {
					FieldId  FieldSelector         "json:\"fieldId\""
					Operator ConditionTimeOperator "json:\"operator\""
					Value    time.Time             "json:\"value\""
				}{
					FieldId: FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: After,
					Value:    timeNow,
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeTime,
				TimeCondition: &view.TimeCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op:    view.TimeOperatorAfter,
					Value: timeNow,
				},
			},
		},
		{
			name: "success nullable",
			condition: &Condition{
				Nullable: &struct {
					FieldId  *FieldSelector             "json:\"fieldId,omitempty\""
					Operator *ConditionNullableOperator "json:\"operator,omitempty\""
				}{
					FieldId: &FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: lo.ToPtr(Empty),
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeNullable,
				NullableCondition: &view.NullableCondition{
					Field: view.FieldSelector{
						Type: view.FieldTypeId,
						ID:   fieldID,
					},
					Op: view.NullableOperatorEmpty,
				},
			},
		},
		{
			name: "success multiple",
			condition: &Condition{
				Multiple: &struct {
					FieldId  FieldSelector             "json:\"fieldId\""
					Operator ConditionMultipleOperator "json:\"operator\""
					Value    []interface{}             "json:\"value\""
				}{
					FieldId: FieldSelector{
						FieldId: fieldID,
						Type:    lo.ToPtr(FieldSelectorTypeId),
					},
					Operator: IncludesAll,
					Value: []any{
						pIntf,
					},
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeMultiple,
				MultipleCondition: &view.MultipleCondition{
					Field: view.FieldSelector{
						ID:   fieldID,
						Type: view.FieldTypeId,
					},
					Op: view.MultipleOperatorIncludesAll,
					Value: []any{
						pIntf,
					},
				},
			},
		},
		{
			name: "success and",
			condition: &Condition{
				And: &[]Condition{
					{
						Bool: &struct {
							FieldId  FieldSelector         "json:\"fieldId\""
							Operator ConditionBoolOperator "json:\"operator\""
							Value    bool                  "json:\"value\""
						}{
							FieldId: FieldSelector{
								FieldId: fieldID,
								Type:    lo.ToPtr(FieldSelectorTypeId),
							},
							Operator: ConditionBoolOperatorEquals,
							Value:    true,
						},
					},
					{
						Bool: &struct {
							FieldId  FieldSelector         "json:\"fieldId\""
							Operator ConditionBoolOperator "json:\"operator\""
							Value    bool                  "json:\"value\""
						}{
							FieldId: FieldSelector{
								FieldId: fieldID,
								Type:    lo.ToPtr(FieldSelectorTypeId),
							},
							Operator: ConditionBoolOperatorEquals,
							Value:    true,
						},
					},
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeAnd,
				AndCondition: &view.AndCondition{
					Conditions: []view.Condition{
						{
							ConditionType: view.ConditionTypeBool,
							BoolCondition: &view.BoolCondition{
								Field: view.FieldSelector{
									Type: view.FieldTypeId,
									ID:   fieldID,
								},
								Op:    view.BoolOperatorEquals,
								Value: true,
							},
						},
						{
							ConditionType: view.ConditionTypeBool,
							BoolCondition: &view.BoolCondition{
								Field: view.FieldSelector{
									Type: view.FieldTypeId,
									ID:   fieldID,
								},
								Op:    view.BoolOperatorEquals,
								Value: true,
							},
						},
					},
				},
			},
		},
		{
			name: "success or",
			condition: &Condition{
				Or: &[]Condition{
					{
						Bool: &struct {
							FieldId  FieldSelector         "json:\"fieldId\""
							Operator ConditionBoolOperator "json:\"operator\""
							Value    bool                  "json:\"value\""
						}{
							FieldId: FieldSelector{
								FieldId: fieldID,
								Type:    lo.ToPtr(FieldSelectorTypeId),
							},
							Operator: ConditionBoolOperatorEquals,
							Value:    true,
						},
					},
					{
						Bool: &struct {
							FieldId  FieldSelector         "json:\"fieldId\""
							Operator ConditionBoolOperator "json:\"operator\""
							Value    bool                  "json:\"value\""
						}{
							FieldId: FieldSelector{
								FieldId: fieldID,
								Type:    lo.ToPtr(FieldSelectorTypeId),
							},
							Operator: ConditionBoolOperatorEquals,
							Value:    true,
						},
					},
				},
			},
			want: &view.Condition{
				ConditionType: view.ConditionTypeOr,
				OrCondition: &view.OrCondition{
					Conditions: []view.Condition{
						{
							ConditionType: view.ConditionTypeBool,
							BoolCondition: &view.BoolCondition{
								Field: view.FieldSelector{
									Type: view.FieldTypeId,
									ID:   fieldID,
								},
								Op:    view.BoolOperatorEquals,
								Value: true,
							},
						},
						{
							ConditionType: view.ConditionTypeBool,
							BoolCondition: &view.BoolCondition{
								Field: view.FieldSelector{
									Type: view.FieldTypeId,
									ID:   fieldID,
								},
								Op:    view.BoolOperatorEquals,
								Value: true,
							},
						},
					},
				},
			},
		},
		{
			name:      "success nil",
			condition: nil,
			want:      nil,
		},
		{
			name:      "empty condition",
			condition: &Condition{},
			want:      nil,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.condition.Into())
		})
	}
}
