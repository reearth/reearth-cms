package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
	timeNow := time.Now()
	pID := id.NewProjectID()
	sf1 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().RandomKey().MustBuild()
	sf2 := schema.NewField(lo.Must1(schema.NewInteger(nil, nil)).TypeProperty()).NewID().RandomKey().MustBuild()
	s1 := schema.New().NewID().Project(pID).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).MustBuild()
	s2 := schema.New().NewID().Project(pID).Workspace(accountdomain.NewWorkspaceID()).Fields([]*schema.Field{sf1, sf2}).TitleField(sf1.ID().Ref()).MustBuild()
	schemaPackage1 := schema.NewPackage(s1, nil, nil, nil)
	schemaPackage2 := schema.NewPackage(s2, nil, nil, nil)
	model1 := model.New().ID(id.NewModelID()).Metadata(s1.ID().Ref()).Project(pID).Schema(s1.ID()).Key(id.NewKey("mmm123")).UpdatedAt(timeNow).MustBuild()
	model2 := model.New().ID(id.NewModelID()).Metadata(s2.ID().Ref()).Project(pID).Schema(s2.ID()).Key(id.NewKey("mmm123")).UpdatedAt(timeNow).MustBuild()

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
				lastModified: timeNow,
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
				LastModified:     util.ToPtrIfNotEmpty(timeNow),
			},
		},
		{
			name: "success with item field in schema",
			args: args{
				m:            model2,
				sp:           schemaPackage2,
				lastModified: timeNow,
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
				LastModified:     util.ToPtrIfNotEmpty(timeNow),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NewModel(tt.args.m, tt.args.sp, tt.args.lastModified)
			if result != tt.want {
				assert.Equal(t, result, tt.want)
			}
		})
	}
}

// func TestNewItemFieldChanges(t *testing.T) {
// 	type args struct {
// 		change item.FieldChange
// 	}

// 	tests := []struct{
// 		name string
// 		args args
// 		want  []FieldChange
// 	}{
// 		{
// 			name: "success",
// 			args: args{
// 				change:  item.FieldChanges{},
// 			},
// 		},
// 	}
// }
