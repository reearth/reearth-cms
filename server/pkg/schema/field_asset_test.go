package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestFieldAssetFrom(t *testing.T) {
	aId := id.NewAssetID()
	type args struct {
		id *id.AssetID
	}
	tests := []struct {
		name string
		args args
		want *FieldAsset
	}{
		{
			name: "new",
			args: args{id: &aId},
			want: &FieldAsset{defaultValue: &aId},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, NewFieldAsset(tc.args.id))
		})
	}
}

func TestFieldAsset_TypeProperty(t *testing.T) {
	tests := []struct {
		name string
		f    FieldAsset
		want *TypeProperty
	}{
		{
			name: "new",
			f:    FieldAsset{},
			want: &TypeProperty{asset: &FieldAsset{}},
		},
	}
	for _, tc := range tests {
		tt := tc
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.f.TypeProperty())
		})
	}
}

func TestFieldAsset_DefaultValue(t *testing.T) {
	aId := id.NewAssetID()
	tests := []struct {
		name  string
		field *FieldAsset
		want  *id.AssetID
	}{
		{
			name:  "nil",
			field: &FieldAsset{defaultValue: nil},
			want:  nil,
		},
		{
			name:  "nil",
			field: &FieldAsset{defaultValue: &aId},
			want:  &aId,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.field.DefaultValue())
		})
	}
}
