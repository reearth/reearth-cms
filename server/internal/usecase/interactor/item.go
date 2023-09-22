package interactor

import (
	"context"
	"fmt"
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
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

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
	requests, err := i.repos.Request.FindByItems(ctx, itemsIds)
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

func (i Item) FindByProject(ctx context.Context, projectID id.ProjectID, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	if !operator.IsReadableProject(projectID) {
		return nil, nil, rerror.ErrNotFound
	}
	// TODO: check operation for projects that publication type is limited
	return i.repos.Item.FindByProject(ctx, projectID, nil, p)
}

func (i Item) FindByModel(ctx context.Context, modelID id.ModelID, sort *usecasex.Sort, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return nil, nil, err
	}
	if !operator.IsReadableProject(m.Project()) {
		return nil, nil, rerror.ErrNotFound
	}
	return i.repos.Item.FindByModel(ctx, m.ID(), nil, sort, p)
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
	s, err := i.repos.Schema.FindByID(ctx, schemaID)
	if err != nil {
		return nil, nil, err
	}

	sfIds := s.Fields().IDs()
	res, page, err := i.repos.Item.FindBySchema(ctx, schemaID, nil, sort, p)
	return res.FilterFields(sfIds), page, err
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

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
}

func (i Item) Search(ctx context.Context, q *item.Query, sort *usecasex.Sort, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, q, sort, p)
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

	for _, f := range s.Fields() {
		if f.Type() != value.TypeReference {
			continue
		}
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
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		prj, err := i.repos.Project.FindByID(ctx, s.Project())
		if err != nil {
			return nil, err
		}

		m, err := i.repos.Model.FindByID(ctx, param.ModelID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return nil, interfaces.ErrOperationDenied
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, m.ID(), nil); err != nil {
			return nil, err
		}

		th, err := thread.New().NewID().Workspace(s.Workspace()).Build()

		if err != nil {
			return nil, err
		}
		if err := i.repos.Thread.Save(ctx, th); err != nil {
			return nil, err
		}

		ib := item.New().
			NewID().
			Schema(s.ID()).
			Project(s.Project()).
			Model(m.ID()).
			Thread(th.ID()).
			Fields(fields)

		if operator.AcOperator.User != nil {
			ib = ib.User(*operator.AcOperator.User)
		}
		if operator.Integration != nil {
			ib = ib.Integration(*operator.Integration)
		}

		if param.MetadataID != nil {
			mi, err := i.repos.Item.FindByID(ctx, *param.MetadataID, nil)
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

		if err = i.handleReferenceFieldsCreateOrUpdate(ctx, s, fields, nil, it, operator); err != nil {
			return nil, err
		}

		if err := i.repos.Item.Save(ctx, it); err != nil {
			return nil, err
		}

		vi, err := i.repos.Item.FindByID(ctx, it.ID(), nil)
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
				ReferencedItems: i.getReferencedItems(ctx, fields),
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return vi, nil
	})
}

func (i Item) handleReferenceFieldsCreateOrUpdate(ctx context.Context, s *schema.Schema, fields []*item.Field, oldFields *[]*item.Field, it *item.Item, op *usecase.Operator) error {
	rf := lo.Filter(fields, func(f *item.Field, _ int) bool {
		return f.Type() == value.TypeReference
	})
	for _, ff := range rf {
		iid, ok := ff.Value().First().ValueReference()
		if iid.IsEmpty() && oldFields != nil {
			if err := i.handleEmptyReference(ctx, s, oldFields, it, ff.FieldID().Ref()); err != nil {
				return err
			}
			continue
		} else if !ok {
			continue
		}
		itm2, err := i.repos.Item.FindByID(ctx, iid, nil)
		if err != nil {
			return err
		}
		// ok, err = i.IsItemReferenced(ctx, itm2.Value().ID(), ff.FieldID(), op)
		// if err != nil {
		// 	return err
		// }
		// if ok {
		// 	itm3, err := i.getReferencedItem(ctx, it, ff.FieldID().Ref())
		// 	if err != nil {
		// 		return err
		// 	}
		// 	if itm3 == nil {
		// 		continue
		// 	}
		// 	// remove reference from item
		// }
		var s2 *schema.Schema
		if itm2.Value().Schema() == s.ID() {
			s2 = s
		} else {
			s2, err = i.repos.Schema.FindByID(ctx, itm2.Value().Schema())
			if err != nil {
				return err
			}
		}
		fid1, fid2 := item.AreItemsReferenced(it, itm2.Value(), s, s2)
		if fid1 == nil || fid2 == nil {
			continue
		}
		if oldFields != nil {
			if err := i.removeOldReference(ctx, s, oldFields, fid1, fid2); err != nil {
				return err
			}
		}
		vv := value.New(value.TypeReference, it.ID().String()).AsMultiple()
		if vv == nil {
			continue
		}
		itm2.Value().UpdateFields([]*item.Field{item.NewField(*fid2, vv)})
		if err := i.repos.Item.Save(ctx, itm2.Value()); err != nil {
			return err
		}
	}

	return nil
}

// func (i Item) getReferencedItem(ctx context.Context, itm *item.Item, fid *id.FieldID) (*item.Item, error) {
// 	of, ok := lo.Find(itm.Fields(), func(f *item.Field) bool {
// 		return f.FieldID().String() == fid.String()
// 	})
// 	if !ok {
// 		return nil, nil
// 	}
// 	iid, ok := of.Value().First().ValueReference()
// 	if !ok {
// 		return nil, nil
// 	}
// 	ii, err := i.repos.Item.FindByID(ctx, iid, nil)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return ii.Value(), nil
// }

func (i Item) handleEmptyReference(ctx context.Context, s *schema.Schema, oldFields *[]*item.Field, it *item.Item, fid *id.FieldID) error {
	of, ok := lo.Find(*oldFields, func(f *item.Field) bool {
		return f.FieldID().String() == fid.String()
	})
	if !ok {
		return nil
	}
	oiid, ok := of.Value().First().ValueReference()
	if !ok {
		return nil
	}
	oitm, err := i.repos.Item.FindByID(ctx, oiid, nil)
	if err != nil {
		return err
	}
	os, err := i.repos.Schema.FindByID(ctx, oitm.Value().Schema())
	if err != nil {
		return err
	}
	fid1, fid2 := item.AreItemsReferenced(it, oitm.Value(), s, os)
	if fid1 == nil || fid2 == nil {
		return nil
	}
	updateFields := lo.Filter(oitm.Value().Fields(), func(f *item.Field, _ int) bool {
		return f.FieldID().String() != fid2.String()
	})
	newField := item.NewField(*fid2, value.NewMultiple(value.TypeReference, []any{}))
	updateFields = append(updateFields, newField)
	oitm.Value().UpdateFields(updateFields)
	if err := i.repos.Item.Save(ctx, oitm.Value()); err != nil {
		return err
	}
	return nil
}

func (i Item) removeOldReference(ctx context.Context, s *schema.Schema, oldFields *[]*item.Field, fid1 *id.FieldID, fid2 *id.FieldID) error {
	of, ok := lo.Find(*oldFields, func(f *item.Field) bool {
		return f.FieldID().String() == fid1.String()
	})
	if !ok {
		return nil
	}
	oiid, ok := of.Value().First().ValueReference()
	if !ok {
		return nil
	}
	oitm, err := i.repos.Item.FindByID(ctx, oiid, nil)
	if err != nil {
		return err
	}
	updateFields := lo.Filter(oitm.Value().Fields(), func(f *item.Field, _ int) bool {
		return f.FieldID().String() != fid2.String()
	})
	newField := item.NewField(*fid2, value.NewMultiple(value.TypeReference, []any{}))
	updateFields = append(updateFields, newField)
	oitm.Value().UpdateFields(updateFields)
	if err := i.repos.Item.Save(ctx, oitm.Value()); err != nil {
		return err
	}
	return nil
}

func (i Item) LastModifiedByModel(ctx context.Context, model id.ModelID, op *usecase.Operator) (time.Time, error) {
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

		isMetadata := m.Metadata() != nil && itv.Schema() == *m.Metadata()
		if !isMetadata && param.Version != nil && itm.Version() != *param.Version {
			return nil, interfaces.ErrItemConflicted
		}

		s, err := i.repos.Schema.FindByID(ctx, itv.Schema())
		if err != nil {
			return nil, err
		}

		prj, err := i.repos.Project.FindByID(ctx, s.Project())
		if err != nil {
			return nil, err
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, itv.Model(), itv); err != nil {
			return nil, err
		}

		oldFields := itv.Fields()

		itv.UpdateFields(fields)

		if operator.AcOperator.User != nil {
			itv.SetUpdatedByUser(*operator.AcOperator.User)
		} else if operator.Integration != nil {
			itv.SetUpdatedByIntegration(*operator.Integration)
		}

		if param.MetadataID != nil {
			mi, err := i.repos.Item.FindByID(ctx, *param.MetadataID, nil)
			if err != nil {
				return nil, err
			}
			if m.Metadata() == nil || *m.Metadata() != mi.Value().Schema() {
				return nil, interfaces.ErrMetadataMismatch
			}
			itv.SetMetadataItem(*param.MetadataID)
		}

		if err := i.repos.Item.Save(ctx, itv); err != nil {
			return nil, err
		}

		newFields := itv.Fields()

		if err = i.handleReferenceFieldsCreateOrUpdate(ctx, s, newFields, &oldFields, itv, operator); err != nil {
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
				ReferencedItems: i.getReferencedItems(ctx, fields),
				Changes:         item.CompareFields(newFields, oldFields),
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
		if err := i.handleReferenceFieldsDelete(ctx, itm, s, operator); err != nil {
			return err
		}

		return i.repos.Item.Remove(ctx, itemID)
	})
}

func (i Item) handleReferenceFieldsDelete(ctx context.Context, itm *version.Value[*item.Item], s *schema.Schema, op *usecase.Operator) error {
	rf := lo.Filter(itm.Value().Fields(), func(f *item.Field, _ int) bool {
		return f.Type() == value.TypeReference
	})

	for _, f := range rf {
		iid2, ok := f.Value().First().ValueReference()
		if !ok {
			continue
		}
		itm2, err := i.repos.Item.FindByID(ctx, iid2, nil)
		if err != nil {
			continue
		}
		var s2 *schema.Schema
		if itm2.Value().Schema() == s.ID() {
			s2 = s
		} else {
			s2, err = i.repos.Schema.FindByID(ctx, itm2.Value().Schema())
			if err != nil {
				continue
			}
		}
		fid1, fid2 := item.AreItemsReferenced(itm.Value(), itm2.Value(), s, s2)
		if fid1 == nil || fid2 == nil {
			continue
		}
		fields2 := []*item.Field{item.NewField(*fid2, value.NewMultiple(value.TypeReference, []any{}))}
		itm2.Value().UpdateFields(fields2)
		if err := i.repos.Item.Save(ctx, itm2.Value()); err != nil {
			return err
		}
	}

	return nil
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
			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.ItemUnpublish,
				Object:    itm,
				WebhookObject: item.ItemModelSchema{
					Item:            itm.Value(),
					Model:           m,
					Schema:          sch,
					ReferencedItems: i.getReferencedItems(ctx, itm.Value().Fields()),
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
			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.ItemPublish,
				Object:    itm,
				WebhookObject: item.ItemModelSchema{
					Item:            itm.Value(),
					Model:           m,
					Schema:          sch,
					ReferencedItems: i.getReferencedItems(ctx, itm.Value().Fields()),
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

func itemFieldsFromParams(fields []interfaces.ItemFieldParam, s *schema.Schema) ([]*item.Field, error) {
	return util.TryMap(fields, func(f interfaces.ItemFieldParam) (*item.Field, error) {
		sf := s.FieldByIDOrKey(f.Field, f.Key)
		if sf == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		if !sf.Multiple() {
			f.Value = []any{f.Value}
		}

		as, ok := f.Value.([]any)
		if !ok {
			return nil, interfaces.ErrInvalidValue
		}

		m := value.NewMultiple(sf.Type(), as)
		if err := sf.Validate(m); err != nil {
			return nil, fmt.Errorf("field %s: %w", sf.Name(), err)
		}

		return item.NewField(sf.ID(), m), nil
	})
}

func (i Item) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}

func (i Item) getReferencedItems(ctx context.Context, fields []*item.Field) []item.Versioned {
	var vil []item.Versioned
	for _, f := range fields {
		if f.Type() != value.TypeReference {
			continue
		}
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := i.repos.Item.FindByID(ctx, iid, nil)
			if err != nil {
				continue
			}
			vil = append(vil, ii)
		}
	}
	return vil
}
