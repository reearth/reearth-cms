package integration

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const maxPerPage = 100
const defaultPerPage int64 = 50

func fromPagination(page, perPage *integrationapi.PageParam) *usecasex.Pagination {
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

func Page(p usecasex.OffsetPagination) int {
	if p.Limit == 0 {
		return 0
	}
	return int(p.Offset/int64(p.Limit)) + 1
}

func fromItemFieldParam(f integrationapi.Field, _ *schema.Field) interfaces.ItemFieldParam {
	var v any = f.Value
	if f.Value != nil {
		v = *f.Value
	}

	var k *id.Key
	if f.Key != nil {
		k = id.NewKey(*f.Key).Ref()
	}

	return interfaces.ItemFieldParam{
		Field: f.Id,
		Key:   k,
		// Type:  sf.Type(),
		Value: v,
		Group: f.Group,
	}
}

func convertFields(fields *[]integrationapi.Field, sp *schema.Package, appendDefault, isMeta bool) (res []interfaces.ItemFieldParam) {
	res = []interfaces.ItemFieldParam{}
	if fields == nil {
		fields = &[]integrationapi.Field{}
	}

	for _, field := range *fields {
		sf := sp.FieldByIDOrKey(field.Id, id.NewKeyFromPtr(field.Key))
		if sf == nil {
			continue
		}

		if sf.Type() == value.TypeTag {
			tagNameToId(sf, &field)
		}

		res = append(res, fromItemFieldParam(field, sf))
	}

	if !appendDefault {
		return res
	}

	if isMeta {
		res = appendDefaultValues(sp.MetaSchema(), res, nil)
	} else {
		res = appendDefaultValues(sp.Schema(), res, nil)

		res = appendGroupFieldsDefaultValue(sp, res)
	}
	return res
}

func appendGroupFieldsDefaultValue(sp *schema.Package, res []interfaces.ItemFieldParam) []interfaces.ItemFieldParam {
	gsflist := sp.Schema().FieldsByType(value.TypeGroup)
	for _, gsf := range gsflist {
		var gID id.GroupID
		gsf.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(f *schema.FieldGroup) {
				gID = f.Group()
			},
		})
		s := sp.GroupSchema(gID)
		if s == nil {
			continue
		}
		igID := id.NewItemGroupID()
		var v any = igID
		if gsf.Multiple() {
			v = []any{igID}
		}
		res = append(res, interfaces.ItemFieldParam{
			Field: gsf.ID().Ref(),
			Key:   gsf.Key().Ref(),
			// Type:  gsf.Type(),
			Value: v,
			Group: nil,
		})
		res = appendDefaultValues(s, res, igID.Ref())
	}
	return res
}

func appendDefaultValues(s *schema.Schema, res []interfaces.ItemFieldParam, igID *id.ItemGroupID) []interfaces.ItemFieldParam {
	for _, sf := range s.Fields() {
		if sf.DefaultValue() == nil || sf.DefaultValue().Len() == 0 {
			continue
		}

		exists := lo.ContainsBy(res, func(f interfaces.ItemFieldParam) bool {
			return (f.Field != nil && *f.Field == sf.ID()) && (f.Group != nil && igID != nil && *f.Group == *igID)
		})
		if exists {
			continue
		}
		var v any
		v = sf.DefaultValue().Interface()
		if !sf.Multiple() {
			v = sf.DefaultValue().Interface()[0]
		}
		res = append(res, interfaces.ItemFieldParam{
			Field: sf.ID().Ref(),
			Key:   sf.Key().Ref(),
			// Type:  sf.Type(),
			Value: v,
			Group: igID,
		})
	}
	return res
}

func tagNameToId(sf *schema.Field, field *integrationapi.Field) {
	var tagList schema.TagList
	sf.TypeProperty().Match(schema.TypePropertyMatch{
		Tag: func(f *schema.FieldTag) {
			tagList = f.Tags()
		},
	})
	if !sf.Multiple() {
		name := lo.FromPtr(field.Value).(string)
		tag := tagList.FindByName(name)
		if tag != nil {
			var v any = tag.ID()
			field.Value = &v
		}
	} else {
		names := lo.FromPtr(field.Value).([]string)
		tagIDs := util.Map(names, func(n string) id.TagID {
			t := lo.FromPtr(tagList.FindByName(n))
			return t.ID()
		})
		var v any = tagIDs
		field.Value = &v
	}
}

func fromQuery(sp schema.Package, req ItemFilterRequestObject) *item.Query {
	var s *view.Sort
	if req.Params.Sort != nil {
		s = fromSort(sp, *req.Params.Sort, req.Params.Dir)
	}

	var c *view.Condition
	if req.Body.Filter != nil {
		c = fromCondition(sp, *req.Body.Filter)
	}

	return item.NewQuery(sp.Schema().Project(), req.ModelId, sp.Schema().ID().Ref(), lo.FromPtr(req.Params.Keyword), nil).
		WithSort(s).
		WithFilter(c)
}

func fromSort(_ schema.Package, sort integrationapi.ItemFilterParamsSort, dir *integrationapi.ItemFilterParamsDir) *view.Sort {
	if dir == nil {
		dir = lo.ToPtr(integrationapi.ItemFilterParamsDirAsc)
	}
	d := view.DirectionDesc
	if *dir == integrationapi.ItemFilterParamsDirAsc {
		d = view.DirectionAsc
	}
	switch sort {
	case integrationapi.ItemFilterParamsSortCreatedAt:
		return &view.Sort{
			Field: view.FieldSelector{
				Type: view.FieldTypeCreationDate,
				ID:   nil,
			},
			Direction: d,
		}
	case integrationapi.ItemFilterParamsSortUpdatedAt:
		return &view.Sort{
			Field: view.FieldSelector{
				Type: view.FieldTypeModificationDate,
				ID:   nil,
			},
			Direction: d,
		}
	}
	return nil
}

func toModelSort(sort *integrationapi.SortParam, dir *integrationapi.SortDirParam) *model.Sort {
	direction := model.DirectionDesc
	if dir != nil && *dir == integrationapi.SortDirParamAsc {
		direction = model.DirectionAsc
	}

	column := model.ColumnCreatedAt
	if sort != nil {
		switch *sort {
		case integrationapi.SortParamCreatedAt:
			column = model.ColumnCreatedAt
		case integrationapi.SortParamUpdatedAt:
			column = model.ColumnUpdatedAt
		}
	}

	return &model.Sort{
		Column:    column,
		Direction: direction,
	}
}

func fromCondition(_ schema.Package, condition integrationapi.Condition) *view.Condition {
	return condition.Into()
}
