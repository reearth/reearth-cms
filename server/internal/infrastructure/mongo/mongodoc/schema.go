package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
)

type SchemaDocument struct {
	ID        string
	Workspace string
	Project   string
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
	DefaultValue any
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
	MaxLength *int
}

type FieldTextAreaPropertyDocument struct {
	MaxLength *int
}

type FieldRichTextPropertyDocument struct {
	MaxLength *int
}

type FieldMarkdownPropertyDocument struct {
	MaxLength *int
}

type FieldAssetPropertyDocument struct{}

type FieldDatePropertyDocument struct{}

type FieldBoolPropertyDocument struct{}

type FieldSelectPropertyDocument struct {
	Values []string
}

type FieldTagPropertyDocument struct {
	Values []string
}

type FieldIntegerPropertyDocument struct {
	Min *int64
	Max *int64
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
			ID:           f.ID().String(),
			Name:         f.Name(),
			Description:  f.Description(),
			Key:          f.Key().String(),
			Unique:       f.Unique(),
			MultiValue:   f.MultiValue(),
			Required:     f.Required(),
			UpdatedAt:    f.UpdatedAt(),
			DefaultValue: NewValue(f.DefaultValue()),
			TypeProperty: TypePropertyDocument{
				Type: string(f.Type()),
			},
		}

		f.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(fp *schema.FieldText) {
				fd.TypeProperty.Text = &FieldTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			TextArea: func(fp *schema.FieldTextArea) {
				fd.TypeProperty.TextArea = &FieldTextAreaPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			RichText: func(fp *schema.FieldRichText) {
				fd.TypeProperty.RichText = &FieldRichTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			Markdown: func(fp *schema.FieldMarkdown) {
				fd.TypeProperty.Markdown = &FieldMarkdownPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			Asset: func(fp *schema.FieldAsset) {
				fd.TypeProperty.Asset = &FieldAssetPropertyDocument{}
			},
			Date: func(fp *schema.FieldDate) {
				fd.TypeProperty.Date = &FieldDatePropertyDocument{}
			},
			Bool: func(fp *schema.FieldBool) {
				fd.TypeProperty.Bool = &FieldBoolPropertyDocument{}
			},
			Select: func(fp *schema.FieldSelect) {
				fd.TypeProperty.Select = &FieldSelectPropertyDocument{
					Values: fp.Values(),
				}
			},
			Tag: func(fp *schema.FieldTag) {
				fd.TypeProperty.Tag = &FieldTagPropertyDocument{
					Values: fp.Values(),
				}
			},
			Integer: func(fp *schema.FieldInteger) {
				fd.TypeProperty.Integer = &FieldIntegerPropertyDocument{
					Min: fp.Min(),
					Max: fp.Max(),
				}
			},
			Reference: func(fp *schema.FieldReference) {
				fd.TypeProperty.Reference = &FieldReferencePropertyDocument{
					ModelID: fp.ModelID().String(),
				}
			},
			URL: func(fp *schema.FieldURL) {
				fd.TypeProperty.Url = &FieldURLPropertyDocument{}
			},
		})
		return fd
	})

	return &SchemaDocument{
		ID:        sId,
		Workspace: s.Workspace().String(),
		Project:   s.Project().String(),
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

	pId, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	f, err := util.TryMap(d.Fields, func(fd FiledDocument) (*schema.Field, error) {
		sid, err := id.FieldIDFrom(fd.ID)
		if err != nil {
			return nil, err
		}

		var tp *schema.TypeProperty
		tpd := fd.TypeProperty

		switch value.Type(tpd.Type) {
		case value.TypeText:
			tp = schema.NewFieldText(tpd.Text.MaxLength).TypeProperty()
		case value.TypeTextArea:
			tp = schema.NewFieldTextArea(tpd.TextArea.MaxLength).TypeProperty()
		case value.TypeRichText:
			tp = schema.NewFieldRichText(tpd.RichText.MaxLength).TypeProperty()
		case value.TypeMarkdown:
			tp = schema.NewFieldMarkdown(tpd.Markdown.MaxLength).TypeProperty()
		case value.TypeAsset:
			tp = schema.NewFieldAsset().TypeProperty()
		case value.TypeDate:
			tp = schema.NewFieldDate().TypeProperty()
		case value.TypeBool:
			tp = schema.NewFieldBool().TypeProperty()
		case value.TypeSelect:
			tp = schema.NewFieldSelect(tpd.Select.Values).TypeProperty()
		case value.TypeTag:
			tp = schema.NewFieldTag(tpd.Tag.Values).TypeProperty()
		case value.TypeInteger:
			f, err := schema.NewFieldInteger(tpd.Integer.Min, tpd.Integer.Max)
			if err != nil {
				return nil, err
			}
			tp = f.TypeProperty()
		case value.TypeReference:
			mid, err := id.ModelIDFrom(tpd.Reference.ModelID)
			if err != nil {
				return nil, err
			}
			tp = schema.NewFieldReference(mid).TypeProperty()
		case value.TypeURL:
			tp = schema.NewFieldURL().TypeProperty()
		}

		return schema.NewField(tp).
			ID(sid).
			Options(fd.Unique, fd.MultiValue, fd.Required).
			Name(fd.Name).
			Description(fd.Description).
			Key(key.New(fd.Key)).
			UpdatedAt(fd.UpdatedAt).
			Build()
	})
	if err != nil {
		return nil, err
	}

	return schema.New().
		ID(sId).
		Workspace(wId).
		Project(pId).
		Fields(f).
		Build()
}

type SchemaConsumer = mongox.SliceFuncConsumer[*SchemaDocument, *schema.Schema]

func NewSchemaConsumer() *SchemaConsumer {
	return NewComsumer[*SchemaDocument, *schema.Schema]()
}
