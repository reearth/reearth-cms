package item

import (
	"slices"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var ErrInvalidField = rerror.NewE(i18n.T("invalid field"))

type FieldInput struct {
	Field *FieldID
	Key   *id.Key
	Group *ItemGroupID
	Value any
}

type FieldInputList []FieldInput

func (l FieldInputList) TopLevel() FieldInputList {
	return lo.Filter(l, func(in FieldInput, _ int) bool {
		return in.Group == nil
	})
}

func (l FieldInputList) InGroups(igs id.ItemGroupIDList) FieldInputList {
	return lo.Filter(l, func(in FieldInput, _ int) bool {
		return in.Group != nil && slices.Contains(igs, *in.Group)
	})
}

func (l FieldInputList) Has(fid FieldID, group *ItemGroupID) bool {
	return lo.ContainsBy(l, func(in FieldInput) bool {
		return in.Field != nil && *in.Field == fid && lo.FromPtr(in.Group) == lo.FromPtr(group)
	})
}
