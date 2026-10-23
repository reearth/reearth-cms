package view

import (
	"errors"

	"github.com/samber/lo"
)

var ErrEmptyCondition = errors.New("empty condition")

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

// Validate returns ErrEmptyCondition when the condition, or one of the
// conditions nested in it, has no condition set.
func (c Condition) Validate() error {
	switch {
	case c.AndCondition != nil:
		return validateConditions(c.AndCondition.Conditions)
	case c.OrCondition != nil:
		return validateConditions(c.OrCondition.Conditions)
	case c.BasicCondition != nil, c.NullableCondition != nil, c.MultipleCondition != nil,
		c.BoolCondition != nil, c.StringCondition != nil, c.NumberCondition != nil, c.TimeCondition != nil:
		return nil
	default:
		return ErrEmptyCondition
	}
}

func validateConditions(conditions []Condition) error {
	for _, c := range conditions {
		if err := c.Validate(); err != nil {
			return err
		}
	}
	return nil
}

func (c Condition) MetaFields() FieldSelectorList {
	return c.FieldsByType(FieldTypeMetaField)
}

func (c Condition) ItemFields() FieldSelectorList {
	return c.FieldsByType(FieldTypeField)
}

func (c Condition) FieldsByType(t FieldType) FieldSelectorList {
	var res []FieldSelector

	switch c.ConditionType {
	case ConditionTypeAnd:
		res = append(res, lo.FlatMap(c.AndCondition.Conditions, func(c Condition, _ int) []FieldSelector {
			return c.FieldsByType(t)
		})...)
	case ConditionTypeOr:
		res = append(res, lo.FlatMap(c.OrCondition.Conditions, func(c Condition, _ int) []FieldSelector {
			return c.FieldsByType(t)
		})...)
	case ConditionTypeBasic:
		if c.BasicCondition.Field.Type == t {
			res = append(res, c.BasicCondition.Field)
		}
	case ConditionTypeNullable:
		if c.NullableCondition.Field.Type == t {
			res = append(res, c.NullableCondition.Field)
		}
	case ConditionTypeMultiple:
		if c.MultipleCondition.Field.Type == t {
			res = append(res, c.MultipleCondition.Field)
		}
	case ConditionTypeBool:
		if c.BoolCondition.Field.Type == t {
			res = append(res, c.BoolCondition.Field)
		}
	case ConditionTypeString:
		if c.StringCondition.Field.Type == t {
			res = append(res, c.StringCondition.Field)
		}
	case ConditionTypeNumber:
		if c.NumberCondition.Field.Type == t {
			res = append(res, c.NumberCondition.Field)
		}
	case ConditionTypeTime:
		if c.TimeCondition.Field.Type == t {
			res = append(res, c.TimeCondition.Field)
		}
	}
	return res
}
