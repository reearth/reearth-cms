package interactor

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestApplyDefaultValues(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		setupFields   func() (item.Fields, *schema.Schema, id.FieldID, id.FieldID, id.FieldID)
		expectedLen   int
		checkDefaults func(t *testing.T, result item.Fields, fId1, fId2, fId3 id.FieldID)
	}{
		{
			name: "no fields, no defaults",
			setupFields: func() (item.Fields, *schema.Schema, id.FieldID, id.FieldID, id.FieldID) {
				fId1 := id.NewFieldID()
				s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(id.NewKey("field1")).MustBuild(),
				}).MustBuild()
				return item.Fields{}, s, fId1, id.FieldID{}, id.FieldID{}
			},
			expectedLen: 0,
		},
		{
			name: "field with default value added",
			setupFields: func() (item.Fields, *schema.Schema, id.FieldID, id.FieldID, id.FieldID) {
				fId1 := id.NewFieldID()
				s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(id.NewKey("field1")).DefaultValue(value.TypeText.Value("default").AsMultiple()).MustBuild(),
				}).MustBuild()
				return item.Fields{}, s, fId1, id.FieldID{}, id.FieldID{}
			},
			expectedLen: 1,
			checkDefaults: func(t *testing.T, result item.Fields, fId1, _, _ id.FieldID) {
				f := result.Field(fId1)
				assert.NotNil(t, f)
				v, ok := f.Value().First().ValueString()
				assert.True(t, ok)
				assert.Equal(t, "default", v)
			},
		},
		{
			name: "existing field not overwritten - returns empty",
			setupFields: func() (item.Fields, *schema.Schema, id.FieldID, id.FieldID, id.FieldID) {
				fId1 := id.NewFieldID()
				s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(id.NewKey("field1")).DefaultValue(value.TypeText.Value("default").AsMultiple()).MustBuild(),
				}).MustBuild()
				fields := item.Fields{
					item.NewField(fId1, value.TypeText.Value("imported").AsMultiple(), nil),
				}
				return fields, s, fId1, id.FieldID{}, id.FieldID{}
			},
			expectedLen: 0, // No new fields because fId1 already exists
		},
		{
			name: "multiple fields, only missing defaults returned",
			setupFields: func() (item.Fields, *schema.Schema, id.FieldID, id.FieldID, id.FieldID) {
				fId1 := id.NewFieldID()
				fId2 := id.NewFieldID()
				fId3 := id.NewFieldID()
				s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(id.NewKey("field1")).DefaultValue(value.TypeText.Value("default1").AsMultiple()).MustBuild(),
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId2).Key(id.NewKey("field2")).DefaultValue(value.TypeText.Value("default2").AsMultiple()).MustBuild(),
					schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId3).Key(id.NewKey("field3")).MustBuild(),
				}).MustBuild()
				fields := item.Fields{
					item.NewField(fId1, value.TypeText.Value("imported").AsMultiple(), nil),
				}
				return fields, s, fId1, fId2, fId3
			},
			expectedLen: 1, // Only fId2 (missing with default), fId1 exists, fId3 has no default
			checkDefaults: func(t *testing.T, result item.Fields, _, fId2, fId3 id.FieldID) {
				// fId2 should have default value (it was missing)
				f2 := result.Field(fId2)
				assert.NotNil(t, f2)
				v2, ok := f2.Value().First().ValueString()
				assert.True(t, ok)
				assert.Equal(t, "default2", v2)

				// fId3 should not exist (no default value)
				f3 := result.Field(fId3)
				assert.Nil(t, f3)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			importedFields, s, fId1, fId2, fId3 := tt.setupFields()
			result := missingFieldsWithDefaultValues(importedFields, s)

			assert.Equal(t, tt.expectedLen, len(result))
			if tt.checkDefaults != nil {
				tt.checkDefaults(t, result, fId1, fId2, fId3)
			}
		})
	}
}

// setupImportWithProgressFixture builds the minimal domain graph (workspace,
// project, model, schema, job) and seeded in-memory repositories needed to
// exercise importWithProgress / importCSVWithProgress directly.
func setupImportWithProgressFixture(t *testing.T) (context.Context, *Item, *job.Job, *model.Model, schema.Package, *usecase.Operator) {
	t.Helper()

	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	fId1 := id.NewFieldID()
	s := schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).Fields([]*schema.Field{
		schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId1).Key(id.NewKey("field1")).MustBuild(),
	}).MustBuild()

	prj := project.New().ID(s.Project()).Workspace(wid).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(prj.ID()).MustBuild()

	u := user.New().NewID().Name("tester").Email("tester@example.com").Workspace(wid).MustBuild()

	db := memory.New()
	require.NoError(t, db.Project.Save(ctx, prj))
	require.NoError(t, db.Model.Save(ctx, m))
	require.NoError(t, db.Schema.Save(ctx, s))
	require.NoError(t, db.User.Save(ctx, u))

	jb := job.New().NewID().Type(job.TypeImport).Project(prj.ID()).User(u.ID()).Payload([]byte("{}")).MustBuild()
	require.NoError(t, db.Job.Save(ctx, jb))

	itemUC := NewItem(db, nil)

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: new(u.ID()),
		},
	}

	sp := *schema.NewPackage(s, nil, nil, nil)

	return ctx, itemUC, jb, m, sp, op
}

// buildOversizedJSONArray returns a JSON array literal containing n tiny
// objects, e.g. `[{"field1":"v"},{"field1":"v"},...]`.
func buildOversizedJSONArray(n int) []byte {
	var b strings.Builder
	b.WriteByte('[')
	for i := 0; i < n; i++ {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString(`{"field1":"v"}`)
	}
	b.WriteByte(']')
	return []byte(b.String())
}

func TestItem_importWithProgress_TooManyRecords(t *testing.T) {
	t.Parallel()

	ctx, itemUC, jb, m, sp, op := setupImportWithProgressFixture(t)

	overLimit := interfaces.MaxImportRecordCount + 1
	payload := buildOversizedJSONArray(overLimit)

	param := interfaces.ImportItemsParam{
		ModelID:      m.ID(),
		SP:           sp,
		Strategy:     interfaces.ImportStrategyTypeInsert,
		Format:       interfaces.ImportFormatTypeJSON,
		MutateSchema: false,
		Reader:       bytes.NewReader(payload),
	}

	res, err := itemUC.importWithProgress(ctx, jb, param, op)

	require.Error(t, err)
	assert.ErrorIs(t, err, interfaces.ErrImportTooManyRecords)
	// No chunk should ever have reached saveChunk: the guard fires in the
	// first pass, before any items are inserted/updated/ignored.
	assert.Equal(t, interfaces.ImportItemsResponse{}, res)
}
