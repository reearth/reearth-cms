package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/samber/lo"
)

func (e FieldSelectorType) Into() view.FieldType {
	switch e {
	case FieldSelectorTypeId:
		return view.FieldTypeId
	case FieldSelectorTypeCreationDate:
		return view.FieldTypeCreationDate
	case FieldSelectorTypeModificationDate:
		return view.FieldTypeModificationDate
	case FieldSelectorTypeStatus:
		return view.FieldTypeStatus
	case FieldSelectorTypeCreationUser:
		return view.FieldTypeCreationUser
	case FieldSelectorTypeModificationUser:
		return view.FieldTypeModificationUser
	case FieldSelectorTypeField:
		return view.FieldTypeField
	case FieldSelectorTypeMetaField:
		return view.FieldTypeMetaField
	default:
		return view.FieldTypeId
	}
}

func (i FieldSelector) Into() view.FieldSelector {
	return view.FieldSelector{
		Type: i.Type.Into(),
		ID:   i.FieldId,
	}
}

func (i *Condition) Into() *view.Condition {
	if i == nil {
		return nil
	}
	if i.Bool != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeBool,
			BoolCondition: &view.BoolCondition{
				Field: i.Bool.FieldId.Into(),
				Op:    i.Bool.Operator.Into(),
				Value: i.Bool.Value,
			},
		}
	}
	if i.String != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeString,
			StringCondition: &view.StringCondition{
				Field: i.String.FieldId.Into(),
				Op:    i.String.Operator.Into(),
				Value: i.String.Value,
			},
		}
	}
	if i.Number != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeNumber,
			NumberCondition: &view.NumberCondition{
				Field: i.Number.FieldId.Into(),
				Op:    i.Number.Operator.Into(),
				Value: float64(i.Number.Value),
			},
		}
	}
	if i.Basic != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: i.Basic.FieldId.Into(),
				Op:    i.Basic.Operator.Into(),
				Value: *i.Basic.Value,
			},
		}
	}
	if i.Time != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeTime,
			TimeCondition: &view.TimeCondition{
				Field: i.Time.FieldId.Into(),
				Op:    i.Time.Operator.Into(),
				Value: i.Time.Value,
			},
		}
	}
	if i.Nullable != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeNullable,
			NullableCondition: &view.NullableCondition{
				Field: i.Nullable.FieldId.Into(),
				Op:    i.Nullable.Operator.Into(),
			},
		}
	}
	if i.Multiple != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeMultiple,
			MultipleCondition: &view.MultipleCondition{
				Field: i.Multiple.FieldId.Into(),
				Op:    i.Multiple.Operator.Into(),
				Value: i.Multiple.Value,
			},
		}
	}
	if i.And != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeAnd,
			AndCondition: &view.AndCondition{
				Conditions: lo.Map(*i.And, func(c Condition, _ int) view.Condition {
					return *c.Into()
				}),
			},
		}
	}
	if i.Or != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeOr,
			OrCondition: &view.OrCondition{
				Conditions: lo.Map(*i.Or, func(c Condition, _ int) view.Condition {
					return *c.Into()
				}),
			},
		}
	}

	return nil
}

func (e ConditionBoolOperator) Into() view.BoolOperator {
	switch e {
	case ConditionBoolOperatorEquals:
		return view.BoolOperatorEquals
	case ConditionBoolOperatorNotEquals:
		return view.BoolOperatorNotEquals
	default:
		return ""
	}
}

func (e ConditionStringOperator) Into() view.StringOperator {
	switch e {
	case Contains:
		return view.StringOperatorContains
	case NotContains:
		return view.StringOperatorNotContains
	case StartsWith:
		return view.StringOperatorStartsWith
	case NotStartsWith:
		return view.StringOperatorNotStartsWith
	case EndsWith:
		return view.StringOperatorEndsWith
	case NotEndsWith:
		return view.StringOperatorNotEndsWith
	default:
		return ""
	}
}

func (e ConditionNumberOperator) Into() view.NumberOperator {
	switch e {
	case GreaterThan:
		return view.NumberOperatorGreaterThan
	case GreaterThanOrEqualTo:
		return view.NumberOperatorGreaterThanOrEqualTo
	case LessThan:
		return view.NumberOperatorLessThan
	case LessThanOrEqualTo:
		return view.NumberOperatorLessThanOrEqualTo
	default:
		return ""
	}
}

func (e ConditionBasicOperator) Into() view.BasicOperator {
	switch e {
	case ConditionBasicOperatorEquals:
		return view.BasicOperatorEquals
	case ConditionBasicOperatorNotEquals:
		return view.BasicOperatorNotEquals
	default:
		return ""
	}
}

func (e ConditionTimeOperator) Into() view.TimeOperator {
	switch e {
	case After:
		return view.TimeOperatorAfter
	case AfterOrOn:
		return view.TimeOperatorAfterOrOn
	case Before:
		return view.TimeOperatorBefore
	case BeforeOrOn:
		return view.TimeOperatorBeforeOrOn
	case OfThisWeek:
		return view.TimeOperatorOfThisWeek
	case OfThisMonth:
		return view.TimeOperatorOfThisMonth
	case OfThisYear:
		return view.TimeOperatorOfThisYear
	default:
		return ""
	}
}

func (e ConditionNullableOperator) Into() view.NullableOperator {
	switch e {
	case Empty:
		return view.NullableOperatorEmpty
	case NotEmpty:
		return view.NullableOperatorNotEmpty
	default:
		return ""
	}
}

func (e ConditionMultipleOperator) Into() view.MultipleOperator {
	switch e {
	case IncludesAny:
		return view.MultipleOperatorIncludesAny
	case NotIncludesAny:
		return view.MultipleOperatorNotIncludesAny
	case IncludesAll:
		return view.MultipleOperatorIncludesAll
	case NotIncludesAll:
		return view.MultipleOperatorNotIncludesAll

	default:
		return ""
	}
}
