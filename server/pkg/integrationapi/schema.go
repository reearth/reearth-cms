package integrationapi

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemModelSchema struct {
	Item   Item   `json:"item"`
	Model  Model  `json:"model"`
	Schema Schema `json:"schema"`
}

type ItemModelSchemaItemChange struct {
	Item   Item   `json:"item"`
	Model  Model  `json:"model"`
	Schema Schema `json:"schema"`
	ItemChange []FieldChange   `json:"fieldschange"`
}

func NewItemModelSchema(i item.ItemModelSchema, assets *AssetContext) ItemModelSchema {
	return ItemModelSchema{
		Item:   NewItem(i.Item, i.Schema, assets),
		Model:  NewModel(i.Model, time.Time{}),
		Schema: NewSchema(i.Schema),
	}
}

func NewItemModelSchemaItemChange(i item.ItemModelSchemaItemChange, assets *AssetContext) ItemModelSchemaItemChange {
	return ItemModelSchemaItemChange{
		Item:   NewItem(i.Item, i.Schema, assets),
		Model:  NewModel(i.Model, time.Time{}),
		Schema: NewSchema(i.Schema),
		ItemChange: NewItemChange(i.OldFields, i.NewFields),
	}
}


func NewModel(m *model.Model, lastModified time.Time) Model {
	return Model{
		Id:           m.ID().Ref(),
		Key:          util.ToPtrIfNotEmpty(m.Key().String()),
		Name:         util.ToPtrIfNotEmpty(m.Name()),
		Description:  util.ToPtrIfNotEmpty(m.Description()),
		Public:       util.ToPtrIfNotEmpty(m.Public()),
		ProjectId:    m.Project().Ref(),
		SchemaId:     m.Schema().Ref(),
		CreatedAt:    lo.ToPtr(m.ID().Timestamp()),
		UpdatedAt:    lo.ToPtr(m.UpdatedAt()),
		LastModified: util.ToPtrIfNotEmpty(lastModified),
	}
}

func NewSchema(i *schema.Schema) Schema {
	fs := lo.Map(i.Fields(), func(f *schema.Field, _ int) SchemaField {
		return SchemaField{
			Id:       f.ID().Ref(),
			Type:     lo.ToPtr(ValueType(f.Type())),
			Key:      lo.ToPtr(f.Key().String()),
			Required: lo.ToPtr(f.Required()),
		}
	})

	return Schema{
		Id:        i.ID().Ref(),
		ProjectId: i.Project().Ref(),
		Fields:    &fs,
		CreatedAt: lo.ToPtr(i.ID().Timestamp()),
	}
}

func NewFieldChangeType(value string) *FieldChangeType {
	ft := FieldChangeType(value)
	return &ft
}

func NewItemChange(n []*item.Field, o []*item.Field) []FieldChange {
	nFields := make(map[string]*item.Field)
	oFields := make(map[string]*item.Field)

	for _, field := range n {
		if field != nil {
			nFields[field.FieldID().String()] = field
		}
	}
	for _, field := range o {
		if field != nil {
			oFields[field.FieldID().String()] = field
		}
	}

	var changes []FieldChange

	for fieldID, newField := range nFields {
		oldField, exists := oFields[fieldID]

		if exists && newField.Value().Equal(oldField.Value()) {
			continue
		}
		fieldIDPtr := newField.FieldID();
		change := FieldChange{
			Id:             &fieldIDPtr,
			Type:           NewFieldChangeType("update"),
			PreviousValue:  ToValues(newField.Value(), false, nil),
			CurrentValue:   ToValues(oldField.Value(), false, nil),
		}

		changes = append(changes, change)
	}

	for fieldID, _ := range oFields {
		_, exists := nFields[fieldID]
		if !exists {
			fieldIDPtr := oFields[fieldID].FieldID();
			change := FieldChange{
				Id:           &fieldIDPtr,
				Type:         NewFieldChangeType("add"),
				CurrentValue: ToValues(oFields[fieldID].Value(), false, nil),
			}

			changes = append(changes, change)
		}
	}

	for fieldID, _ := range nFields {
		_, exists := oFields[fieldID]
		if !exists {
			fieldIDPtr := nFields[fieldID].FieldID()
			change := FieldChange{
				Id:             &fieldIDPtr,
				Type:           NewFieldChangeType("delete"),
				PreviousValue:  nil,
				CurrentValue:   ToValues(nFields[fieldID].Value(), false, nil),
			}

			changes = append(changes, change)
		}
	}

	return changes
}
