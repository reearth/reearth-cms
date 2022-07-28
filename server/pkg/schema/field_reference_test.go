package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/stretchr/testify/assert"
)

func TestFieldReferenceFrom(t *testing.T) {
	mId := id.NewModelID()
	type args struct {
		id model.ID
	}
	tests := []struct {
		name string
		args args
		want *FieldReference
	}{
		{
			name: "new",
			args: args{id: mId},
			want: &FieldReference{modelID: mId},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldReferenceFrom(tc.args.id))
		})
	}
}

func TestFieldReference_TypeProperty(t *testing.T) {
	tests := []struct {
		name string
		f    FieldReference
		want *TypeProperty
	}{
		{
			name: "new",
			f:    FieldReference{},
			want: &TypeProperty{reference: &FieldReference{}},
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
