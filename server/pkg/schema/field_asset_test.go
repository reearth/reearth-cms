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
			assert.Equal(t, tc.want, FieldAssetFrom(tc.args.id))
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
