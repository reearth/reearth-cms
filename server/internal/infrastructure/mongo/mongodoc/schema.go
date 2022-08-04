package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/util"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/pkg/id"
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
	_Type     string
	Text      *FieldTextPropertyDocument      `bson:",omitempty"`
	Textarea  *FieldTextAreaPropertyDocument  `bson:",omitempty"`
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

type SchemaConsumer struct {
	Rows schema.List
}

func (c *SchemaConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc SchemaDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	s, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, s)
	return nil
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
		}

		f.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(fp *schema.FieldText) {
				fd.TypeProperty = TypePropertyDocument{
					_Type: string(fp.TypeProperty().Type()),
					Text: &FieldTextPropertyDocument{
						DefaultValue: fp.DefaultValue(),
						MaxLength:    fp.MaxLength(),
					},
				}
			},
			TextArea:  nil,
			RichText:  nil,
			Markdown:  nil,
			Asset:     nil,
			Date:      nil,
			Bool:      nil,
			Select:    nil,
			Tag:       nil,
			Integer:   nil,
			Reference: nil,
			URL:       nil,
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

	// TODO: parse the fields
	// f := util.Map(d.Fields, func(fd FiledDocument) *schema.Field {
	// 	return &schema.NewFieldText()
	// })

	return schema.New().
		ID(sId).
		Workspace(wId).
		Fields(nil).
		Build()
}
