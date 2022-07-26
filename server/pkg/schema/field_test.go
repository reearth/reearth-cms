package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
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

func TestField_Type(t *testing.T) {

	tests := []struct {
		name  string
		field Field
		want  Type
	}{
		{
			name: "success Text",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					text: &FieldText{},
				},
			},
			want: TypeText,
		},
		{
			name: "success TextArea",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					textArea: &FieldTextArea{},
				},
			},
			want: TypeTextArea,
		},
		{
			name: "success Markdown",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					markdown: &FieldMarkdown{},
				},
			},
			want: TypeMarkdown,
		},
		{
			name: "success RichText",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					richText: &FieldRichText{},
				},
			},
			want: TypeRichText,
		},
		{
			name: "success Asset",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					asset: &FieldAsset{},
				},
			},
			want: TypeAsset,
		},
		{
			name: "success Bool",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					bool: &FieldBool{},
				},
			},
			want: TypeBool,
		},
		{
			name: "success Date",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					date: &FieldDate{},
				},
			},
			want: TypeDate,
		},
		{
			name: "success Integer",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					integer: &FieldInteger{},
				},
			},
			want: TypeInteger,
		},
		{
			name: "success URL",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					url: &FieldURL{},
				},
			},
			want: TypeURL,
		},
		{
			name: "success Reference",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					reference: &FieldReference{},
				},
			},
			want: TypeReference,
		},
		{
			name: "success Tag",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					tag: &FieldTag{},
				},
			},
			want: TypeTag,
		},
		{
			name: "success Select",
			field: Field{
				id: NewFieldID(),
				typeProperty: &TypeProperty{
					selectt: &FieldSelect{},
				},
			},
			want: TypeSelect,
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
