package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewVersion(t *testing.T) {
	v := "xxx"
	fid := id.NewFieldID()
	type args struct {
		version *string
		parent  []string
		ref     []string
		fields  id.FieldIDList
	}
	tests := []struct {
		name string
		args args
		want *Version
	}{
		{
			name: "should create a version",
			args: args{
				version: &v,
				parent:  []string{"hoge"},
				ref:     []string{"foo"},
				fields:  id.FieldIDList{fid},
			},
			want: &Version{
				version: v,
				parent:  []string{"hoge"},
				ref:     []string{"foo"},
				fields:  id.FieldIDList{fid},
			},
		},
		{
			name: "should not create a version",
			args: args{
				version: nil,
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewVersion(tt.args.version, tt.args.parent, tt.args.ref, tt.args.fields)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestVersion_AddField(t *testing.T) {
	fid := id.NewFieldID()
	v := "xxx"
	type fields struct {
		version *string
		fields  id.FieldIDList
	}
	type args struct {
		field id.FieldID
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   id.FieldIDList
	}{
		{
			name: "should add a field",
			fields: fields{
				version: &v,
				fields:  id.FieldIDList{},
			},
			args: args{field: fid},
			want: id.FieldIDList{fid},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			v := &Version{
				version: *tt.fields.version,
				fields:  tt.fields.fields,
			}
			v.AddField(tt.args.field)
			assert.Equal(t, tt.want, v.Fields())
		})
	}
}

func TestVersion_AddParent(t *testing.T) {
	v := "xxx"
	p := "foo"
	type fields struct {
		version *string
		parent  []string
	}
	type args struct {
		parent *string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   []string
	}{
		{
			name: "should add a ref",
			fields: fields{
				version: &v,
			},
			args: args{&p},
			want: []string{"foo"},
		},
		{
			name: "fail nil ref",
			fields: fields{
				version: &v,
			},
			args: args{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			v := &Version{
				version: *tt.fields.version,
				parent:  tt.fields.parent,
			}
			v.AddParent(tt.args.parent)
			assert.Equal(t, tt.want, v.Parent())
		})
	}
}

func TestVersion_AddRef(t *testing.T) {
	v := "xxx"
	r := "foo"
	type fields struct {
		version *string
		ref     []string
	}
	type args struct {
		parent *string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   []string
	}{
		{
			name: "should add a ref",
			fields: fields{
				version: &v,
			},
			args: args{&r},
			want: []string{"foo"},
		},
		{
			name: "fail nil ref",
			fields: fields{
				version: &v,
			},
			args: args{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			v := &Version{
				version: *tt.fields.version,
				ref:     tt.fields.ref,
			}
			v.AddRef(tt.args.parent)
			assert.Equal(t, tt.want, v.Ref())
		})
	}
}

func TestVersion_Version(t *testing.T) {
	v := &Version{
		version: "xxx",
	}
	assert.Equal(t, "xxx", v.Version())
}
