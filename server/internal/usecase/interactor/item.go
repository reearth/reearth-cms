package interactor

import (
	"context"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const maxPerPage = 100
const defaultPerPage int64 = 50

type Item struct {
	repos       *repo.Container
	gateways    *gateway.Container
	ignoreEvent bool
}

func NewItem(r *repo.Container, g *gateway.Container) *Item {
	return &Item{
		repos:    r,
		gateways: g,
	}
}

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindByID(ctx, itemID, nil)
}

func (i Item) FindPublicByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindByID(ctx, itemID, version.Public.Ref())
}

func (i Item) FindByIDs(ctx context.Context, ids id.ItemIDList, _ *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindByIDs(ctx, ids, nil)
}

func (i Item) ItemStatus(ctx context.Context, itemsIds id.ItemIDList, _ *usecase.Operator) (map[id.ItemID]item.Status, error) {
	requests, err := i.repos.Request.FindByItems(ctx, itemsIds, nil)
	if err != nil {
		return nil, err
	}
	items, err := i.repos.Item.FindAllVersionsByIDs(ctx, itemsIds)
	if err != nil {
		return nil, err
	}
	res := map[id.ItemID]item.Status{}
	for _, itemId := range itemsIds {
		s := item.StatusDraft
		latest, _ := lo.Find(items, func(v item.Versioned) bool {
			return v.Value().ID() == itemId && v.Refs().Has(version.Latest)
		})
		hasPublicVersion := lo.ContainsBy(items, func(v item.Versioned) bool {
			return v.Value().ID() == itemId && v.Refs().Has(version.Public)
		})
		if hasPublicVersion {
			s = s.Wrap(item.StatusPublic)
		}
		hasApprovedRequest, hasWaitingRequest := false, false
		for _, r := range requests {
			if !r.Items().IDs().Has(itemId) {
				continue
			}
			switch r.State() {
			case request.StateApproved:
				hasApprovedRequest = true
			case request.StateWaiting:
				hasWaitingRequest = true
			}
			if hasApprovedRequest && hasWaitingRequest {
				break
			}
		}

		if hasPublicVersion && !latest.Refs().Has(version.Public) {
			s = s.Wrap(item.StatusChanged)
		}
		if hasWaitingRequest {
			s = s.Wrap(item.StatusReview)
		}
		res[itemId] = s
	}
	return res, nil
}

func (i Item) FindPublicByModel(ctx context.Context, modelID id.ModelID, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return nil, nil, err
	}
	// TODO: check operation for projects that publication type is limited
	return i.repos.Item.FindByModel(ctx, m.ID(), version.Public.Ref(), nil, p)
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, sort *usecasex.Sort, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.FindBySchema(ctx, schemaID, nil, sort, p)
}

func (i Item) FindByAssets(ctx context.Context, list id.AssetIDList, _ *usecase.Operator) (map[id.AssetID]item.VersionedList, error) {
	itms, err := i.repos.Item.FindByAssets(ctx, list, nil)
	if err != nil {
		return nil, err
	}
	res := map[id.AssetID]item.VersionedList{}
	for _, aid := range list {
		for _, itm := range itms {
			if itm.Value().AssetIDs().Has(aid) && !slices.Contains(res[aid], itm) {
				res[aid] = append(res[aid], itm)
			}
		}
	}
	return res, nil
}

func (i Item) FindVersionByID(ctx context.Context, itemID id.ItemID, ver version.VersionOrRef, _ *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindVersionByID(ctx, itemID, ver)
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
}

func (i Item) Search(ctx context.Context, sp schema.Package, q *item.Query, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, sp, q, p)
}

func (i Item) IsItemReferenced(ctx context.Context, itemID id.ItemID, correspondingFieldID id.FieldID, _ *usecase.Operator) (bool, error) {
	itm, err := i.repos.Item.FindByID(ctx, itemID, nil)
	if err != nil {
		return false, err
	}

	s, err := i.repos.Schema.FindByID(ctx, itm.Value().Schema())
	if err != nil {
		return false, err
	}

	if itm == nil || s == nil {
		return false, nil
	}

	for _, f := range s.FieldsByType(value.TypeReference) {
		fr, ok := schema.FieldReferenceFromTypeProperty(f.TypeProperty())
		if !ok {
			continue
		}
		if fr.CorrespondingFieldID() != nil && *fr.CorrespondingFieldID() == correspondingFieldID {
			itmf := itm.Value().Field(f.ID())
			if itmf == nil {
				continue
			}
			vr, ok := itmf.Value().First().ValueReference()
			if ok && !vr.IsEmpty() {
				return true, nil
			}
		}
	}

	return false, nil
}

func (i Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (item.Versioned, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.Versioned, error) {
		m, err := i.repos.Model.FindByID(ctx, param.ModelID)
		if err != nil {
			return nil, err
		}
		//if m.Schema() != param.SchemaID {
		//	return nil, interfaces.ErrInvalidSchema
		//}

		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return nil, interfaces.ErrOperationDenied
		}

		modelSchemaFields, otherFields := filterFieldParamsBySchema(param.Fields, s)

		fields, err := itemFieldsFromParams(modelSchemaFields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, m.ID(), nil); err != nil {
			return nil, err
		}

		groupFields, groupSchemas, err := i.handleGroupFields(ctx, otherFields, s, m.ID(), fields)
		if err != nil {
			return nil, err
		}

		isMetadata := false
		if m.Metadata() != nil && param.SchemaID == *m.Metadata() {
			isMetadata = true
		}
		fields = append(fields, groupFields...)
		ib := item.New().
			NewID().
			Schema(s.ID()).
			IsMetadata(isMetadata).
			Project(s.Project()).
			Model(m.ID()).
			Fields(fields)

		if operator.AcOperator.User != nil {
			ib = ib.User(*operator.AcOperator.User)
		}
		if operator.Integration != nil {
			ib = ib.Integration(*operator.Integration)
		}

		var mi item.Versioned
		if param.MetadataID != nil {
			mi, err = i.repos.Item.FindByID(ctx, *param.MetadataID, nil)
			if err != nil {
				return nil, err
			}
			if m.Metadata() == nil || *m.Metadata() != mi.Value().Schema() {
				return nil, interfaces.ErrMetadataMismatch
			}
			ib = ib.MetadataItem(param.MetadataID)
		}

		it, err := ib.Build()
		if err != nil {
			return nil, err
		}

		if err = i.handleReferenceFields(ctx, *s, it, item.Fields{}); err != nil {
			return nil, err
		}

		if err := i.repos.Item.Save(ctx, it); err != nil {
			return nil, err
		}

		if mi != nil {
			mi.Value().SetOriginalItem(it.ID())
			if err := i.repos.Item.Save(ctx, mi.Value()); err != nil {
				return nil, err
			}
		}

		vi, err := i.repos.Item.FindByID(ctx, it.ID(), nil)
		if err != nil {
			return nil, err
		}

		refItems, err := i.getReferencedItems(ctx, fields)
		if err != nil {
			return nil, err
		}

		if isMetadata {
			return vi, nil
		}

		prj, err := i.repos.Project.FindByID(ctx, s.Project())
		if err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Project:   prj,
			Workspace: s.Workspace(),
			Type:      event.ItemCreate,
			Object:    vi,
			WebhookObject: item.ItemModelSchema{
				Item:            vi.Value(),
				Model:           m,
				Schema:          s,
				GroupSchemas:    groupSchemas,
				ReferencedItems: refItems,
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return vi, nil
	})
}

func (i Item) LastModifiedByModel(ctx context.Context, model id.ModelID, _ *usecase.Operator) (time.Time, error) {
	return i.repos.Item.LastModifiedByModel(ctx, model)
}

func (i Item) Update(ctx context.Context, param interfaces.UpdateItemParam, operator *usecase.Operator) (item.Versioned, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	if len(param.Fields) == 0 {
		return nil, interfaces.ErrItemFieldRequired
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.Versioned, error) {
		itm, err := i.repos.Item.FindByID(ctx, param.ItemID, nil)
		if err != nil {
			return nil, err
		}
		itv := itm.Value()
		if !operator.CanUpdate(itv) {
			return nil, interfaces.ErrOperationDenied
		}

		m, err := i.repos.Model.FindByID(ctx, itv.Model())
		if err != nil {
			return nil, err
		}

		if param.Version != nil && itm.Version() != *param.Version {
			return nil, interfaces.ErrItemConflicted
		}

		s, err := i.repos.Schema.FindByID(ctx, itv.Schema())
		if err != nil {
			return nil, err
		}

		modelSchemaFields, otherFields := filterFieldParamsBySchema(param.Fields, s)

		fields, err := itemFieldsFromParams(modelSchemaFields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, itv.Model(), itv); err != nil {
			return nil, err
		}

		oldFields := itv.Fields()
		itv.UpdateFields(fields)

		groupFields, groupSchemas, err := i.handleGroupFields(ctx, otherFields, s, m.ID(), itv.Fields())
		if err != nil {
			return nil, err
		}
		itv.UpdateFields(groupFields)

		if operator.AcOperator.User != nil {
			itv.SetUpdatedByUser(*operator.AcOperator.User)
		} else if operator.Integration != nil {
			itv.SetUpdatedByIntegration(*operator.Integration)
		}

		var mi item.Versioned
		if param.MetadataID != nil {
			mi, err = i.repos.Item.FindByID(ctx, *param.MetadataID, nil)
			if err != nil {
				return nil, err
			}
			if m.Metadata() == nil || *m.Metadata() != mi.Value().Schema() {
				return nil, interfaces.ErrMetadataMismatch
			}
			itv.SetMetadataItem(*param.MetadataID)
			if mi.Value().OriginalItem() == nil {
				mi.Value().SetOriginalItem(itv.ID())
				if err = i.repos.Item.Save(ctx, mi.Value()); err != nil {
					return nil, err
				}
			}
		}

		if err := i.repos.Item.Save(ctx, itv); err != nil {
			return nil, err
		}

		// re-fetch item so the new version is returned
		itm, err = i.repos.Item.FindByID(ctx, param.ItemID, nil)
		if err != nil {
			return nil, err
		}

		if err = i.handleReferenceFields(ctx, *s, itm.Value(), oldFields); err != nil {
			return nil, err
		}
		refItems, err := i.getReferencedItems(ctx, fields)
		if err != nil {
			return nil, err
		}

		prj, err := i.repos.Project.FindByID(ctx, s.Project())
		if err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Project:   prj,
			Workspace: s.Workspace(),
			Type:      event.ItemUpdate,
			Object:    itm,
			WebhookObject: item.ItemModelSchema{
				Item:            itv,
				Model:           m,
				Schema:          s,
				GroupSchemas:    groupSchemas,
				ReferencedItems: refItems,
				Changes:         item.CompareFields(itv.Fields(), oldFields),
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return itm, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return interfaces.ErrInvalidOperator
	}

	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) error {
		itm, err := i.repos.Item.FindByID(ctx, itemID, nil)
		if err != nil {
			return err
		}
		s, err := i.repos.Schema.FindByID(ctx, itm.Value().Schema())
		if err != nil {
			return err
		}
		if !operator.CanUpdate(itm.Value()) {
			return interfaces.ErrOperationDenied
		}

		oldFields := itm.Value().Fields()
		itm.Value().ClearReferenceFields()
		if err := i.handleReferenceFields(ctx, *s, itm.Value(), oldFields); err != nil {
			return err
		}
		if itm.Value().MetadataItem() != nil {
			err = i.repos.Item.Remove(ctx, itemID)
			if err != nil {
				return err
			}
		}
		return i.repos.Item.Remove(ctx, itemID)
	})
}

func (i Item) Unpublish(ctx context.Context, itemIDs id.ItemIDList, operator *usecase.Operator) (item.VersionedList, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.VersionedList, error) {
		items, err := i.repos.Item.FindByIDs(ctx, itemIDs, nil)
		if err != nil {
			return nil, err
		}

		// check all items were found
		if len(items) != len(itemIDs) {
			return nil, interfaces.ErrItemMissing
		}

		// check all items on the same models
		s := lo.CountBy(items, func(itm item.Versioned) bool {
			return itm.Value().Model() == items[0].Value().Model()
		})
		if s != len(items) {
			return nil, interfaces.ErrItemsShouldBeOnSameModel
		}

		m, err := i.repos.Model.FindByID(ctx, items[0].Value().Model())
		if err != nil {
			return nil, err
		}

		prj, err := i.repos.Project.FindByID(ctx, m.Project())
		if err != nil {
			return nil, err
		}

		sch, err := i.repos.Schema.FindByID(ctx, m.Schema())
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingWorkspace(prj.Workspace()) {
			return nil, interfaces.ErrInvalidOperator
		}

		// remove public ref from the items
		for _, itm := range items {
			if err := i.repos.Item.UpdateRef(ctx, itm.Value().ID(), version.Public, nil); err != nil {
				return nil, err
			}
		}

		for _, itm := range items {
			refItems, err := i.getReferencedItems(ctx, itm.Value().Fields())
			if err != nil {
				return nil, err
			}
			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.ItemUnpublish,
				Object:    itm,
				WebhookObject: item.ItemModelSchema{
					Item:            itm.Value(),
					Model:           m,
					Schema:          sch,
					ReferencedItems: refItems,
				},
				Operator: operator.Operator(),
			}); err != nil {
				return nil, err
			}
		}

		return items, nil
	})
}

func (i Item) Publish(ctx context.Context, itemIDs id.ItemIDList, operator *usecase.Operator) (item.VersionedList, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.VersionedList, error) {
		items, err := i.repos.Item.FindByIDs(ctx, itemIDs, nil)
		if err != nil {
			return nil, err
		}

		// check all items were found
		if len(items) == 0 || len(items) != len(itemIDs) {
			return nil, interfaces.ErrItemMissing
		}

		m, err := i.repos.Model.FindByID(ctx, items[0].Value().Model())
		if err != nil {
			return nil, err
		}

		prj, err := i.repos.Project.FindByID(ctx, m.Project())
		if err != nil {
			return nil, err
		}

		sch, err := i.repos.Schema.FindByID(ctx, m.Schema())
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingWorkspace(prj.Workspace()) {
			return nil, interfaces.ErrInvalidOperator
		}

		// add public ref to the items
		for _, itm := range items {
			if err := i.repos.Item.UpdateRef(ctx, itm.Value().ID(), version.Public, version.Latest.OrVersion().Ref()); err != nil {
				return nil, err
			}
		}

		for _, itm := range items {
			refItems, err := i.getReferencedItems(ctx, itm.Value().Fields())
			if err != nil {
				return nil, err
			}

			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.ItemPublish,
				Object:    itm,
				WebhookObject: item.ItemModelSchema{
					Item:            itm.Value(),
					Model:           m,
					Schema:          sch,
					ReferencedItems: refItems,
				},
				Operator: operator.Operator(),
			}); err != nil {
				return nil, err
			}
		}

		return items, nil
	})
}

func (i Item) checkUnique(ctx context.Context, itemFields []*item.Field, s *schema.Schema, mid id.ModelID, itm *item.Item) error {
	var fieldsArg []repo.FieldAndValue
	for _, f := range itemFields {
		if itm != nil {
			oldF := itm.Field(f.FieldID())
			if oldF != nil && f.Value().Equal(oldF.Value()) {
				continue
			}
		}

		sf := s.Field(f.FieldID())
		if sf == nil {
			return interfaces.ErrInvalidField
		}

		newV := f.Value()
		if !sf.Unique() || newV.IsEmpty() {
			continue
		}

		fieldsArg = append(fieldsArg, repo.FieldAndValue{
			Field: f.FieldID(),
			Value: newV,
		})
	}

	exists, err := i.repos.Item.FindByModelAndValue(ctx, mid, fieldsArg, nil)
	if err != nil {
		return err
	}

	if len(exists) > 0 && (itm == nil || len(exists) != 1 || exists[0].Value().ID() != itm.ID()) {
		return interfaces.ErrDuplicatedItemValue
	}

	return nil
}

func (i Item) handleReferenceFields(ctx context.Context, s schema.Schema, itm *item.Item, oldFields item.Fields) error {
	for _, sf := range s.FieldsByType(value.TypeReference) {
		newF := itm.Field(sf.ID())
		oldF := oldFields.Field(sf.ID())

		if err := i.handleReferenceField(ctx, *sf, itm.ID(), newF, oldF); err != nil {
			return err
		}
	}
	return nil
}

func (i Item) handleReferenceField(ctx context.Context, sf schema.Field, iID item.ID, newF, oldF *item.Field) error {
	fr, ok := schema.FieldReferenceFromTypeProperty(sf.TypeProperty())
	if !ok || !fr.IsTowWay() || newF.Value().Equal(oldF.Value()) {
		return nil
	}

	items, err := i.getItemCorrespondingItems(ctx, *fr, newF, oldF)
	if err != nil {
		return err
	}

	for _, cItm := range items {
		cItm.ClearField(sf.ID())
		if fr.CorrespondingFieldID() != nil {
			cItm.ClearField(*fr.CorrespondingFieldID())
		}
		if err := i.repos.Item.Save(ctx, cItm); err != nil {
			return err
		}
	}

	refItmId, ok := newF.Value().First().ValueReference()
	if !ok || refItmId.IsEmpty() {
		return nil
	}
	refItm, _ := items.Item(refItmId)
	idValue := value.NewMultiple(value.TypeReference, []any{iID})
	refItm.UpdateFields([]*item.Field{item.NewField(*fr.CorrespondingFieldID(), idValue, nil)})
	if err := i.repos.Item.Save(ctx, refItm); err != nil {
		return err
	}
	return nil
}

func (i Item) getItemCorrespondingItems(ctx context.Context, fr schema.FieldReference, newF, oldF *item.Field) (item.List, error) {
	var ci = make([]*item.Item, 0)

	oldRefId, _ := oldF.Value().First().ValueReference()
	if !oldRefId.IsEmpty() {
		oldRefItm, err := i.repos.Item.FindByID(ctx, oldRefId, nil)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		if err == nil {
			ci = append(ci, oldRefItm.Value())
		}
	}

	newRefId, _ := newF.Value().First().ValueReference()
	// if there is no change in reference field or if the field is cleared then there is no more corresponding item
	if newRefId == oldRefId || newRefId.IsEmpty() {
		return ci, nil
	}

	newRefItm, err := i.repos.Item.FindByID(ctx, newRefId, nil)
	if err != nil {
		return nil, err
	}
	ci = append(ci, newRefItm.Value())

	// if the new referenced item has reference item get it
	newRefRefF := newRefItm.Value().Field(*fr.CorrespondingFieldID())
	newRefRefId, _ := newRefRefF.Value().First().ValueReference()
	if !newRefRefId.IsEmpty() {
		newRefRefItm, err := i.repos.Item.FindByID(ctx, newRefRefId, nil)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		if err == nil {
			ci = append(ci, newRefRefItm.Value())
		}
	}
	return ci, nil
}

func (i Item) handleGroupFields(ctx context.Context, params []interfaces.ItemFieldParam, s *schema.Schema, mId id.ModelID, itemFields item.Fields) (item.Fields, schema.List, error) {
	// TODO: use schema package to enhance performance
	var res item.Fields
	var groupSchemas schema.List
	for _, field := range itemFields.FieldsByType(value.TypeGroup) {
		sf := s.Field(field.FieldID())
		if sf == nil {
			continue
		}
		var fieldGroup *schema.FieldGroup
		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(f *schema.FieldGroup) {
				fieldGroup = f
			},
		})

		group, err := i.repos.Group.FindByID(ctx, fieldGroup.Group())
		if err != nil {
			return nil, nil, err
		}

		groupSchema, err := i.repos.Schema.FindByID(ctx, group.Schema())
		if err != nil {
			return nil, nil, err
		}

		if groupSchema != nil {
			groupSchemas = append(groupSchemas, groupSchema)
		}

		mvg, ok := field.Value().ValuesGroup()
		if !ok {
			return nil, nil, interfaces.ErrInvalidField
		}

		groupItemParams := lo.Filter(params, func(param interfaces.ItemFieldParam, _ int) bool {
			if param.Group == nil {
				return false
			}

			_, ok := lo.Find(mvg, func(item value.Group) bool {
				return item == *param.Group
			})
			return ok
		})

		fields, err := itemFieldsFromParams(groupItemParams, groupSchema)
		if err != nil {
			return nil, nil, err
		}
		if err = i.checkUnique(ctx, fields, groupSchema, mId, nil); err != nil {
			return nil, nil, err
		}

		res = append(res, fields...)
	}
	return res, groupSchemas, nil
}

func filterFieldParamsBySchema(params []interfaces.ItemFieldParam, s *schema.Schema) (res []interfaces.ItemFieldParam, other []interfaces.ItemFieldParam) {
	for _, param := range params {
		sf := s.FieldByIDOrKey(param.Field, param.Key)
		if sf != nil {
			res = append(res, param)
		} else {
			other = append(other, param)
		}
	}
	return
}

func itemFieldsFromParams(fields []interfaces.ItemFieldParam, s *schema.Schema) (item.Fields, error) {
	return util.TryMap(fields, func(f interfaces.ItemFieldParam) (*item.Field, error) {
		sf := s.FieldByIDOrKey(f.Field, f.Key)

		if sf == nil {
			return nil, fmt.Errorf("%w: id=%s key=%s", interfaces.ErrInvalidField, f.Field, f.Key)
		}

		if !sf.Multiple() {
			f.Value = []any{f.Value}
		}

		as, ok := f.Value.([]any)
		if !ok {
			return nil, fmt.Errorf("%w: id=%s key=%s", interfaces.ErrInvalidValue, f.Field, f.Key)
		}

		m := value.NewMultiple(sf.Type(), as)
		if err := sf.Validate(m); err != nil {
			return nil, fmt.Errorf("%w: id=%s key=%s", err, sf.ID(), sf.Name())
		}

		return item.NewField(sf.ID(), m, f.Group), nil
	})
}

func (i Item) event(ctx context.Context, e Event) error {
	return i.events(ctx, []Event{e})
}

func (i Item) events(ctx context.Context, e []Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvents(ctx, i.repos, i.gateways, e)
	return err
}

func (i Item) getReferencedItems(ctx context.Context, fields []*item.Field) ([]item.Versioned, error) {
	var ids id.ItemIDList
	for _, f := range fields {
		if f.Type() != value.TypeReference {
			continue
		}
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ids = ids.Add(iid)
		}
	}
	return i.repos.Item.FindByIDs(ctx, ids, nil)
}

// ItemsAsCSV exports items data in content to csv file by schema package.
func (i Item) ItemsAsCSV(ctx context.Context, schemaPackage *schema.Package, page *int, perPage *int, operator *usecase.Operator) (interfaces.ExportItemsToCSVResponse, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return interfaces.ExportItemsToCSVResponse{}, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (interfaces.ExportItemsToCSVResponse, error) {

		// fromPagination
		paginationOffset := fromPagination(page, perPage)

		items, _, err := i.repos.Item.FindBySchema(ctx, schemaPackage.Schema().ID(), nil, nil, paginationOffset)
		if err != nil {
			return interfaces.ExportItemsToCSVResponse{}, err
		}

		pr, pw := io.Pipe()
		err = csvFromItems(pw, items, schemaPackage.Schema())
		if err != nil {
			return interfaces.ExportItemsToCSVResponse{}, err
		}

		return interfaces.ExportItemsToCSVResponse{
			PipeReader: pr,
		}, nil
	})
}

// ItemsAsGeoJSON converts items to Geo JSON type given the schema package
func (i Item) ItemsAsGeoJSON(ctx context.Context, schemaPackage *schema.Package, page *int, perPage *int, operator *usecase.Operator) (interfaces.ExportItemsToGeoJSONResponse, error) {

	if operator.AcOperator.User == nil && operator.Integration == nil {
		return interfaces.ExportItemsToGeoJSONResponse{}, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (interfaces.ExportItemsToGeoJSONResponse, error) {

		// fromPagination
		paginationOffset := fromPagination(page, perPage)

		items, _, err := i.repos.Item.FindBySchema(ctx, schemaPackage.Schema().ID(), nil, nil, paginationOffset)
		if err != nil {
			return interfaces.ExportItemsToGeoJSONResponse{}, err
		}

		featureCollections, err := featureCollectionFromItems(items, schemaPackage.Schema())
		if err != nil {
			return interfaces.ExportItemsToGeoJSONResponse{}, err
		}

		return interfaces.ExportItemsToGeoJSONResponse{
			FeatureCollections: featureCollections,
		}, nil
	})
}

func fromPagination(page, perPage *int) *usecasex.Pagination {
	p := int64(1)
	if page != nil && *page > 0 {
		p = int64(*page)
	}

	pp := defaultPerPage
	if perPage != nil {
		if ppr := *perPage; 1 <= ppr {
			if ppr > maxPerPage {
				pp = int64(maxPerPage)
			} else {
				pp = int64(ppr)
			}
		}
	}

	return usecasex.OffsetPagination{
		Offset: (p - 1) * pp,
		Limit:  pp,
	}.Wrap()
}
