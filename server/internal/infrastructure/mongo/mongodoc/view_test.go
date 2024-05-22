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
