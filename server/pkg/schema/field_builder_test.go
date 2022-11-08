package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_Build(t *testing.T) {
	tp, _ := NewFieldTypePropertyText(nil, nil)
	fId := NewFieldID()
	tests := []struct {
		name    string
		builder *FieldBuilder
		want    *Field
		wantErr error
	}{
		{
			name: "nil id",
			builder: &FieldBuilder{
				f:   &Field{},
				err: nil,
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name: "invalid key",
			builder: &FieldBuilder{
				f: &Field{
					id:  NewFieldID(),
					key: key.New("k"),
				},
				err: nil,
			},
			want:    nil,
			wantErr: ErrInvalidKey,
		},
		{
			name: "has errors",
			builder: &FieldBuilder{
				f: &Field{
					id:  NewFieldID(),
					key: key.Random(),
				},
				err: ErrFieldDefaultValue,
			},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
		{
			name: "pass",
			builder: &FieldBuilder{
				f: &Field{
					id:           fId,
					name:         "f",
					description:  "d",
					key:          key.New("k123456"),
					unique:       false,
					multiValue:   false,
					required:     false,
					typeProperty: tp,
				},
				err: nil,
			},
			want: &Field{
				id:           fId,
				name:         "f",
				description:  "d",
				key:          key.New("k123456"),
				unique:       false,
				multiValue:   false,
				required:     false,
				typeProperty: tp,
			},
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := tt.builder.Build()
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestFieldBuilder_MustBuild(t *testing.T) {
	tp, _ := NewFieldTypePropertyText(nil, nil)
	fId := NewFieldID()
	tests := []struct {
		name    string
		builder *FieldBuilder
		want    *Field
		wantErr error
	}{
		{
			name: "nil id",
			builder: &FieldBuilder{
				f:   &Field{},
				err: nil,
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name: "invalid key",
			builder: &FieldBuilder{
				f: &Field{
					id:  NewFieldID(),
					key: key.New("k"),
				},
				err: nil,
			},
			want:    nil,
			wantErr: ErrInvalidKey,
		},
		{
			name: "has errors",
			builder: &FieldBuilder{
				f: &Field{
					id:  NewFieldID(),
					key: key.Random(),
				},
				err: ErrFieldDefaultValue,
			},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
		{
			name: "pass",
			builder: &FieldBuilder{
				f: &Field{
					id:           fId,
					name:         "f",
					description:  "d",
					key:          key.New("k123456"),
					unique:       false,
					multiValue:   false,
					required:     false,
					typeProperty: tp,
				},
				err: nil,
			},
			want: &Field{
				id:           fId,
				name:         "f",
				description:  "d",
				key:          key.New("k123456"),
				unique:       false,
				multiValue:   false,
				required:     false,
				typeProperty: tp,
			},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if tt.wantErr != nil {
				assert.PanicsWithValue(t, tt.wantErr, func() {
					tt.builder.MustBuild()
				})
				return
			}
			assert.Equal(t, tt.want, tt.builder.MustBuild())
		})
	}
}

func TestNewFieldAsset(t *testing.T) {
	aId := id.NewAssetID()
	type args struct {
		defaultValue *id.AssetID
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						asset: NewFieldAsset(nil),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: &aId,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						asset: NewFieldAsset(&aId),
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldAsset(tt.args.defaultValue))
		})
	}
}

func TestNewFieldBool(t *testing.T) {
	type args struct {
		defaultValue *bool
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						bool: FieldBoolFrom(nil),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(true),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						bool: FieldBoolFrom(lo.ToPtr(true)),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(false),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						bool: FieldBoolFrom(lo.ToPtr(false)),
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldBool(tt.args.defaultValue), "NewFieldBool(%v)", tt.args.defaultValue)
		})
	}
}

func TestNewFieldDate(t *testing.T) {
	now := time.Now()
	type args struct {
		defaultValue *time.Time
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						date: FieldDateFrom(nil),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: &now,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						date: FieldDateFrom(&now),
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldDate(tt.args.defaultValue), "NewFieldDate(%v)", tt.args.defaultValue)
		})
	}
}

func TestNewFieldInteger(t *testing.T) {
	type args struct {
		defaultValue *int
		min          *int
		max          *int
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				min:          nil,
				max:          nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						integer: MustFieldIntegerFrom(nil, nil, nil),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(5),
				min:          lo.ToPtr(0),
				max:          lo.ToPtr(10),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						integer: MustFieldIntegerFrom(lo.ToPtr(5), lo.ToPtr(0), lo.ToPtr(10)),
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(-5),
				min:          lo.ToPtr(0),
				max:          lo.ToPtr(10),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						integer: nil,
					},
				},
				err: ErrMinDefaultInvalid,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(15),
				min:          lo.ToPtr(0),
				max:          lo.ToPtr(10),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						integer: nil,
					},
				},
				err: ErrMaxDefaultInvalid,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr(11),
				min:          lo.ToPtr(11),
				max:          lo.ToPtr(10),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						integer: nil,
					},
				},
				err: ErrMinMaxInvalid,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			b := NewFieldInteger(tt.args.defaultValue, tt.args.min, tt.args.max)
			if tt.want.err != nil {
				assert.Equal(t, tt.want.err, b.err)
				return
			}
			assert.Equal(t, tt.want.f, b.f)
		})
	}
}

func TestNewFieldMarkdown(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						markdown: &FieldMarkdown{
							defaultValue: nil,
							maxLength:    nil,
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("# test"),
				maxLength:    lo.ToPtr(50),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						markdown: &FieldMarkdown{
							defaultValue: lo.ToPtr("# test"),
							maxLength:    lo.ToPtr(50),
						},
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldMarkdown(tt.args.defaultValue, tt.args.maxLength))
		})
	}
}

func TestNewFieldReference(t *testing.T) {
	mId := id.NewModelID()
	type args struct {
		defaultValue model.ID
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: mId,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						reference: &FieldReference{
							modelID: mId,
						},
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldReference(tt.args.defaultValue))
		})
	}
}

func TestNewFieldRichText(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						richText: &FieldRichText{
							defaultValue: nil,
							maxLength:    nil,
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("test"),
				maxLength:    lo.ToPtr(50),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						richText: &FieldRichText{
							defaultValue: lo.ToPtr("test"),
							maxLength:    lo.ToPtr(50),
						},
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldRichText(tt.args.defaultValue, tt.args.maxLength), "NewFieldRichText(%v, %v)", tt.args.defaultValue, tt.args.maxLength)
		})
	}
}

func TestNewFieldSelect(t *testing.T) {
	type args struct {
		values       []string
		defaultValue *string
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				values:       nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{},
				},
				err: ErrFieldValues,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: nil,
				values:       []string{"v1", "v2", "V3"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						selectt: &FieldSelect{
							defaultValue: nil,
							values:       []string{"v1", "v2", "V3"},
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("v1"),
				values:       []string{"v1", "v2", "V3"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						selectt: &FieldSelect{
							defaultValue: lo.ToPtr("v1"),
							values:       []string{"v1", "v2", "V3"},
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("v4"),
				values:       []string{"v1", "v2", "V3"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{},
				},
				err: ErrFieldDefaultValue,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldSelect(tt.args.values, tt.args.defaultValue), "NewFieldSelect(%v, %v)", tt.args.values, tt.args.defaultValue)
		})
	}
}

func TestNewFieldTag(t *testing.T) {
	type args struct {
		values       []string
		defaultValue []string
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				values:       nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{},
				},
				err: ErrFieldValues,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: nil,
				values:       []string{"t1", "t2"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						tag: &FieldTag{
							defaultValue: nil,
							values:       []string{"t1", "t2"},
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: []string{"t1", "t2"},
				values:       []string{"t1", "t2", "t3"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						tag: &FieldTag{
							defaultValue: []string{"t1", "t2"},
							values:       []string{"t1", "t2", "t3"},
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: []string{"t1", "t4"},
				values:       []string{"t1", "t2", "t3"},
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{},
				},
				err: ErrFieldDefaultValue,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldTag(tt.args.values, tt.args.defaultValue), "NewFieldTag(%v, %v)", tt.args.values, tt.args.defaultValue)
		})
	}
}

func TestNewFieldText(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						text: &FieldText{
							defaultValue: nil,
							maxLength:    nil,
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("test"),
				maxLength:    lo.ToPtr(50),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						text: &FieldText{
							defaultValue: lo.ToPtr("test"),
							maxLength:    lo.ToPtr(50),
						},
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldText(tt.args.defaultValue, tt.args.maxLength), "NewFieldText(%v, %v)", tt.args.defaultValue, tt.args.maxLength)
		})
	}
}

func TestNewFieldTextArea(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						textArea: &FieldTextArea{
							defaultValue: nil,
							maxLength:    nil,
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("test"),
				maxLength:    lo.ToPtr(50),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						textArea: &FieldTextArea{
							defaultValue: lo.ToPtr("test"),
							maxLength:    lo.ToPtr(50),
						},
					},
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldTextArea(tt.args.defaultValue, tt.args.maxLength), "NewFieldTextArea(%v, %v)", tt.args.defaultValue, tt.args.maxLength)
		})
	}
}

func TestNewFieldURL(t *testing.T) {
	type args struct {
		defaultValue *string
	}
	tests := []struct {
		name string
		args args
		want *FieldBuilder
	}{
		{
			name: "test",
			args: args{
				defaultValue: nil,
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						url: &FieldURL{
							defaultValue: nil,
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("https://test.com"),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						url: &FieldURL{
							defaultValue: lo.ToPtr("https://test.com"),
						},
					},
				},
				err: nil,
			},
		},
		{
			name: "test",
			args: args{
				defaultValue: lo.ToPtr("test"),
			},
			want: &FieldBuilder{
				f: &Field{
					typeProperty: &TypeProperty{
						url: nil,
					},
				},
				err: ErrFieldDefaultValue,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewFieldURL(tt.args.defaultValue), "NewFieldURL(%v)", tt.args.defaultValue)
		})
	}
}

func TestFieldBuilder_NewID(t *testing.T) {
	type fields struct {
		f   *Field
		err error
	}
	tests := []struct {
		name   string
		fields fields
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			b.NewID()
			assert.NotNil(t, b.f.id)
			assert.False(t, b.f.id.IsEmpty())
		})
	}
}

func TestFieldBuilder_ID(t *testing.T) {
	fId := NewFieldID()
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		id FieldID
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test",
			fields: fields{
				f: &Field{},
			},
			args: args{
				id: fId,
			},
			want: &FieldBuilder{
				f: &Field{
					id: fId,
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.ID(tt.args.id))
		})
	}
}

func TestFieldBuilder_Key(t *testing.T) {
	k := key.Random()
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		key key.Key
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{k},
			want: &FieldBuilder{
				f:   &Field{key: k},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.Key(tt.args.key), "Key(%v)", tt.args.key)
		})
	}
}

func TestFieldBuilder_Name(t *testing.T) {
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		name string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				name: "n1",
			},
			want: &FieldBuilder{
				f:   &Field{name: "n1"},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.Name(tt.args.name), "Name(%v)", tt.args.name)
		})
	}
}

func TestFieldBuilder_Description(t *testing.T) {
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		description string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				description: "d1",
			},
			want: &FieldBuilder{
				f:   &Field{description: "d1"},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.Description(tt.args.description))
		})
	}
}

func TestFieldBuilder_RandomKey(t *testing.T) {
	type fields struct {
		f   *Field
		err error
	}
	tests := []struct {
		name   string
		fields fields
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			b.RandomKey()
			assert.NotNil(t, b.f.key)
			assert.True(t, b.f.key.IsValid())
		})
	}
}

func TestFieldBuilder_Options(t *testing.T) {
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		unique     bool
		multiValue bool
		required   bool
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test unique",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				unique:     true,
				multiValue: false,
				required:   false,
			},
			want: &FieldBuilder{
				f: &Field{
					unique:     true,
					multiValue: false,
					required:   false,
				},
				err: nil,
			},
		},
		{
			name: "test multiValue",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				unique:     false,
				multiValue: true,
				required:   false,
			},
			want: &FieldBuilder{
				f: &Field{
					unique:     false,
					multiValue: true,
					required:   false,
				},
				err: nil,
			},
		},
		{
			name: "test required",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				unique:     false,
				multiValue: false,
				required:   true,
			},
			want: &FieldBuilder{
				f: &Field{
					unique:     false,
					multiValue: false,
					required:   true,
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.Options(tt.args.unique, tt.args.multiValue, tt.args.required), "Options(%v, %v, %v)", tt.args.unique, tt.args.multiValue, tt.args.required)
		})
	}
}

func TestFieldBuilder_UpdatedAt(t *testing.T) {
	now := time.Now()
	type fields struct {
		f   *Field
		err error
	}
	type args struct {
		t time.Time
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *FieldBuilder
	}{
		{
			name: "test",
			fields: fields{
				f:   &Field{},
				err: nil,
			},
			args: args{
				t: now,
			},
			want: &FieldBuilder{
				f: &Field{
					updatedAt: now,
				},
				err: nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			b := &FieldBuilder{
				f:   tt.fields.f,
				err: tt.fields.err,
			}
			assert.Equal(t, tt.want, b.UpdatedAt(tt.args.t), "UpdatedAt(%v)", tt.args.t)
		})
	}
}
