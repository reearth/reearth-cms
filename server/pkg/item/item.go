package item

import (
	"slices"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"

	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Item struct {
	id                   ID
	schema               SchemaID
	model                ModelID
	project              ProjectID
	fields               []*Field
	timestamp            time.Time
	thread               *ThreadID
	isMetadata           bool
	isAnonymous          bool
	user                 *UserID
	updatedByUser        *UserID
	updatedByIntegration *IntegrationID
	metadataItem         *id.ItemID
	originalItem         *id.ItemID
	integration          *IntegrationID
}

type Versioned = *version.Value[*Item]

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) User() *UserID {
	return i.user
}

func (i *Item) Integration() *IntegrationID {
	return i.integration
}

func (i *Item) Fields() Fields {
	return slices.Clone(i.fields)
}

func (i *Item) Project() ProjectID {
	return i.project
}

func (i *Item) Model() ModelID {
	return i.model
}

func (i *Item) Schema() SchemaID {
	return i.schema
}

func (i *Item) Timestamp() time.Time {
	return i.timestamp
}

func (i *Item) MetadataItem() *ID {
	return i.metadataItem
}

func (i *Item) IsMetadata() bool {
	return i.isMetadata
}

func (i *Item) IsAnonymous() bool {
	return i.isAnonymous
}

func (i *Item) OriginalItem() *ID {
	return i.originalItem
}

func (i *Item) Field(f FieldID) *Field {
	ff, _ := lo.Find(i.fields, func(g *Field) bool {
		return g.FieldID() == f
	})
	return ff
}

func (i *Item) FieldByItemGroupAndID(fid FieldID, igID ItemGroupID) *Field {
	ff, _ := lo.Find(i.fields, func(g *Field) bool {
		if g.group == nil {
			return false
		}
		return g.FieldID() == fid && *g.group == igID
	})
	return ff
}

func (i *Item) Thread() *ThreadID {
	return i.thread
}

func (i *Item) UpdatedByUser() *UserID {
	return i.updatedByUser
}

func (i *Item) UpdatedByIntegration() *IntegrationID {
	return i.updatedByIntegration
}

func (i *Item) SetUpdatedByIntegration(u IntegrationID) {
	i.updatedByIntegration = &u
	i.updatedByUser = nil
}

func (i *Item) SetUpdatedByUser(u UserID) {
	i.updatedByUser = &u
	i.updatedByIntegration = nil
}

func (i *Item) updateFields(fields []*Field) {
	if fields == nil {
		return
	}

	newFields := lo.Filter(fields, func(field *Field, _ int) bool {
		if field == nil {
			return false
		}
		if field.ItemGroup() == nil {
			return i.Field(field.field) == nil
		}
		return i.FieldByItemGroupAndID(field.FieldID(), *field.ItemGroup()) == nil
	})

	i.fields = append(lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		ff, found := lo.Find(fields, func(g *Field) bool {
			if g == nil || f == nil {
				return false
			}
			if g.FieldID() != f.FieldID() {
				return false
			}
			// both must have the same group: both nil or both equal
			if g.group == nil && f.group == nil {
				return true
			}
			return g.group != nil && f.group != nil && *g.group == *f.group
		})

		if !found {
			return f, true
		}

		return ff, true
	}), newFields...)

	i.cleanGroups()

	i.timestamp = util.Now()
}

func (i *Item) SetReference(fid FieldID, ref ID) {
	i.updateFields([]*Field{NewField(fid, value.NewMultiple(value.TypeReference, []any{ref}), nil)})
}

func (i *Item) ClearReference(fid FieldID, refs IDList) bool {
	f := i.Field(fid)
	if f == nil {
		return false
	}

	kept := make([]any, 0, f.Value().Len())
	for _, v := range f.Value().Values() {
		if ref, ok := v.ValueReference(); ok && refs.Has(ref) {
			continue
		}
		kept = append(kept, v.Value())
	}
	if len(kept) == f.Value().Len() {
		return false
	}

	i.updateFields([]*Field{NewField(fid, value.NewMultiple(value.TypeReference, kept), f.ItemGroup())})
	return true
}

func (i *Item) ApplyInput(inputs FieldInputList, sp *schema.Package) (changed Fields, errs schema.FieldValidationErrors, err error) {
	if sp == nil {
		return nil, nil, rerror.ErrNotFound
	}
	s := sp.SchemaByID(i.schema)
	if s == nil {
		return nil, nil, rerror.ErrNotFound
	}

	// unknown top-level fields are ignored
	topLevel := lo.Filter(inputs.TopLevel(), func(in FieldInput, _ int) bool {
		return s.FieldByIDOrKey(in.Field, in.Key) != nil
	})
	changed, errs = parseInputs(topLevel, s)
	i.updateFields(changed)

	if !i.isMetadata {
		groupFields, groupErrs, err := parseGroupInputs(inputs, sp, i.Fields())
		if err != nil {
			return nil, nil, err
		}
		i.updateFields(groupFields)
		changed = append(changed, groupFields...)
		errs = append(errs, groupErrs...)
	}

	errs = append(errs, validateItem(i.fields, sp, i.isMetadata, errs.Keys())...)
	return changed, errs, nil
}

func parseInputs(inputs FieldInputList, s *schema.Schema) (Fields, schema.FieldValidationErrors) {
	var fields Fields
	var errs schema.FieldValidationErrors
	for _, in := range inputs {
		sf := s.FieldByIDOrKey(in.Field, in.Key)
		if sf == nil {
			errs = append(errs, schema.FieldValidationError{
				Field:  in.Field,
				Key:    in.Key,
				Code:   schema.FieldValidationCodeNotFound,
				Detail: schema.ErrFieldNotFound,
			}.WithGroup(in.Group))
			continue
		}

		m, fieldErrs := sf.ParseValue(in.Value)
		errs = append(errs, fieldErrs.WithGroup(in.Group)...)
		fields = append(fields, NewField(sf.ID(), m, in.Group))
	}
	return fields, errs
}

func parseGroupInputs(inputs FieldInputList, sp *schema.Package, itemFields Fields) (Fields, schema.FieldValidationErrors, error) {
	var res Fields
	var errs schema.FieldValidationErrors
	for _, field := range itemFields.FieldsByType(value.TypeGroup) {
		sf := sp.Schema().Field(field.FieldID())
		if sf == nil {
			continue
		}
		fieldGroup, ok := schema.FieldGroupFromTypeProperty(sf.TypeProperty())
		if !ok {
			return nil, nil, ErrInvalidField
		}

		groupSchema := sp.GroupSchema(fieldGroup.Group())
		if groupSchema == nil {
			return nil, nil, rerror.ErrNotFound
		}

		mvg, ok := field.Value().ValuesGroup()
		if !ok {
			// the group instances can't be resolved, so the fields inside them can't be validated
			errs = append(errs, sf.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch))
			continue
		}

		fields, fieldErrs := parseInputs(inputs.InGroups(mvg), groupSchema)
		errs = append(errs, fieldErrs...)
		res = append(res, fields...)
	}
	return res, errs, nil
}

func (i *Item) AttachDefault(sp *schema.Package) {
	if i == nil || sp == nil {
		return
	}
	attach := func(s *schema.Schema) {
		for _, f := range s.Fields() {
			if f.DefaultValue() != nil && i.Field(f.ID()) == nil {
				i.fields = append(i.fields, NewField(f.ID(), f.DefaultValue(), nil))
			}
		}
	}
	if i.isMetadata {
		attach(sp.MetaSchema())
		return
	}
	attach(sp.Schema())
	// TODO: attach default values for groups
}

func (i *Item) cleanGroups() {
	i.fields = lo.Filter(i.fields, func(f *Field, _ int) bool {
		if f.ItemGroup() == nil {
			return true
		}
		for _, gf := range i.Fields().FieldsByType(value.TypeGroup) {
			igs, ok := gf.value.ValuesGroup()
			if !ok {
				continue
			}
			if slices.Contains(igs, *f.ItemGroup()) {
				return true
			}
		}
		return false
	})
	i.timestamp = util.Now()
}

func (i *Item) ClearField(fid FieldID) {
	i.fields = lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		return f, f.FieldID() != fid
	})

	i.timestamp = util.Now()
}

func (i *Item) ClearReferenceFields() {
	i.fields = lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		return f, f.Type() != value.TypeReference
	})

	i.timestamp = util.Now()
}

func (i *Item) FilterFields(list FieldIDList) *Item {
	if i == nil || list == nil {
		return nil
	}

	fields := lo.Filter(i.fields, func(f *Field, i int) bool {
		return list.Has(f.FieldID())
	})
	i.fields = fields
	return i
}

func (i *Item) HasField(fid FieldID, value any) bool {
	for _, field := range i.fields {
		if field.field == fid && field.value == value {
			return true
		}
	}
	return false
}

func (i *Item) AssetIDs() AssetIDList {
	fm := lo.FlatMap(i.fields, func(f *Field, _ int) []*value.Value {
		return f.Value().Values()
	})
	return lo.FilterMap(fm, func(v *value.Value, _ int) (AssetID, bool) {
		return v.ValueAsset()
	})
}

func (i *Item) AssetIDsBySchema(sp schema.Package) AssetIDList {
	sAssetsFields := sp.FieldsByType(value.TypeAsset)
	if len(sAssetsFields) == 0 {
		return nil
	}
	ids := lo.FlatMap(i.Fields().Filter(sAssetsFields.IDs()), func(f *Field, _ int) []*value.Value {
		sf := sAssetsFields.Find(f.FieldID())
		if sf == nil {
			return nil
		}
		if sf.Multiple() {
			return f.Value().Values()
		}
		if v := f.Value().First(); v != nil {
			return []*value.Value{v}
		}
		return nil
	})
	return lo.FilterMap(ids, func(v *value.Value, _ int) (AssetID, bool) {
		return v.ValueAsset()
	})
}

func (i *Item) refItemsIDs(sp schema.Package, filter func(*schema.Field) bool) IDList {
	sRefFields := sp.FieldsByType(value.TypeReference)
	if len(sRefFields) == 0 {
		return nil
	}
	ids := lo.FlatMap(i.Fields().Filter(sRefFields.IDs()), func(f *Field, _ int) []*value.Value {
		sf := sRefFields.Find(f.FieldID())
		if sf == nil {
			return nil
		}
		if filter != nil && !filter(sf) {
			return nil
		}
		if sf.Multiple() {
			return f.Value().Values()
		}
		if v := f.Value().First(); v != nil {
			return []*value.Value{v}
		}
		return nil
	})
	validIDs := lo.FilterMap(ids, func(v *value.Value, _ int) (ID, bool) {
		if refID, ok := v.Value().(ID); ok {
			return refID, true
		}
		return ID{}, false
	})
	return lo.Uniq(validIDs)
}

func (i *Item) RefItemsIDs(sp schema.Package) IDList {
	return i.refItemsIDs(sp, nil)
}

func (i *Item) RefItemsIDsByModels(sp schema.Package, modelIDs id.ModelIDList) IDList {
	return i.refItemsIDs(sp, func(sf *schema.Field) bool {
		found := false
		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Reference: func(rf *schema.FieldReference) {
				if modelIDs.Has(rf.Model()) {
					found = true
				}
			},
		})
		return found
	})
}

func (i *Item) GetTitle(s *schema.Schema) *string {
	if s == nil || s.TitleField() == nil {
		return nil
	}
	sf := s.Field(*s.TitleField())
	if sf == nil {
		return nil
	}
	f := i.Field(sf.ID())
	if f == nil {
		return nil
	}
	vv, ok := f.Value().First().Value().(string)
	if !ok {
		return nil
	}
	return &vv
}

type ItemModelSchema struct {
	Item            *Item
	ReferencedItems []Versioned
	Model           *model.Model
	Schema          *schema.Schema
	GroupSchemas    schema.List
	Changes         FieldChanges
}

func (i *Item) SetMetadataItem(iid id.ItemID) {
	i.metadataItem = &iid
}

func (i *Item) SetOriginalItem(iid id.ItemID) {
	i.originalItem = &iid
}

func (i *Item) SetThread(thid id.ThreadID) {
	i.thread = &thid
}

func (i *Item) Clone() *Item {
	if i == nil {
		return nil
	}

	fields := lo.Map(i.fields, func(f *Field, _ int) *Field {
		return f.Clone()
	})

	return &Item{
		id:                   i.id,
		schema:               i.schema,
		model:                i.model,
		project:              i.project,
		fields:               fields,
		timestamp:            i.timestamp,
		thread:               i.thread,
		isMetadata:           i.isMetadata,
		isAnonymous:          i.isAnonymous,
		user:                 i.user,
		updatedByUser:        i.updatedByUser,
		updatedByIntegration: i.updatedByIntegration,
		integration:          i.integration,
		metadataItem:         i.metadataItem,
		originalItem:         i.originalItem,
	}
}
