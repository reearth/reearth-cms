package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
)

type SchemaDocument struct {
	ID        string
	Workspace string
	Fields    []FiledDocument
}

type FiledDocument struct {
	ID           string
	Name         string
	Description  string
	Key          string
	Unique       bool
	MultiValue   bool
	Required     bool
	UpdatedAt    time.Time
	TypeProperty TypePropertyDocument
}

type TypePropertyDocument struct {
	Type      string
	Text      *FieldTextPropertyDocument      `bson:",omitempty"`
	TextArea  *FieldTextAreaPropertyDocument  `bson:",omitempty"`
	RichText  *FieldRichTextPropertyDocument  `bson:",omitempty"`
	Markdown  *FieldMarkdownPropertyDocument  `bson:",omitempty"`
	Asset     *FieldAssetPropertyDocument     `bson:",omitempty"`
	Date      *FieldDatePropertyDocument      `bson:",omitempty"`
	Bool      *FieldBoolPropertyDocument      `bson:",omitempty"`
	Select    *FieldSelectPropertyDocument    `bson:",omitempty"`
	Tag       *FieldTagPropertyDocument       `bson:",omitempty"`
	Integer   *FieldIntegerPropertyDocument   `bson:",omitempty"`
	Reference *FieldReferencePropertyDocument `bson:",omitempty"`
	Url       *FieldURLPropertyDocument       `bson:",omitempty"`
}

type FieldTextPropertyDocument struct {
	DefaultValue *string
	MaxLength    *int
}
type FieldTextAreaPropertyDocument struct {
	DefaultValue *string
	MaxLength    *int
}
type FieldRichTextPropertyDocument struct {
	DefaultValue *string
	MaxLength    *int
}
type FieldMarkdownPropertyDocument struct {
	DefaultValue *string
	MaxLength    *int
}
type FieldAssetPropertyDocument struct {
	DefaultValue *string
}
type FieldDatePropertyDocument struct {
	DefaultValue *time.Time
}
type FieldBoolPropertyDocument struct {
	DefaultValue *bool
}
type FieldSelectPropertyDocument struct {
	Values       []string
	DefaultValue *string
}
type FieldTagPropertyDocument struct {
	Values       []string
	DefaultValue []string
}
type FieldIntegerPropertyDocument struct {
	DefaultValue *int
	Min          *int
	Max          *int
}
type FieldReferencePropertyDocument struct {
	ModelID string
}
type FieldURLPropertyDocument struct {
	DefaultValue *string
}

func NewSchema(s *schema.Schema) (*SchemaDocument, string) {
	sId := s.ID().String()
	fieldsDoc := util.Map(s.Fields(), func(f *schema.Field) FiledDocument {
		fd := FiledDocument{
			ID:          f.ID().String(),
			Name:        f.Name(),
			Description: f.Description(),
			Key:         f.Key().String(),
			Unique:      f.Unique(),
			MultiValue:  f.MultiValue(),
			Required:    f.Required(),
			UpdatedAt:   f.UpdatedAt(),
			TypeProperty: TypePropertyDocument{
				Type: string(f.Type()),
			},
		}

		f.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(fp *schema.FieldText) {
				fd.TypeProperty.Text = &FieldTextPropertyDocument{
					DefaultValue: fp.DefaultValue(),
					MaxLength:    fp.MaxLength(),
				}
			},
			TextArea: func(fp *schema.FieldTextArea) {
				fd.TypeProperty.TextArea = &FieldTextAreaPropertyDocument{
					DefaultValue: fp.DefaultValue(),
					MaxLength:    fp.MaxLength(),
				}
			},
			RichText: func(fp *schema.FieldRichText) {
				fd.TypeProperty.RichText = &FieldRichTextPropertyDocument{
					DefaultValue: fp.DefaultValue(),
					MaxLength:    fp.MaxLength(),
				}
			},
			Markdown: func(fp *schema.FieldMarkdown) {
				fd.TypeProperty.Markdown = &FieldMarkdownPropertyDocument{
					DefaultValue: fp.DefaultValue(),
					MaxLength:    fp.MaxLength(),
				}
			},
			Asset: func(fp *schema.FieldAsset) {
				fd.TypeProperty.Asset = &FieldAssetPropertyDocument{
					DefaultValue: fp.DefaultValue().StringRef(),
				}
			},
			Date: func(fp *schema.FieldDate) {
				fd.TypeProperty.Date = &FieldDatePropertyDocument{
					DefaultValue: fp.DefaultValue(),
				}
			},
			Bool: func(fp *schema.FieldBool) {
				fd.TypeProperty.Bool = &FieldBoolPropertyDocument{
					DefaultValue: fp.DefaultValue(),
				}
			},
			Select: func(fp *schema.FieldSelect) {
				fd.TypeProperty.Select = &FieldSelectPropertyDocument{
					Values:       fp.Values(),
					DefaultValue: fp.DefaultValue(),
				}
			},
			Tag: func(fp *schema.FieldTag) {
				fd.TypeProperty.Tag = &FieldTagPropertyDocument{
					Values:       fp.Values(),
					DefaultValue: fp.DefaultValue(),
				}
			},
			Integer: func(fp *schema.FieldInteger) {
				fd.TypeProperty.Integer = &FieldIntegerPropertyDocument{
					DefaultValue: fp.DefaultValue(),
				}
			},
			Reference: func(fp *schema.FieldReference) {
				fd.TypeProperty.Reference = &FieldReferencePropertyDocument{
					ModelID: fp.ModelID().String(),
				}
			},
			URL: func(fp *schema.FieldURL) {
				fd.TypeProperty.Url = &FieldURLPropertyDocument{
					DefaultValue: fp.DefaultValue(),
				}
			},
		})
		return fd
	})
	return &SchemaDocument{
		ID:        sId,
		Workspace: s.Workspace().String(),
		Fields:    fieldsDoc,
	}, sId
}

func (d *SchemaDocument) Model() (*schema.Schema, error) {
	sId, err := id.SchemaIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	wId, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	f := util.Map(d.Fields, func(fd FiledDocument) *schema.Field {
		var fb *schema.FieldBuilder
		tpd := fd.TypeProperty
		switch schema.Type(tpd.Type) {
		case schema.TypeText:
			fb = schema.NewFieldText(tpd.Text.DefaultValue, tpd.Text.MaxLength)
		case schema.TypeTextArea:
			fb = schema.NewFieldTextArea(tpd.TextArea.DefaultValue, tpd.TextArea.MaxLength)
		case schema.TypeRichText:
			fb = schema.NewFieldRichText(tpd.RichText.DefaultValue, tpd.RichText.MaxLength)
		case schema.TypeMarkdown:
			fb = schema.NewFieldMarkdown(tpd.Markdown.DefaultValue, tpd.Markdown.MaxLength)
		case schema.TypeAsset:
			fb = schema.NewFieldAsset(id.AssetIDFromRef(tpd.Asset.DefaultValue))
		case schema.TypeDate:
			fb = schema.NewFieldDate(tpd.Date.DefaultValue)
		case schema.TypeBool:
			fb = schema.NewFieldBool(tpd.Bool.DefaultValue)
		case schema.TypeSelect:
			fb = schema.NewFieldSelect(tpd.Select.Values, tpd.Select.DefaultValue)
		case schema.TypeTag:
			fb = schema.NewFieldTag(tpd.Tag.Values, tpd.Tag.DefaultValue)
		case schema.TypeInteger:
			fb = schema.NewFieldInteger(tpd.Integer.DefaultValue, tpd.Integer.Min, tpd.Integer.Max)
		case schema.TypeReference:
			fb = schema.NewFieldReference(id.MustModelID(tpd.Reference.ModelID))
		case schema.TypeURL:
			fb = schema.NewFieldURL(tpd.Url.DefaultValue)
		}

		return fb.ID(id.MustFieldID(fd.ID)).
			Options(fd.Unique, fd.MultiValue, fd.Required).
			Name(fd.Name).
			Description(fd.Description).
			Key(key.New(fd.Key)).
			UpdatedAt(fd.UpdatedAt).
			MustBuild()
	})

	return schema.New().
		ID(sId).
		Workspace(wId).
		Fields(f).
		Build()
}

type SchemaConsumer = mongox.SliceFuncConsumer[*SchemaDocument, *schema.Schema]

func NewSchemaConsumer() *SchemaConsumer {
	return NewComsumer[*SchemaDocument, *schema.Schema]()
}
