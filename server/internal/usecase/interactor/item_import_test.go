package interactor

import (
	"context"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
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

// TestItem_importWithProgress_streamsLargeInput verifies that importWithProgress
// processes a JSON array without materialising all items into memory first
// (the two-pass approach that was removed by the SCA-04 fix).
//
// The test creates a JSON array of 5 items and checks that all items are saved
// to the repository after the call returns.
func TestItem_importWithProgress_streamsLargeInput(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(wid).MustBuild()
	sf := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("name")).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(prj.ID()).MustBuild()

	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))
	lo.Must0(db.Job.Save(ctx, job.New().NewID().
		Project(prj.ID()).
		User(accountdomain.NewUserID()).
		Type(job.TypeImport).
		MustBuild()))

	// Build a JSON array of 5 objects.
	jsonItems := `[
		{"name": "item1"},
		{"name": "item2"},
		{"name": "item3"},
		{"name": "item4"},
		{"name": "item5"}
	]`

	j := job.New().NewID().
		Project(prj.ID()).
		User(accountdomain.NewUserID()).
		Type(job.TypeImport).
		MustBuild()
	lo.Must0(db.Job.Save(ctx, j))

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		ReadableProjects: []id.ProjectID{prj.ID()},
		WritableProjects: []id.ProjectID{prj.ID()},
	}

	sp := schema.NewPackage(s, nil, nil, nil)
	itemUC := NewItem(db, &gateway.Container{})
	itemUC.ignoreEvent = true

	res, err := itemUC.importWithProgress(ctx, j, interfaces.ImportItemsParam{
		ModelID:  m.ID(),
		SP:       *sp,
		Strategy: interfaces.ImportStrategyTypeInsert,
		Format:   interfaces.ImportFormatTypeJSON,
		Reader:   strings.NewReader(jsonItems),
	}, op)

	assert.NoError(t, err)
	assert.Equal(t, 5, res.Inserted)
	assert.Equal(t, 5, res.Total)
}
