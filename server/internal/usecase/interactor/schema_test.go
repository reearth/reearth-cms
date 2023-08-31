package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestSchema_FindFields(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	pid := id.NewProjectID()
	f1 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Project(pid).Workspace(wid).Fields(schema.FieldList{f1}).MustBuild()
	f2 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s2 := schema.New().NewID().Project(pid).Workspace(wid).Fields(schema.FieldList{f2}).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		}}

	ctx := context.Background()
	db := memory.New()
	schemaUC := NewSchema(db, nil)

	err := db.Schema.Save(ctx, s1)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s2)
	assert.NoError(t, err)

	want := schema.FieldList{f1, f2}
	got, err := schemaUC.FindFields(ctx, []id.FieldID{f1.ID(), f2.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, want, got)
}
