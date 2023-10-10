package view

type ConditionType string

const (
	ConditionTypeAnd      ConditionType = "AND"
	ConditionTypeOr       ConditionType = "OR"
	ConditionTypeBasic    ConditionType = "BASIC"
	ConditionTypeNullable ConditionType = "NULLABLE"
	ConditionTypeMultiple ConditionType = "MULTIPLE"
	ConditionTypeBool     ConditionType = "BOOL"
	ConditionTypeString   ConditionType = "STRING"
	ConditionTypeNumber   ConditionType = "NUMBER"
	ConditionTypeTime     ConditionType = "TIME"
)

type Condition struct {
	ConditionType     ConditionType
	AndCondition      *AndCondition
	OrCondition       *OrCondition
	BasicCondition    *BasicCondition
	NullableCondition *NullableCondition
	MultipleCondition *MultipleCondition
	BoolCondition     *BoolCondition
	StringCondition   *StringCondition
	NumberCondition   *NumberCondition
	TimeCondition     *TimeCondition
}
