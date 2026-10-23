package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
)

func TestViewDocument_Model(t *testing.T) {
	now := time.Now()
	uId, vId, mId, pId, sId := user.NewID(), view.NewID(), model.NewID(), project.NewID(), schema.NewID()
	c := view.ColumnList{}

	vDoc := &ViewDocument{
		ID:        vId.String(),
		Name:      "test",
		User:      uId.String(),
		Project:   pId.String(),
		ModelId:   mId.String(),
		Schema:    sId.String(),
		Columns:   []ColumnDocument{},
		Order:     1,
		UpdatedAt: now,
	}

	want := view.New().ID(vId).
		Name("test").
		User(uId).
		Project(pId).
		Model(mId).
		Schema(sId).
		Columns(&c).
		Order(1).
		UpdatedAt(now).
		MustBuild()

	got, err := vDoc.Model()
	assert.NoError(t, err)
	assert.Equal(t, want, got)
}

func TestNewView(t *testing.T) {
	now := time.Now()
	uId, vId, mId, pId, sId := user.NewID(), view.NewID(), model.NewID(), project.NewID(), schema.NewID()
	c := view.ColumnList{}

	v := view.New().ID(vId).
		Name("test").
		User(uId).
		Project(pId).
		Model(mId).
		Schema(sId).
		Columns(&c).
		Order(1).
		UpdatedAt(now).
		MustBuild()

	want := &ViewDocument{
		ID:        vId.String(),
		Name:      "test",
		User:      uId.String(),
		Project:   pId.String(),
		ModelId:   mId.String(),
		Schema:    sId.String(),
		Columns:   []ColumnDocument{},
		Order:     1,
		UpdatedAt: now,
	}

	got, gotId := NewView(v)
	assert.Equal(t, want, got)
	assert.Equal(t, want.ID, gotId)
}

func TestViewDocument_Model_Filter(t *testing.T) {
	t.Parallel()
	str := FilterDocument{ConditionType: "STRING", StringCondition: &StringConditionDocument{Op: "CONTAINS", Value: "x"}}
	unknown := FilterDocument{ConditionType: "UNKNOWN"}

	tests := []struct {
		name    string
		filter  *FilterDocument
		wantErr bool
	}{
		{name: "must read a view without a filter"},
		{name: "must read a valid nested filter", filter: &FilterDocument{ConditionType: "AND", AndCondition: &AndConditionDocument{Conditions: []FilterDocument{
			str, {ConditionType: "OR", OrCondition: &OrConditionDocument{Conditions: []FilterDocument{str}}},
		}}}},
		{name: "must not read an unknown top-level condition", filter: &unknown, wantErr: true},
		{name: "must not read an unknown nested condition", filter: &FilterDocument{ConditionType: "OR", OrCondition: &OrConditionDocument{Conditions: []FilterDocument{
			str, {ConditionType: "AND", AndCondition: &AndConditionDocument{Conditions: []FilterDocument{unknown}}},
		}}}, wantErr: true},
		{name: "must not read a condition without its body", filter: &FilterDocument{ConditionType: "AND"}, wantErr: true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			doc := &ViewDocument{
				ID: view.NewID().String(), User: user.NewID().String(), Project: project.NewID().String(),
				ModelId: model.NewID().String(), Schema: schema.NewID().String(), Filter: tc.filter,
			}
			got, err := doc.Model()
			if tc.wantErr {
				assert.ErrorIs(t, err, ErrInvalidFilterDocument)
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
		})
	}
}
