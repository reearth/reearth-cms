package item

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func validateItem(fields Fields, sp *schema.Package, isMetadata bool, skip schema.FieldKeySet) schema.FieldValidationErrors {
	if sp == nil {
		return nil
	}

	target := sp.Schema()
	if isMetadata {
		target = sp.MetaSchema()
	}
	if target == nil {
		return nil
	}

	topLevel := lo.Filter(fields, func(f *Field, _ int) bool {
		return f.ItemGroup() == nil
	})

	errs := validateAgainstSchema(topLevel, target, nil, skip)
	if isMetadata {
		return errs
	}

	for _, gf := range target.FieldsByType(value.TypeGroup) {
		f := topLevel.Field(gf.ID())
		if f == nil {
			// absent-and-required was already reported by validateAgainstSchema above
			continue
		}
		instances, ok := f.Value().ValuesGroup()
		if !ok {
			continue
		}
		fg, ok := schema.FieldGroupFromTypeProperty(gf.TypeProperty())
		if !ok {
			continue
		}
		groupSchema := sp.GroupSchema(fg.Group())
		if groupSchema == nil {
			continue
		}
		for _, instanceID := range instances {
			errs = append(errs, validateAgainstSchema(fields.FieldsByGroup(instanceID), groupSchema, &instanceID, skip)...)
		}
	}

	return errs
}

func validateAgainstSchema(fields Fields, s *schema.Schema, group *ItemGroupID, skip schema.FieldKeySet) schema.FieldValidationErrors {
	if s == nil {
		return nil
	}

	fm := fields.Map()
	var errs schema.FieldValidationErrors
	for _, sf := range s.Fields() {
		if skip.Has(sf.ID(), group) {
			continue
		}

		f, ok := fm[sf.ID()]
		// validate a missing required field
		if !ok || f.Value().IsEmpty() {
			if sf.Required() {
				errs = append(errs, sf.ValidationError(schema.ErrValueRequired, schema.FieldValidationCodeRequired).WithGroup(group))
			}
			continue
		}

		// validate field constraints
		errs = append(errs, sf.Validate(f.Value()).WithGroup(group)...)
	}
	return errs
}
