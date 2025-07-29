package internalapimodel

import (
	"net/url"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToModel(m *model.Model, sp *schema.Package, webBase, pApiBase *url.URL) *pb.Model {
	if m == nil {
		return nil
	}

	return &pb.Model{
		Id:          m.ID().String(),
		ProjectId:   m.Project().String(),
		Name:        m.Name(),
		Description: m.Description(),
		Key:         m.Key().String(),
		Schema:      ToSchema(sp.Schema()),
		PublicApiEp: pApiBase.JoinPath(m.Key().String()).String(),
		EditorUrl:   webBase.JoinPath("content", m.ID().String()).String(),
		CreatedAt:   timestamppb.New(m.ID().Timestamp()),
		UpdatedAt:   timestamppb.New(m.UpdatedAt()),
	}
}

func ToSchema(s *schema.Schema) *pb.Schema {
	if s == nil {
		return nil
	}

	return &pb.Schema{
		SchemaId: s.ID().String(),
		Fields:   lo.Map(s.Fields(), func(f *schema.Field, _ int) *pb.SchemaField { return ToSchemaField(f) }),
	}
}

func ToSchemaField(f *schema.Field) *pb.SchemaField {
	if f == nil {
		return nil
	}

	return &pb.SchemaField{
		FieldId:     f.ID().String(),
		Name:        f.Name(),
		Type:        ToSchemaFieldType(f.Type()),
		Key:         f.Key().String(),
		Description: lo.ToPtr(f.Description()),
	}
}

func ToSchemaFieldType(t value.Type) pb.SchemaField_Type {
	switch t {
	case value.TypeText:
		return pb.SchemaField_Text
	case value.TypeTextArea:
		return pb.SchemaField_TextArea
	case value.TypeRichText:
		return pb.SchemaField_RichText
	case value.TypeMarkdown:
		return pb.SchemaField_MarkdownText
	case value.TypeAsset:
		return pb.SchemaField_Asset
	case value.TypeDateTime:
		return pb.SchemaField_Date
	case value.TypeBool:
		return pb.SchemaField_Bool
	case value.TypeSelect:
		return pb.SchemaField_Select
	case value.TypeInteger:
		return pb.SchemaField_Integer
	case value.TypeNumber:
		return pb.SchemaField_Number
	case value.TypeReference:
		return pb.SchemaField_Reference
	case value.TypeURL:
		return pb.SchemaField_URL
	case value.TypeGroup:
		return pb.SchemaField_Group
	case value.TypeTag:
		return pb.SchemaField_Tag
	case value.TypeCheckbox:
		return pb.SchemaField_Checkbox
	case value.TypeGeometryObject:
		return pb.SchemaField_GeometryObject
	case value.TypeGeometryEditor:
		return pb.SchemaField_GeometryEditor
	default:
		return pb.SchemaField_Text
	}
}
