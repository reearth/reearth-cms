package schema

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
)

var ErrInvalidKey = errors.New("invalid key")

type FieldBuilder struct {
	f   *Field
	err error
}

func NewFieldText(defaultValue *string, maxLength *int) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			text: FieldTextFrom(defaultValue, maxLength),
		},
	}}
}

func NewFieldTextArea(defaultValue *string, maxLength *int) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			textArea: FieldTextAreaFrom(defaultValue, maxLength),
		},
	}}
}

func NewFieldRichText(defaultValue *string, maxLength *int) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			richText: FieldRichTextFrom(defaultValue, maxLength),
		},
	}}
}

func NewFieldMarkdown(defaultValue *string, maxLength *int) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			markdown: FieldMarkdownFrom(defaultValue, maxLength),
		},
	}}
}

func NewFieldAsset(defaultValue *id.AssetID) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			asset: FieldAssetFrom(defaultValue),
		},
	}}
}

func NewFieldDate(defaultValue *time.Time) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			date: FieldDateFrom(defaultValue),
		},
	}}
}

func NewFieldBool(defaultValue *bool) *FieldBuilder {
	return &FieldBuilder{f: &Field{
		typeProperty: &TypeProperty{
			bool: FieldBoolFrom(defaultValue),
		},
	}}
}

func NewFieldSelect(values []string, defaultValue *string) *FieldBuilder {
	fs, err := FieldSelectFrom(values, defaultValue)
	return &FieldBuilder{
		f: &Field{
			typeProperty: &TypeProperty{
				selectt: fs,
			},
		},
		err: err,
	}
}

func NewFieldTag(values []string, defaultValue []string) *FieldBuilder {
	ft, err := FieldTagFrom(values, defaultValue)
	return &FieldBuilder{
		f: &Field{
			typeProperty: &TypeProperty{
				tag: ft,
			},
		},
		err: err,
	}
}

func NewFieldInteger(defaultValue, min, max *int) *FieldBuilder {
	ft, err := FieldIntegerFrom(defaultValue, min, max)
	return &FieldBuilder{
		f: &Field{
			typeProperty: &TypeProperty{
				integer: ft,
			},
		},
		err: err,
	}
}

func NewFieldReference(defaultValue model.ID) *FieldBuilder {
	return &FieldBuilder{
		f: &Field{
			typeProperty: &TypeProperty{
				reference: FieldReferenceFrom(defaultValue),
			},
		},
	}
}

func NewFieldURL(defaultValue *string) *FieldBuilder {
	tp, err := FieldURLFrom(defaultValue)
	return &FieldBuilder{
		f: &Field{
			typeProperty: &TypeProperty{
				url: tp,
			},
		},
		err: err,
	}
}

func (b *FieldBuilder) Build() (*Field, error) {
	if b.err != nil {
		return nil, b.err
	}
	if b.f.id.IsNil() {
		return nil, ErrInvalidID
	}
	if !b.f.key.IsValid() {
		return nil, ErrInvalidKey
	}
	return b.f, nil
}

func (b *FieldBuilder) MustBuild() *Field {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *FieldBuilder) ID(id FieldID) *FieldBuilder {
	b.f.id = id.Clone()
	return b
}

func (b *FieldBuilder) NewID() *FieldBuilder {
	b.f.id = NewFieldID()
	return b
}

func (b *FieldBuilder) Options(unique, multiValue, required bool) *FieldBuilder {
	b.f.unique = unique
	b.f.multiValue = multiValue
	b.f.required = required
	return b
}

func (b *FieldBuilder) Name(name string) *FieldBuilder {
	b.f.name = name
	return b
}

func (b *FieldBuilder) Description(description string) *FieldBuilder {
	b.f.description = description
	return b
}

func (b *FieldBuilder) Key(key key.Key) *FieldBuilder {
	b.f.key = key
	return b
}

func (b *FieldBuilder) RandomKey() *FieldBuilder {
	b.f.key = key.Random()
	return b
}

func (b *FieldBuilder) UpdatedAt(t time.Time) *FieldBuilder {
	b.f.updatedAt = t
	return b
}
