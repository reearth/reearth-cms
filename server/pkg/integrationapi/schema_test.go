package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewModel(t *testing.T) {
	type args struct {
		m            *model.Model
		sp           *schema.Package
		lastModified time.Time
	}
	mockTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	pID := id.NewProjectID()
	sf1 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().RandomKey().MustBuild()
	sf2 := schema.NewField(lo.Must1(schema.NewInteger(nil, nil)).TypeProperty()).NewID().RandomKey().MustBuild()
	s1 := schema.New().NewID().Project(pID).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).MustBuild()
	s2 := schema.New().NewID().Project(pID).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).TitleField(sf1.ID().Ref()).MustBuild()
	schemaPackage1 := schema.NewPackage(s1, nil, nil, nil)
	schemaPackage2 := schema.NewPackage(s2, nil, nil, nil)
	model1 := model.New().ID(id.NewModelID()).Metadata(s1.ID().Ref()).Project(pID).Schema(s1.ID()).Key(id.NewKey("mmm123")).UpdatedAt(mockTime).MustBuild()
	model2 := model.New().ID(id.NewModelID()).Metadata(s2.ID().Ref()).Project(pID).Schema(s2.ID()).Key(id.NewKey("mmm123")).UpdatedAt(mockTime).MustBuild()

	tests := []struct {
		name string
		args args
		want Model
	}{
		{
			name: "success",
			args: args{
				m:            model1,
				sp:           schemaPackage1,
				lastModified: mockTime,
			},
			want: Model{
				Id:               model1.ID().Ref(),
				Key:              util.ToPtrIfNotEmpty(model1.Key().String()),
				Name:             util.ToPtrIfNotEmpty(model1.Name()),
				Description:      util.ToPtrIfNotEmpty(model1.Description()),
				Public:           util.ToPtrIfNotEmpty(model1.Public()),
				ProjectId:        model1.Project().Ref(),
				SchemaId:         model1.Schema().Ref(),
				Schema:           util.ToPtrIfNotEmpty(NewSchema(schemaPackage1.Schema())),
				MetadataSchemaId: model1.Metadata().Ref(),
				MetadataSchema:   util.ToPtrIfNotEmpty(NewSchema(schemaPackage1.MetaSchema())),
				CreatedAt:        lo.ToPtr(model1.ID().Timestamp()),
				UpdatedAt:        lo.ToPtr(model1.UpdatedAt()),
				LastModified:     util.ToPtrIfNotEmpty(mockTime),
			},
		},
		{
			name: "success with item field in schema",
			args: args{
				m:            model2,
				sp:           schemaPackage2,
				lastModified: mockTime,
			},
			want: Model{
				Id:               model2.ID().Ref(),
				Key:              util.ToPtrIfNotEmpty(model2.Key().String()),
				Name:             util.ToPtrIfNotEmpty(model2.Name()),
				Description:      util.ToPtrIfNotEmpty(model2.Description()),
				Public:           util.ToPtrIfNotEmpty(model2.Public()),
				ProjectId:        model2.Project().Ref(),
				SchemaId:         model2.Schema().Ref(),
				Schema:           util.ToPtrIfNotEmpty(NewSchema(schemaPackage2.Schema())),
				MetadataSchemaId: model2.Metadata().Ref(),
				MetadataSchema:   util.ToPtrIfNotEmpty(NewSchema(schemaPackage2.MetaSchema())),
				CreatedAt:        lo.ToPtr(model2.ID().Timestamp()),
				UpdatedAt:        lo.ToPtr(model2.UpdatedAt()),
				LastModified:     util.ToPtrIfNotEmpty(mockTime),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NewModel(tt.args.m, tt.args.sp, tt.args.lastModified)
			assert.Equal(t, tt.want, result)
		})
	}
}

func TestNewItemFieldChanges(t *testing.T) {

	fID := id.NewFieldID()
	v0 := value.MultipleFrom(value.TypeBool, []*value.Value{
		value.New(value.TypeBool, false),
	})
	v1 := value.MultipleFrom(value.TypeBool, []*value.Value{
		value.New(value.TypeBool, true),
	})

	type args struct {
		change item.FieldChanges
	}

	tests := []struct {
		name string
		args args
		want []FieldChange
	}{
		{
			name: "success",
			args: args{
				change: item.FieldChanges{
					item.FieldChange{
						ID:            fID,
						Type:          item.FieldChangeTypeAdd,
						CurrentValue:  value.MultipleFrom(v1.Type(), []*value.Value{v1.First()}),
						PreviousValue: value.MultipleFrom(v0.Type(), []*value.Value{v0.First()}),
					},
				},
			},
			want: []FieldChange{
				{
					ID:            fID,
					Type:          item.FieldChangeTypeAdd,
					CurrentValue:  v1.Interface(),
					PreviousValue: v0.Interface(),
				},
			},
		},
	}
	for _, test := range tests {
		t.Run(string(test.name), func(t *testing.T) {
			t.Parallel()
			result := NewItemFieldChanges(test.args.change)
			assert.Equal(t, test.want, result)
		})
	}
}
