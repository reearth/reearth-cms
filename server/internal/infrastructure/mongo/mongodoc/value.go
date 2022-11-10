package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"go.mongodb.org/mongo-driver/bson"
)

type ValueDocument struct {
	Type  string
	Value any
}

func NewValue(vv *value.Value) *ValueDocument {
	var v any

	vv.Match(value.Match{
		Text: func(s string) {
			v = s
		},
		TextArea: func(s string) {
			v = s
		},
		RichText: func(s string) {
			v = s
		},
		Markdown: func(s string) {
			v = s
		},
		Date: func(s time.Time) {
			v = s
		},
		Asset: func(s id.AssetID) {
			v = s.String()
		},
		Bool: func(s bool) {
			v = s
		},
		Integer: func(s int64) {
			v = s
		},
		Select: func(s string) {
			v = s
		},
		Tag: func(s []string) {
			v = s
		},
		Reference: func(s id.ItemID) {
			v = s.String()
		},
		URL: func(s string) {
			v = s
		},
	})

	if v == nil {
		return nil
	}

	return &ValueDocument{
		Type:  string(vv.Type()),
		Value: v,
	}
}

func (d ValueDocument) Model() (*value.Value, error) {
	return value.New(value.Type(d.Type), d.Value)
}

func (d ValueDocument) EqFilter() any {
	if d.Type == string(value.TypeTag) {
		return nil // not supported
	}
	return bson.M{
		"$eq": d.Value,
	}
}
