package mongodoc

import (
	"errors"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type ViewDocument struct {
	ID        string
	Name      string
	User      string
	Project   string
	ModelId   string
	Schema    string
	Sort      *SortDocument
	Filter    *FilterDocument
	Columns   []ColumnDocument
	Order     int
	UpdatedAt time.Time
}

type FieldSelectorDocument struct {
	Field *string
	Type  string
}

func NewFieldSelector(i view.FieldSelector) FieldSelectorDocument {
	return FieldSelectorDocument{
		Field: i.ID.StringRef(),
		Type:  string(i.Type),
	}
}

func (d FieldSelectorDocument) Model() view.FieldSelector {
	return view.FieldSelector{
		Type: view.FieldType(d.Type),
		ID:   id.FieldIDFromRef(d.Field),
	}
}

type ColumnDocument struct {
	Field   FieldSelectorDocument
	Visible bool
}

func NewColumn(i view.Column) ColumnDocument {
	return ColumnDocument{
		Field:   NewFieldSelector(i.Field),
		Visible: i.Visible,
	}
}

func (d *ColumnDocument) Model() view.Column {
	return view.Column{
		Field:   d.Field.Model(),
		Visible: d.Visible,
	}
}

type SortDocument struct {
	Field     FieldSelectorDocument
	Direction string
}

func NewSort(i *view.Sort) *SortDocument {
	if i == nil {
		return nil
	}

	return &SortDocument{
		Field:     NewFieldSelector(i.Field),
		Direction: string(i.Direction),
	}
}

func NewViews(views view.List) ([]*ViewDocument, []string) {
	res := make([]*ViewDocument, 0, len(views))
	ids := make([]string, 0, len(views))
	for _, v := range views {
		if v == nil {
			continue
		}
		r, rid := NewView(v)
		res = append(res, r)
		ids = append(ids, rid)
	}
	return res, ids
}

func (d *SortDocument) Model() *view.Sort {
	if d == nil {
		return nil
	}

	return &view.Sort{
		Field:     d.Field.Model(),
		Direction: view.Direction(d.Direction),
	}
}

type FilterDocument struct {
	ConditionType     string
	AndCondition      *AndConditionDocument
	OrCondition       *OrConditionDocument
	BasicCondition    *BasicConditionDocument
	NullableCondition *NullableConditionDocument
	MultipleCondition *MultipleConditionDocument
	BoolCondition     *BoolConditionDocument
	StringCondition   *StringConditionDocument
	NumberCondition   *NumberConditionDocument
	TimeCondition     *TimeConditionDocument
}

func NewFilter(i *view.Condition) *FilterDocument {
	if i == nil {
		return nil
	}

	switch {
	case i.AndCondition != nil:
		return &FilterDocument{
			ConditionType: "AND",
			AndCondition: &AndConditionDocument{
				Conditions: newFilters(i.AndCondition.Conditions),
			},
		}
	case i.OrCondition != nil:
		return &FilterDocument{
			ConditionType: "OR",
			OrCondition: &OrConditionDocument{
				Conditions: newFilters(i.OrCondition.Conditions),
			},
		}
	case i.BasicCondition != nil:
		return &FilterDocument{
			ConditionType: "BASIC",
			BasicCondition: &BasicConditionDocument{
				Field: NewFieldSelector(i.BasicCondition.Field),
				Op:    string(i.BasicCondition.Op),
				Value: i.BasicCondition.Value,
			},
		}
	case i.NullableCondition != nil:
		return &FilterDocument{
			ConditionType: "NULLABLE",
			NullableCondition: &NullableConditionDocument{
				Field: NewFieldSelector(i.NullableCondition.Field),
				Op:    string(i.NullableCondition.Op),
			},
		}
	case i.MultipleCondition != nil:
		return &FilterDocument{
			ConditionType: "MULTIPLE",
			MultipleCondition: &MultipleConditionDocument{
				Field: NewFieldSelector(i.MultipleCondition.Field),
				Op:    string(i.MultipleCondition.Op),
				Value: i.MultipleCondition.Value,
			},
		}
	case i.BoolCondition != nil:
		return &FilterDocument{
			ConditionType: "BOOL",
			BoolCondition: &BoolConditionDocument{
				Field: NewFieldSelector(i.BoolCondition.Field),
				Op:    string(i.BoolCondition.Op),
				Value: i.BoolCondition.Value,
			},
		}
	case i.StringCondition != nil:
		return &FilterDocument{
			ConditionType: "STRING",
			StringCondition: &StringConditionDocument{
				Field: NewFieldSelector(i.StringCondition.Field),
				Op:    string(i.StringCondition.Op),
				Value: i.StringCondition.Value,
			},
		}
	case i.NumberCondition != nil:
		return &FilterDocument{
			ConditionType: "NUMBER",
			NumberCondition: &NumberConditionDocument{
				Field: NewFieldSelector(i.NumberCondition.Field),
				Op:    string(i.NumberCondition.Op),
				Value: i.NumberCondition.Value,
			},
		}
	case i.TimeCondition != nil:
		return &FilterDocument{
			ConditionType: "TIME",
			TimeCondition: &TimeConditionDocument{
				Field: NewFieldSelector(i.TimeCondition.Field),
				Op:    string(i.TimeCondition.Op),
				Value: i.TimeCondition.Value,
			},
		}
	default:
		return nil
	}
}

// newFilters keeps an empty condition as an empty document instead of
// dropping it, which would change what the filter matches. Repositories reject
// empty conditions on save; one stored anyway makes the view fail to read.
func newFilters(conditions []view.Condition) []FilterDocument {
	return lo.Map(conditions, func(c view.Condition, _ int) FilterDocument {
		return lo.FromPtr(NewFilter(&c))
	})
}

func (d *FilterDocument) Model() *view.Condition {
	if d == nil {
		return nil
	}

	switch d.ConditionType {
	case "AND":
		return &view.Condition{
			ConditionType: view.ConditionTypeAnd,
			AndCondition: &view.AndCondition{
				Conditions: filterModels(d.AndCondition.Conditions),
			},
		}
	case "OR":
		return &view.Condition{
			ConditionType: view.ConditionTypeOr,
			OrCondition: &view.OrCondition{
				Conditions: filterModels(d.OrCondition.Conditions),
			},
		}
	case "BASIC":
		return &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: d.BasicCondition.Field.Model(),
				Op:    view.BasicOperator(d.BasicCondition.Op),
				Value: d.BasicCondition.Value,
			},
		}
	case "NULLABLE":
		return &view.Condition{
			ConditionType: view.ConditionTypeNullable,
			NullableCondition: &view.NullableCondition{
				Field: d.NullableCondition.Field.Model(),
				Op:    view.NullableOperator(d.NullableCondition.Op),
			},
		}
	case "MULTIPLE":
		return &view.Condition{
			ConditionType: view.ConditionTypeMultiple,
			MultipleCondition: &view.MultipleCondition{
				Field: d.MultipleCondition.Field.Model(),
				Op:    view.MultipleOperator(d.MultipleCondition.Op),
				Value: d.MultipleCondition.Value,
			},
		}
	case "BOOL":
		return &view.Condition{
			ConditionType: view.ConditionTypeBool,
			BoolCondition: &view.BoolCondition{
				Field: d.BoolCondition.Field.Model(),
				Op:    view.BoolOperator(d.BoolCondition.Op),
				Value: d.BoolCondition.Value,
			},
		}
	case "STRING":
		return &view.Condition{
			ConditionType: view.ConditionTypeString,
			StringCondition: &view.StringCondition{
				Field: d.StringCondition.Field.Model(),
				Op:    view.StringOperator(d.StringCondition.Op),
				Value: d.StringCondition.Value,
			},
		}
	case "NUMBER":
		return &view.Condition{
			ConditionType: view.ConditionTypeNumber,
			NumberCondition: &view.NumberCondition{
				Field: d.NumberCondition.Field.Model(),
				Op:    view.NumberOperator(d.NumberCondition.Op),
				Value: d.NumberCondition.Value,
			},
		}
	case "TIME":
		return &view.Condition{
			ConditionType: view.ConditionTypeTime,
			TimeCondition: &view.TimeCondition{
				Field: d.TimeCondition.Field.Model(),
				Op:    view.TimeOperator(d.TimeCondition.Op),
				Value: d.TimeCondition.Value,
			},
		}
	default:
		return nil
	}
}

// filterModels expects documents checked by valid
func filterModels(docs []FilterDocument) []view.Condition {
	return lo.Map(docs, func(d FilterDocument, _ int) view.Condition { return *d.Model() })
}

var ErrInvalidFilterDocument = errors.New("invalid view filter document")

// valid reports whether the document and every nested one have a known type
// and the matching condition. A view with an invalid filter is not read, as
// dropping a condition and saving the view back would change what it matches.
func (d *FilterDocument) valid() bool {
	switch d.ConditionType {
	case "AND":
		return d.AndCondition != nil && lo.EveryBy(d.AndCondition.Conditions, func(c FilterDocument) bool { return c.valid() })
	case "OR":
		return d.OrCondition != nil && lo.EveryBy(d.OrCondition.Conditions, func(c FilterDocument) bool { return c.valid() })
	case "BASIC":
		return d.BasicCondition != nil
	case "NULLABLE":
		return d.NullableCondition != nil
	case "MULTIPLE":
		return d.MultipleCondition != nil
	case "BOOL":
		return d.BoolCondition != nil
	case "STRING":
		return d.StringCondition != nil
	case "NUMBER":
		return d.NumberCondition != nil
	case "TIME":
		return d.TimeCondition != nil
	default:
		return false
	}
}

type AndConditionDocument struct {
	Conditions []FilterDocument
}

type OrConditionDocument struct {
	Conditions []FilterDocument
}

type BasicConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value any
}

type NullableConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
}

type MultipleConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value []any
}

type BoolConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value bool
}

type StringConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value string
}

type NumberConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value float64
}

type TimeConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value time.Time
}

func NewView(i *view.View) (*ViewDocument, string) {
	if i == nil {
		return nil, ""
	}
	iId := i.ID().String()

	var columns []ColumnDocument
	if i.Columns() != nil {
		columns = lo.Map(*i.Columns(), func(c view.Column, _ int) ColumnDocument {
			return NewColumn(c)
		})
	}
	return &ViewDocument{
		ID:        iId,
		Name:      i.Name(),
		User:      i.User().String(),
		Project:   i.Project().String(),
		ModelId:   i.Model().String(),
		Schema:    i.Schema().String(),
		Sort:      NewSort(i.Sort()),
		Filter:    NewFilter(i.Filter()),
		Columns:   columns,
		Order:     i.Order(),
		UpdatedAt: i.UpdatedAt(),
	}, iId
}

func (d *ViewDocument) Model() (*view.View, error) {
	vID, err := id.ViewIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	pID, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	mID, err := id.ModelIDFrom(d.ModelId)
	if err != nil {
		return nil, err
	}

	sID, err := id.SchemaIDFrom(d.Schema)
	if err != nil {
		return nil, err
	}

	uID, err := accountdomain.UserIDFrom(d.User)
	if err != nil {
		return nil, err
	}

	if d.Filter != nil && !d.Filter.valid() {
		return nil, fmt.Errorf("%w: view %s", ErrInvalidFilterDocument, d.ID)
	}

	columns := lo.Map(d.Columns, func(c ColumnDocument, _ int) view.Column { return c.Model() })

	return view.New().
		ID(vID).
		Name(d.Name).
		Project(pID).
		Model(mID).
		Schema(sID).
		Sort(d.Sort.Model()).
		Filter(d.Filter.Model()).
		Columns((*view.ColumnList)(&columns)).
		User(uID).
		Order(d.Order).
		UpdatedAt(d.UpdatedAt).
		Build()
}

type ViewConsumer = mongox.SliceFuncConsumer[*ViewDocument, *view.View]

func NewViewConsumer() *ViewConsumer {
	return NewConsumer[*ViewDocument, *view.View]()
}

// ViewListConsumer skips and logs the views whose stored filter can not be
// read, so one broken view does not break listing the others. Such a view is
// never loaded, so it is never saved back with a changed filter.
type ViewListConsumer struct {
	Result view.List
}

func NewViewListConsumer() *ViewListConsumer {
	return &ViewListConsumer{}
}

func (c *ViewListConsumer) Consume(raw bson.Raw) error {
	return mongox.SimpleConsumer[*ViewDocument](func(d *ViewDocument) error {
		v, err := d.Model()
		if errors.Is(err, ErrInvalidFilterDocument) {
			log.Warnf("mongo view: skipping a view with an invalid filter: %v", err)
			return nil
		}
		if err != nil {
			return err
		}
		c.Result = append(c.Result, v)
		return nil
	}).Consume(raw)
}
