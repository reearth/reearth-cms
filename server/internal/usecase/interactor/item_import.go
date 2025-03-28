package interactor

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/iancoleman/orderedmap"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var chunkSize = 1 * 1000

// region ImportRes

type ImportRes interfaces.ImportItemsResponse

func NewImportRes() ImportRes {
	return ImportRes{
		Total:     0,
		Inserted:  0,
		Updated:   0,
		Ignored:   0,
		NewFields: nil,
	}
}

func (ir *ImportRes) ItemInserted() {
	ir.Inserted++
	ir.Total++
}

func (ir *ImportRes) ItemUpdated() {
	ir.Updated++
	ir.Total++
}

func (ir *ImportRes) ItemSkipped() {
	ir.Ignored++
	ir.Total++
}

func (ir *ImportRes) FieldAdded(f *schema.Field) {
	ir.NewFields = append(ir.NewFields, f)
}

func (ir *ImportRes) Into() interfaces.ImportItemsResponse {
	return interfaces.ImportItemsResponse{
		Total:     ir.Total,
		Inserted:  ir.Inserted,
		Updated:   ir.Updated,
		Ignored:   ir.Ignored,
		NewFields: ir.NewFields,
	}
}

// endregion

func (i Item) Import(ctx context.Context, param interfaces.ImportItemsParam, operator *usecase.Operator) (interfaces.ImportItemsResponse, error) {
	res := NewImportRes()
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return res.Into(), interfaces.ErrInvalidOperator
	}

	s := param.SP.Schema()
	if !operator.IsWritableWorkspace(s.Workspace()) {
		return res.Into(), interfaces.ErrOperationDenied
	}

	prj, err := i.repos.Project.FindByID(ctx, s.Project())
	if err != nil {
		return res.Into(), err
	}

	m, err := i.repos.Model.FindByID(ctx, param.ModelID)
	if err != nil {
		return res.Into(), err
	}

	decoder := json.NewDecoder(param.Reader)

	// For FeatureCollection, skip to the features array
	if param.Format == interfaces.ImportFormatTypeGeoJSON {
		// Skip tokens until we find "features"
		for {
			token, err := decoder.Token()
			if err != nil {
				return res.Into(), fmt.Errorf("error reading token: %v", err)
			}
			if str, ok := token.(string); ok && str == "features" {
				break
			}
		}
	}

	// Read the opening bracket of array
	_, err = decoder.Token()
	if err != nil {
		return res.Into(), fmt.Errorf("error reading array start: %v", err)
	}

	count, first := 0, true
	var rawJSON json.RawMessage

	var jsonChunk []map[string]any
	for decoder.More() {
		count++

		if err := decoder.Decode(&rawJSON); err != nil {
			return res.Into(), fmt.Errorf("Error decoding raw message: %v\n", err)
		}

		// guess schema fields from first object using ordered map to keep fields order
		if param.MutateSchema && first {
			orderedMap := orderedmap.New()
			if err := json.Unmarshal(rawJSON, &orderedMap); err != nil {
				return res.Into(), fmt.Errorf("error decoding JSON object: %v", err)
			}

			fieldsParams, err := guessSchemaFields(param.SP, orderedMap, param.Format == interfaces.ImportFormatTypeGeoJSON)
			if err != nil {
				return res.Into(), fmt.Errorf("error guessing schema fields: %v", err)
			}

			fields, err := i.updateSchema(ctx, s, fieldsParams)
			if err != nil {
				return res.Into(), fmt.Errorf("error saving schema fields: %v", err)
			}

			for _, f := range fields {
				res.FieldAdded(f)
			}

			first = false
		}

		var obj map[string]any
		if err := json.Unmarshal(rawJSON, &obj); err != nil {
			return res.Into(), fmt.Errorf("error decoding JSON object: %v", err)
		}
		jsonChunk = append(jsonChunk, obj)

		if count == chunkSize || !decoder.More() {
			items, err := itemsParamsFrom(jsonChunk, param.Format == interfaces.ImportFormatTypeGeoJSON, param.GeoField, param.SP)
			if err != nil {
				return res.Into(), err
			}
			err = i.saveChunk(ctx, prj, m, s, param, items, &res, operator)
			if err != nil {
				return res.Into(), err
			}
			log.Printf("chunk with %d items saved.", count)
			count, jsonChunk = 0, nil
		}
	}
	return res.Into(), nil
}

func (i Item) TriggerImportJob(ctx context.Context, aId id.AssetID, mId id.ModelID, format, strategy, geoFieldKey string, mutateSchema bool, operator *usecase.Operator) error {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return interfaces.ErrInvalidOperator
	}

	if i.gateways.TaskRunner == nil {
		log.Info("item: import skipped because task runner is not configured")
		return nil
	}

	taskPayload := task.ImportPayload{
		ModelId:          mId.String(),
		AssetId:          aId.String(),
		Format:           format,
		GeometryFieldKey: geoFieldKey,
		Strategy:         strategy,
		MutateSchema:     mutateSchema,
	}
	if operator.AcOperator.User != nil {
		taskPayload.UserId = operator.AcOperator.User.String()
	}
	if operator.Integration != nil {
		taskPayload.IntegrationId = operator.Integration.String()
	}

	if err := i.gateways.TaskRunner.Run(ctx, taskPayload.Payload()); err != nil {
		return fmt.Errorf("failed to trigger import event: %w", err)
	}

	log.Info("item: successfully triggered import event")
	return nil
}

func (i Item) saveChunk(ctx context.Context, prj *project.Project, m *model.Model, s *schema.Schema, param interfaces.ImportItemsParam, items []interfaces.ImportItemParam, res *ImportRes, operator *usecase.Operator) error {
	itemsIds := lo.FilterMap(items, func(i interfaces.ImportItemParam, _ int) (item.ID, bool) {
		if i.ItemId != nil {
			return *i.ItemId, true
		}
		return item.ID{}, false
	})
	oldItems, err := i.repos.Item.FindByIDs(ctx, itemsIds, nil)
	if err != nil {
		return err
	}

	metaItemsIds := lo.FilterMap(items, func(i interfaces.ImportItemParam, _ int) (item.ID, bool) {
		if i.MetadataID != nil {
			return *i.MetadataID, true
		}
		return item.ID{}, false
	})
	oldMetaItems, err := i.repos.Item.FindByIDs(ctx, metaItemsIds, nil)
	if err != nil {
		return err
	}

	isMetadata := false
	if m.Metadata() != nil && s.ID() == *m.Metadata() {
		isMetadata = true
	}

	type itemChanges struct {
		oldFields item.Fields
		action    interfaces.ImportStrategyType
	}
	f := func(ctx context.Context) (item.List, map[item.ID]itemChanges, error) {
		itemsToSave := item.List{}
		itemsEvent := map[item.ID]itemChanges{}

		for _, itemParam := range items {

			var oldItem *item.Item
			if itemParam.ItemId != nil {
				if itm := oldItems.Item(*itemParam.ItemId); itm != nil {
					oldItem = itm.Value()
				}
			}

			// strategy: insert. 	item: exists  				=> ignore
			if param.Strategy == interfaces.ImportStrategyTypeInsert && oldItem != nil {
				res.ItemSkipped()
				continue
			}

			// strategy: update. 	item: not exists 			=> ignore
			if param.Strategy == interfaces.ImportStrategyTypeUpdate && oldItem == nil {
				res.ItemSkipped()
				continue
			}

			action := param.Strategy
			if action == interfaces.ImportStrategyTypeUpsert {
				if oldItem != nil {
					action = interfaces.ImportStrategyTypeUpdate
				} else {
					action = interfaces.ImportStrategyTypeInsert
				}
			}

			// strategy: update. 	item: exists & !permission 	=> error
			if action == interfaces.ImportStrategyTypeUpdate && !operator.CanUpdate(oldItem) {
				return nil, nil, interfaces.ErrOperationDenied
			}

			// TODO: more validation
			// 	schema: immutable. 	field: not exists 			=> ignore
			// 	schema: x. 			field: type mismatch 		=> ignore

			var it *item.Item
			if action == interfaces.ImportStrategyTypeInsert {
				ib := item.New().
					NewID().
					Schema(s.ID()).
					IsMetadata(isMetadata).
					Project(s.Project()).
					Model(m.ID())

				if operator.AcOperator.User != nil {
					ib = ib.User(*operator.AcOperator.User)
				}
				if operator.Integration != nil {
					ib = ib.Integration(*operator.Integration)
				}

				it, err = ib.Build()
				if err != nil {
					return nil, nil, err
				}
			} else {
				it = oldItem
				if operator.AcOperator.User != nil {
					it.SetUpdatedByUser(*operator.AcOperator.User)
				} else if operator.Integration != nil {
					it.SetUpdatedByIntegration(*operator.Integration)
				}

				// TODO: check if we should handel the version
				//  A: do not check
			}

			var mi item.Versioned
			if itemParam.MetadataID != nil {
				mi = oldMetaItems.Item(*itemParam.MetadataID)
				if m.Metadata() == nil || *m.Metadata() != mi.Value().Schema() {
					return nil, nil, interfaces.ErrMetadataMismatch
				}

				if it.MetadataItem() != nil && *it.MetadataItem() != *itemParam.MetadataID {
					return nil, nil, interfaces.ErrMetadataMismatch
				}
				it.SetMetadataItem(*itemParam.MetadataID)

				if mi.Value().OriginalItem() != nil && *mi.Value().OriginalItem() != it.ID() {
					return nil, nil, interfaces.ErrMetadataMismatch
				}
				mi.Value().SetOriginalItem(it.ID())
				itemsToSave = append(itemsToSave, mi.Value())
			}

			modelSchemaFields, otherFields := filterFieldParamsBySchema(itemParam.Fields, s)

			fields, err := itemFieldsFromParams(modelSchemaFields, s)
			if err != nil {
				return nil, nil, err
			}

			if err := i.checkUnique(ctx, fields, s, m.ID(), nil); err != nil {
				return nil, nil, err
			}

			oldFields := it.Fields()
			it.UpdateFields(fields)

			groupFields, _, err := i.handleGroupFields(ctx, otherFields, s, m.ID(), it.Fields())
			if err != nil {
				return nil, nil, err
			}

			it.UpdateFields(groupFields)

			if err = i.handleReferenceFields(ctx, *s, it, oldFields); err != nil {
				return nil, nil, err
			}

			itemsToSave = append(itemsToSave, it)

			if isMetadata {
				continue
			}
			itemsEvent[it.ID()] = itemChanges{
				oldFields: oldFields,
				action:    action,
			}

			if action == interfaces.ImportStrategyTypeInsert {
				res.ItemInserted()
			} else {
				res.ItemUpdated()
			}
		}
		if err := i.repos.Item.SaveAll(ctx, itemsToSave); err != nil {
			return nil, nil, err
		}
		return itemsToSave, itemsEvent, nil
	}

	_, _, err = Run2(ctx, operator, i.repos, Usecase().Transaction(), f)
	if err != nil {
		return err
	}

	//  TODO: create ItemsImported event

	return err
}

func (i Item) updateSchema(ctx context.Context, s *schema.Schema, params []interfaces.CreateFieldParam) (schema.FieldList, error) {
	var fields schema.FieldList
	for _, fieldParam := range params {
		if fieldParam.Key == "" || s.HasFieldByKey(fieldParam.Key) {
			return nil, schema.ErrInvalidKey
		}

		f, err := schema.NewFieldWithDefaultProperty(fieldParam.Type).
			NewID().
			Unique(fieldParam.Unique).
			Multiple(fieldParam.Multiple).
			Required(fieldParam.Required).
			Name(fieldParam.Name).
			Description(lo.FromPtr(fieldParam.Description)).
			Key(id.NewKey(fieldParam.Key)).
			DefaultValue(fieldParam.DefaultValue).
			Build()
		if err != nil {
			return nil, err
		}

		s.AddField(f)
		fields = append(fields, f)
	}
	err := i.repos.Schema.Save(ctx, s)
	if err != nil {
		return nil, err
	}
	log.Infof("schema %s updated, %v new field saved.", s.ID(), len(params))
	return fields, nil
}

func guessSchemaFields(sp schema.Package, orderedMap *orderedmap.OrderedMap, isGeoJson bool) ([]interfaces.CreateFieldParam, error) {
	fields := make([]interfaces.CreateFieldParam, 0)
	if isGeoJson {
		properties, ok := orderedMap.Get("properties")
		if !ok {
			return nil, rerror.ErrInvalidParams
		}
		orderedMap = lo.ToPtr(properties.(orderedmap.OrderedMap))
	}
	for _, k := range orderedMap.Keys() {
		v, _ := orderedMap.Get(k)
		if k == "id" {
			continue
		}

		key := id.NewKey(k)
		if !key.IsValid() {
			return nil, rerror.ErrInvalidParams
		}
		newField := fieldFrom(key.String(), v, sp)
		f := sp.FieldByIDOrKey(nil, &key)
		if f != nil && !isAssignable(newField.Type, f.Type()) {
			continue
		}

		if f == nil {
			prevField, found := lo.Find(fields, func(fp interfaces.CreateFieldParam) bool {
				return fp.Key == key.String()
			})
			if found && prevField.Type != newField.Type {
				return nil, rerror.NewE(i18n.T("data type mismatch"))
			}
			if !found {
				fields = append(fields, newField)
			}
		}

	}
	return fields, nil
}

func fieldFrom(k string, v any, sp schema.Package) interfaces.CreateFieldParam {
	t := value.TypeText
	if v != nil {
		switch reflect.TypeOf(v).Kind() {
		case reflect.Bool:
			t = value.TypeBool
		case reflect.Int:
		case reflect.Int8:
		case reflect.Int16:
		case reflect.Int32:
		case reflect.Int64:
		case reflect.Uint:
		case reflect.Uint8:
		case reflect.Uint16:
		case reflect.Uint32:
		case reflect.Uint64:
		case reflect.Float32:
		case reflect.Float64:
			t = value.TypeNumber
		case reflect.String:
			t = value.TypeText
		default:
		}
	}
	return interfaces.CreateFieldParam{
		ModelID:     nil,
		SchemaID:    sp.Schema().ID(),
		Type:        t,
		Name:        k,
		Description: lo.ToPtr("auto created by json/geoJson import"),
		Key:         k,
		// type property is not supported in import
		TypeProperty: nil,
	}
}

func isAssignable(vt1, vt2 value.Type) bool {
	if vt1 == vt2 {
		return true
	}
	if vt1 == value.TypeInteger &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown || vt2 == value.TypeNumber) {
		return true
	}
	if vt1 == value.TypeNumber &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeBool &&
		(vt2 == value.TypeCheckbox || vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeText &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	return false
}

func itemsParamsFrom(chunk []map[string]any, isGeoJson bool, geoField *string, sp schema.Package) ([]interfaces.ImportItemParam, error) {
	if isGeoJson && geoField == nil {
		return nil, rerror.ErrInvalidParams
	}
	items := make([]interfaces.ImportItemParam, 0)
	for _, o := range chunk {
		item := interfaces.ImportItemParam{}
		if isGeoJson {
			if geoField == nil {
				return nil, rerror.ErrInvalidParams
			}

			geoFieldKey := id.NewKey(*geoField)
			if !geoFieldKey.IsValid() {
				return nil, rerror.ErrInvalidParams
			}
			geoFieldId := id.FieldIDFromRef(geoField)
			f := sp.FieldByIDOrKey(geoFieldId, &geoFieldKey)
			if f == nil { // TODO: check GeoField type
				return nil, rerror.ErrInvalidParams
			}

			v, err := json.Marshal(o["geometry"])
			if err != nil {
				return nil, err
			}
			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: f.ID().Ref(),
				Key:   f.Key().Ref(),
				Value: string(v),
				// Group is not supported
				Group: nil,
			})

			props, ok := o["properties"].(map[string]any)
			if !ok {
				continue
			}
			o = props
		}
		for k, v := range o {
			if k == "id" {
				var iId *id.ItemID
				idStr, ok := v.(string)
				if !ok {
					return nil, rerror.ErrInvalidParams
				}
				iId = id.ItemIDFromRef(&idStr)
				if iId.IsEmpty() || iId.IsNil() {
					return nil, rerror.ErrInvalidParams
				}
				item.ItemId = iId
				continue
			}
			key := id.NewKey(k)
			if !key.IsValid() {
				return nil, rerror.ErrInvalidParams
			}

			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: nil,
				Key:   key.Ref(),
				Value: v,
				// Group is not supported
				Group: nil,
			})
		}
		items = append(items, item)
	}
	return items, nil
}
