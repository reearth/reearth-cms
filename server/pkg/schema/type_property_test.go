package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestMatchTypeProperty1(t *testing.T) {
	m := TypePropertyMatch1[string]{
		Text:      func(_ *FieldText) string { return "Text" },
		TextArea:  func(_ *FieldTextArea) string { return "TextArea" },
		RichText:  func(_ *FieldRichText) string { return "RichText" },
		Markdown:  func(_ *FieldMarkdown) string { return "Markdown" },
		Asset:     func(_ *FieldAsset) string { return "Asset" },
		Date:      func(_ *FieldDate) string { return "Date" },
		Bool:      func(_ *FieldBool) string { return "Bool" },
		Select:    func(_ *FieldSelect) string { return "Select" },
		Tag:       func(_ *FieldTag) string { return "Tag" },
		Integer:   func(_ *FieldInteger) string { return "Integer" },
		Reference: func(_ *FieldReference) string { return "Reference" },
		URL:       func(_ *FieldURL) string { return "URL" },
		Default:   func() string { return "Default" },
	}
	type args struct {
		tp *TypeProperty
		m  TypePropertyMatch1[string]
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "text",
			args: args{
				tp: &TypeProperty{text: &FieldText{}},
				m:  m,
			},
			want: "Text",
		},
		{
			name: "textArea",
			args: args{
				tp: &TypeProperty{textArea: &FieldTextArea{}},
				m:  m,
			},
			want: "TextArea",
		},
		{
			name: "RichText",
			args: args{
				tp: &TypeProperty{richText: &FieldRichText{}},
				m:  m,
			},
			want: "RichText",
		},
		{
			name: "Markdown",
			args: args{
				tp: &TypeProperty{markdown: &FieldMarkdown{}},
				m:  m,
			},
			want: "Markdown",
		},
		{
			name: "Asset",
			args: args{
				tp: &TypeProperty{asset: &FieldAsset{}},
				m:  m,
			},
			want: "Asset",
		},
		{
			name: "Date",
			args: args{
				tp: &TypeProperty{date: &FieldDate{}},
				m:  m,
			},
			want: "Date",
		},
		{
			name: "Bool",
			args: args{
				tp: &TypeProperty{bool: &FieldBool{}},
				m:  m,
			},
			want: "Bool",
		},
		{
			name: "Select",
			args: args{
				tp: &TypeProperty{selectt: &FieldSelect{}},
				m:  m,
			},
			want: "Select",
		},
		{
			name: "Tag",
			args: args{
				tp: &TypeProperty{tag: &FieldTag{}},
				m:  m,
			},
			want: "Tag",
		},
		{
			name: "Integer",
			args: args{
				tp: &TypeProperty{integer: &FieldInteger{}},
				m:  m,
			},
			want: "Integer",
		},
		{
			name: "Reference",
			args: args{
				tp: &TypeProperty{reference: &FieldReference{}},
				m:  m,
			},
			want: "Reference",
		},
		{
			name: "URL",
			args: args{
				tp: &TypeProperty{url: &FieldURL{}},
				m:  m,
			},
			want: "URL",
		},
		{
			name: "Default",
			args: args{
				tp: &TypeProperty{},
				m:  m,
			},
			want: "Default",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, MatchTypeProperty1(tc.args.tp, tc.args.m))
		})
	}
}

func TestTypeProperty_Match(t *testing.T) {
	m := TypePropertyMatch{
		Text:      func(_ *FieldText) { panic("TPM_Text") },
		TextArea:  func(_ *FieldTextArea) { panic("TPM_TextArea") },
		RichText:  func(_ *FieldRichText) { panic("TPM_RichText") },
		Markdown:  func(_ *FieldMarkdown) { panic("TPM_Markdown") },
		Asset:     func(_ *FieldAsset) { panic("TPM_Asset") },
		Date:      func(_ *FieldDate) { panic("TPM_Date") },
		Bool:      func(_ *FieldBool) { panic("TPM_Bool") },
		Select:    func(_ *FieldSelect) { panic("TPM_Select") },
		Tag:       func(_ *FieldTag) { panic("TPM_Tag") },
		Integer:   func(_ *FieldInteger) { panic("TPM_Integer") },
		Reference: func(_ *FieldReference) { panic("TPM_Reference") },
		URL:       func(_ *FieldURL) { panic("TPM_URL") },
		Default:   func() { panic("TPM_Default") },
	}
	tests := []struct {
		name string
		tp   *TypeProperty
		m    TypePropertyMatch
		msg  string
	}{
		{
			name: "text",
			tp:   &TypeProperty{text: &FieldText{}},
			m:    m,
			msg:  "TPM_Text",
		},
		{
			name: "textArea",
			tp:   &TypeProperty{textArea: &FieldTextArea{}},
			m:    m,
			msg:  "TPM_TextArea",
		},
		{
			name: "richText",
			tp:   &TypeProperty{richText: &FieldRichText{}},
			m:    m,
			msg:  "TPM_RichText",
		},
		{
			name: "markdown",
			tp:   &TypeProperty{markdown: &FieldMarkdown{}},
			m:    m,
			msg:  "TPM_Markdown",
		},
		{
			name: "asset",
			tp:   &TypeProperty{asset: &FieldAsset{}},
			m:    m,
			msg:  "TPM_Asset",
		},
		{
			name: "date",
			tp:   &TypeProperty{date: &FieldDate{}},
			m:    m,
			msg:  "TPM_Date",
		},
		{
			name: "bool",
			tp:   &TypeProperty{bool: &FieldBool{}},
			m:    m,
			msg:  "TPM_Bool",
		},
		{
			name: "select",
			tp:   &TypeProperty{selectt: &FieldSelect{}},
			m:    m,
			msg:  "TPM_Select",
		},
		{
			name: "tag",
			tp:   &TypeProperty{tag: &FieldTag{}},
			m:    m,
			msg:  "TPM_Tag",
		},
		{
			name: "integer",
			tp:   &TypeProperty{integer: &FieldInteger{}},
			m:    m,
			msg:  "TPM_Integer",
		},
		{
			name: "reference",
			tp:   &TypeProperty{reference: &FieldReference{}},
			m:    m,
			msg:  "TPM_Reference",
		},
		{
			name: "url",
			tp:   &TypeProperty{url: &FieldURL{}},
			m:    m,
			msg:  "TPM_URL",
		},
		{
			name: "default",
			tp:   &TypeProperty{},
			m:    m,
			msg:  "TPM_Default",
		},
		{
			name: "default",
			tp:   nil,
			m:    m,
			msg:  "",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			if tc.msg == "" {
				assert.NotPanics(tt, func() {
					tc.tp.Match(tc.m)
				})
			} else {
				assert.PanicsWithValue(tt, tc.msg, func() {
					tc.tp.Match(tc.m)
				})
			}
		})
	}
}

func TestTypeProperty_Type(t *testing.T) {
	tests := []struct {
		name string
		tp   TypeProperty
		want Type
	}{
		{
			name: "Text",
			tp:   TypeProperty{text: &FieldText{}},
			want: TypeText,
		},
		{
			name: "TextArea",
			tp:   TypeProperty{textArea: &FieldTextArea{}},
			want: TypeTextArea,
		},
		{
			name: "RichText",
			tp:   TypeProperty{richText: &FieldRichText{}},
			want: TypeRichText,
		},
		{
			name: "Markdown",
			tp:   TypeProperty{markdown: &FieldMarkdown{}},
			want: TypeMarkdown,
		},
		{
			name: "Asset",
			tp:   TypeProperty{asset: &FieldAsset{}},
			want: TypeAsset,
		},
		{
			name: "Date",
			tp:   TypeProperty{date: &FieldDate{}},
			want: TypeDate,
		},
		{
			name: "Bool",
			tp:   TypeProperty{bool: &FieldBool{}},
			want: TypeBool,
		},
		{
			name: "Select",
			tp:   TypeProperty{selectt: &FieldSelect{}},
			want: TypeSelect,
		},
		{
			name: "Tag",
			tp:   TypeProperty{tag: &FieldTag{}},
			want: TypeTag,
		},
		{
			name: "Integer",
			tp:   TypeProperty{integer: &FieldInteger{}},
			want: TypeInteger,
		},
		{
			name: "Reference",
			tp:   TypeProperty{reference: &FieldReference{}},
			want: TypeReference,
		},
		{
			name: "URL",
			tp:   TypeProperty{url: &FieldURL{}},
			want: TypeURL,
		},
		{
			name: "Default",
			tp:   TypeProperty{},
			want: "",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t1 *testing.T) {
			t1.Parallel()

			assert.Equal(t1, tc.want, tc.tp.Type())
		})
	}
}

func TestTypeProperty_Clone(t *testing.T) {
	s := &TypeProperty{text: &FieldText{}}
	c := s.Clone()
	assert.Equal(t, s, c)
	assert.NotSame(t, s, c)

	s = nil
	c = s.Clone()
	assert.Nil(t, c)
}

func TestNewFieldTypePropertyAsset(t *testing.T) {
	type args struct {
		defaultValue *id.AssetID
	}
	tests := []struct {
		name string
		args args
		want *TypeProperty
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &TypeProperty{
				asset: FieldAssetFrom(nil),
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, NewFieldTypePropertyAsset(tt.args.defaultValue))
		})
	}
}

func TestNewFieldTypePropertyBool(t *testing.T) {
	type args struct {
		defaultValue *bool
	}
	tests := []struct {
		name string
		args args
		want *TypeProperty
	}{
		{
			name: "test",
			args: args{defaultValue: nil},
			want: &TypeProperty{
				bool: FieldBoolFrom(nil),
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, NewFieldTypePropertyBool(tt.args.defaultValue))
		})
	}
}

func TestNewFieldTypePropertyDate(t *testing.T) {
	type args struct {
		defaultValue *time.Time
	}
	tests := []struct {
		name string
		args args
		want *TypeProperty
	}{
		{
			name: "test",
			args: args{defaultValue: nil},
			want: &TypeProperty{date: FieldDateFrom(nil)},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, NewFieldTypePropertyDate(tt.args.defaultValue))
		})
	}
}

func TestNewFieldTypePropertyInteger(t *testing.T) {
	type args struct {
		defaultValue *int
		min          *int
		max          *int
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr error
	}{
		{
			name:    "test",
			args:    args{defaultValue: lo.ToPtr(-1), min: lo.ToPtr(0)},
			want:    nil,
			wantErr: ErrMinDefaultInvalid,
		},
		{
			name:    "test",
			args:    args{defaultValue: nil},
			want:    &TypeProperty{integer: MustFieldIntegerFrom(nil, nil, nil)},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := NewFieldTypePropertyInteger(tt.args.defaultValue, tt.args.min, tt.args.max)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewFieldTypePropertyMarkdown(t *testing.T) {
	tp, _ := FieldMarkdownFrom(nil, nil)
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr bool
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &TypeProperty{markdown: tp},
		},
		{
			name: "fail",
			args: args{
				defaultValue: lo.ToPtr("xxx"),
				maxLength:    lo.ToPtr(2),
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := NewFieldTypePropertyMarkdown(tt.args.defaultValue, tt.args.maxLength)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestNewFieldTypePropertyReference(t *testing.T) {
	mId := id.NewModelID()
	type args struct {
		defaultValue model.ID
	}
	tests := []struct {
		name string
		args args
		want *TypeProperty
	}{
		{
			name: "test",
			args: args{defaultValue: mId},
			want: &TypeProperty{reference: FieldReferenceFrom(mId)},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, NewFieldTypePropertyReference(tt.args.defaultValue))
		})
	}
}

func TestNewFieldTypePropertyRichText(t *testing.T) {
	f, _ := FieldRichTextFrom(nil, nil)
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr bool
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &TypeProperty{richText: f},
		},
		{
			name: "fail",
			args: args{
				defaultValue: lo.ToPtr("xxx"),
				maxLength:    lo.ToPtr(2),
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := NewFieldTypePropertyRichText(tt.args.defaultValue, tt.args.maxLength)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestNewFieldTypePropertySelect(t *testing.T) {
	type args struct {
		values       []string
		defaultValue *string
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr error
	}{
		{
			name: "test",
			args: args{
				values:       nil,
				defaultValue: nil,
			},
			want: &TypeProperty{
				selectt: nil,
			},
			wantErr: ErrFieldValues,
		},
		{
			name: "test",
			args: args{
				values:       []string{"v1"},
				defaultValue: nil,
			},
			want: &TypeProperty{
				selectt: MustFieldSelectFrom([]string{"v1"}, nil),
			},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := NewFieldTypePropertySelect(tt.args.values, tt.args.defaultValue)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewFieldTypePropertyTag(t *testing.T) {
	type args struct {
		values       []string
		defaultValue []string
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr error
	}{
		{
			name: "test",
			args: args{
				values:       nil,
				defaultValue: nil,
			},
			want: &TypeProperty{
				tag: nil,
			},
			wantErr: ErrFieldValues,
		},
		{
			name: "test",
			args: args{
				values:       []string{"v1"},
				defaultValue: nil,
			},
			want: &TypeProperty{
				tag: MustFieldTagFrom([]string{"v1"}, nil),
			},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := NewFieldTypePropertyTag(tt.args.values, tt.args.defaultValue)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got, "NewFieldTypePropertyTag(%v, %v)")
		})
	}
}

func TestNewFieldTypePropertyText(t *testing.T) {
	f, _ := FieldTextFrom(nil, nil)
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *TypeProperty
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &TypeProperty{
				text: f,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := NewFieldTypePropertyText(tt.args.defaultValue, tt.args.maxLength)
			assert.NoError(t, err)
			assert.Equal(t, tt.want, res)
		})
	}
}

func TestNewFieldTypePropertyTextArea(t *testing.T) {
	ta, _ := FieldTextAreaFrom(nil, nil)
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr bool
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &TypeProperty{
				textArea: ta,
			},
		},
		{
			name: "fail",
			args: args{
				defaultValue: lo.ToPtr("xxxx"),
				maxLength:    lo.ToPtr(3),
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f, err := NewFieldTypePropertyTextArea(tt.args.defaultValue, tt.args.maxLength)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.want, f)
			}

		})
	}
}

func TestNewFieldTypePropertyURL(t *testing.T) {
	type args struct {
		defaultValue *string
	}
	tests := []struct {
		name    string
		args    args
		want    *TypeProperty
		wantErr error
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &TypeProperty{
				url: MustFieldURLFrom(nil),
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("test"),
			},
			want: &TypeProperty{
				url: nil,
			},
			wantErr: ErrFieldDefaultValue,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := NewFieldTypePropertyURL(tt.args.defaultValue)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}
