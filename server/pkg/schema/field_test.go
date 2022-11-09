package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestField_CreatedAt(t *testing.T) {
	id := NewFieldID()
	tests := []struct {
		name  string
		field Field
		want  time.Time
	}{
		{
			name: "success",
			field: Field{
				id: id,
			},
			want: id.Timestamp(),
		},
		{
			name: "success2",
			field: Field{
				id:           id,
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
			},
			want: id.Timestamp(),
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.CreatedAt())
		})
	}
}

func TestField_Description(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  string
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: "",
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
			},
			want: "desc",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.Description())
		})
	}
}

func TestField_ID(t *testing.T) {
	id := NewFieldID()
	tests := []struct {
		name  string
		field Field
		want  FieldID
	}{
		{
			name: "success",
			field: Field{
				id: id,
			},
			want: id,
		},
		{
			name: "success2",
			field: Field{
				id:           id,
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
			},
			want: id,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.ID())
		})
	}
}

func TestField_Key(t *testing.T) {
	id := NewFieldID()
	tests := []struct {
		name  string
		field Field
		want  struct {
			value string
			valid bool
		}
	}{
		{
			name: "empty",
			field: Field{
				id: id,
			},
			want: struct {
				value string
				valid bool
			}{value: "", valid: false},
		},
		{
			name: "with key",
			field: Field{
				id:  id,
				key: key.New("test_key"),
			},
			want: struct {
				value string
				valid bool
			}{value: "test_key", valid: true},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want.value, tc.field.Key().String())
			assert.Equal(t, tc.want.valid, tc.field.Key().IsValid())

		})
	}
}

func TestField_Name(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  string
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: "",
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
			},
			want: "test",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.Name())
		})
	}
}

func TestField_Unique(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  bool
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				unique:       false,
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				unique:       true,
			},
			want: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.Unique())
		})
	}
}

func TestField_MultiValue(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  bool
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				multiValue:   false,
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				multiValue:   true,
			},
			want: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.MultiValue())
		})
	}
}

func TestField_Required(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  bool
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				required:     false,
			},
			want: false,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
				required:     true,
			},
			want: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.Required())
		})
	}
}

func TestField_TypeProperty(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  *TypeProperty
	}{
		{
			name: "success",
			field: Field{
				id: NewFieldID(),
			},
			want: nil,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: nil,
			},
			want: nil,
		},
		{
			name: "success2",
			field: Field{
				id:           NewFieldID(),
				name:         "test",
				description:  "desc",
				key:          key.Random(),
				updatedAt:    time.Now(),
				typeProperty: &TypeProperty{text: &FieldText{}},
				unique:       true,
			},
			want: &TypeProperty{text: &FieldText{}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.TypeProperty())
		})
	}
}

func TestField_Type(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  value.Type
	}{
		{
			name: "success Text",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					text: &FieldText{},
				},
			},
			want: value.TypeText,
		},
		{
			name: "success TextArea",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					textArea: &FieldTextArea{},
				},
			},
			want: value.TypeTextArea,
		},
		{
			name: "success Markdown",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					markdown: &FieldMarkdown{},
				},
			},
			want: value.TypeMarkdown,
		},
		{
			name: "success RichText",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					richText: &FieldRichText{},
				},
			},
			want: value.TypeRichText,
		},
		{
			name: "success Asset",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					asset: &FieldAsset{},
				},
			},
			want: value.TypeAsset,
		},
		{
			name: "success Bool",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					bool: &FieldBool{},
				},
			},
			want: value.TypeBool,
		},
		{
			name: "success Date",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					date: &FieldDate{},
				},
			},
			want: value.TypeDate,
		},
		{
			name: "success Integer",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					integer: &FieldInteger{},
				},
			},
			want: value.TypeInteger,
		},
		{
			name: "success URL",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					url: &FieldURL{},
				},
			},
			want: value.TypeURL,
		},
		{
			name: "success Reference",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					reference: &FieldReference{},
				},
			},
			want: value.TypeReference,
		},
		{
			name: "success Tag",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					tag: &FieldTag{},
				},
			},
			want: value.TypeTag,
		},
		{
			name: "success Select",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					selectt: &FieldSelect{},
				},
			},
			want: value.TypeSelect,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.Type())
		})
	}
}

func TestField_UpdatedAt(t *testing.T) {
	now := time.Now()
	fId := NewFieldID()
	tests := []struct {
		name  string
		field Field
		want  time.Time
	}{
		{
			name: "success",
			field: Field{
				updatedAt: now,
			},
			want: now,
		},
		{
			name: "success",
			field: Field{
				id: fId,
			},
			want: fId.Timestamp(),
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.UpdatedAt())
		})
	}
}

func TestField_SetDescription(t *testing.T) {

	tests := []struct {
		name string
		arg  string
		want Field
	}{
		{
			name: "success",
			arg:  "",
			want: Field{},
		},
		{
			name: "success with value",
			arg:  "desc",
			want: Field{description: "desc"},
		},
		{
			name: "success long value",
			arg:  "desc desc desc desc desc",
			want: Field{description: "desc desc desc desc desc"},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			f := Field{}
			f.SetDescription(tc.arg)
			assert.Equal(t, tc.want, f)
		})
	}
}

func TestField_SetKey(t *testing.T) {

	tests := []struct {
		name string
		arg  key.Key
		want Field
	}{
		{
			name: "success",
			arg:  key.New(""),
			want: Field{},
		},
		{
			name: "success with value",
			arg:  key.New("test_key"),
			want: Field{key: key.New("test_key")},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			f := Field{}
			f.SetKey(tc.arg)
			assert.Equal(t, tc.want, f)
		})
	}
}

func TestField_SetName(t *testing.T) {

	tests := []struct {
		name string
		arg  string
		want Field
	}{
		{
			name: "success",
			arg:  "",
			want: Field{},
		},
		{
			name: "success with value",
			arg:  "test",
			want: Field{name: "test"},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			f := Field{}
			f.SetName(tc.arg)
			assert.Equal(t, tc.want, f)
		})
	}
}

func TestField_SetUpdatedAt(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name string
		arg  time.Time
		want Field
	}{
		{
			name: "success",
			arg:  now,
			want: Field{updatedAt: now},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			f := Field{}
			f.SetUpdatedAt(tc.arg)
			assert.Equal(t, tc.want, f)
		})
	}
}

func TestField_Clone(t *testing.T) {
	s := &Field{id: NewFieldID()}
	c := s.Clone()
	assert.Equal(t, s, c)
	assert.NotSame(t, s, c)

	s = nil
	c = s.Clone()
	assert.Nil(t, c)
}

func TestField_SetTypeProperty333(t *testing.T) {
	type fields struct {
		id           FieldID
		name         string
		description  string
		key          key.Key
		unique       bool
		multiValue   bool
		required     bool
		updatedAt    time.Time
		typeProperty *TypeProperty
	}
	type args struct {
		tp *TypeProperty
	}
	tests := []struct {
		name   string
		fields fields
		args   args
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := &Field{
				id:           tt.fields.id,
				name:         tt.fields.name,
				description:  tt.fields.description,
				key:          tt.fields.key,
				unique:       tt.fields.unique,
				multiValue:   tt.fields.multiValue,
				required:     tt.fields.required,
				updatedAt:    tt.fields.updatedAt,
				typeProperty: tt.fields.typeProperty,
			}
			f.SetTypeProperty(tt.args.tp)
		})
	}
}

func TestField_SetTypeProperty(t *testing.T) {
	tpText := NewFieldText(lo.ToPtr(10)).TypeProperty()
	tpText1 := NewFieldText(lo.ToPtr(11)).TypeProperty()
	tpTextarea := NewFieldTextArea(lo.ToPtr(11)).TypeProperty()
	tests := []struct {
		name string
		f    *Field
		tp   *TypeProperty
		want *TypeProperty
	}{
		{
			name: "empty field",
			f:    &Field{},
			tp:   tpText,
			want: tpText,
		},
		{
			name: "field with same type",
			f:    &Field{typeProperty: tpText1},
			tp:   tpText,
			want: tpText,
		},
		{
			name: "field with different type",
			f:    &Field{typeProperty: tpTextarea},
			tp:   tpText,
			want: tpTextarea,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t1 *testing.T) {
			t1.Parallel()

			tc.f.SetTypeProperty(tc.tp)
			assert.Equal(t1, tc.want, tc.f.typeProperty)
		})
	}
}

func TestField_SetMultiValue(t *testing.T) {
	f := &Field{multiValue: false}
	f.SetMultiValue(true)
	assert.Equal(t, true, f.MultiValue())
}

func TestField_SetRequired(t *testing.T) {
	f := &Field{required: false}
	f.SetRequired(true)
	assert.Equal(t, true, f.Required())
}

func TestField_SetUnique(t *testing.T) {
	f := &Field{unique: false}
	f.SetUnique(true)
	assert.Equal(t, true, f.Unique())
}
