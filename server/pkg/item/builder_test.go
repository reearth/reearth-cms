package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	iid := NewID()
	b, _ := New().ID(iid).Build()
	assert.Equal(t, iid, b.id)
}

func TestBuilder_LatestVersion(t *testing.T) {
	str := "xxx"
	v := NewVersion(&str, []string{"hoge"}, []string{"foo"}, id.FieldIDList{})
	b, _ := New().NewID().LatestVersion(v).Build()
	assert.Equal(t, v, b.LatestVersion())
}

func TestBuilder_ModelID(t *testing.T) {
	mid := NewModelID()
	b, _ := New().NewID().Model(mid).Build()
	assert.Equal(t, mid, b.Model())
}

func TestBuilder_PublicVersion(t *testing.T) {
	b, _ := New().NewID().PublicVersion("xxx").Build()
	assert.Equal(t, "xxx", b.PublicVersion())
}

func TestBuilder_UpdatedAt(t *testing.T) {
	b, _ := New().NewID().UpdatedAt(time.Unix(0, 0)).Build()
	assert.Equal(t, time.Unix(0, 0), b.UpdatedAt())
}

func TestBuilder_Versions(t *testing.T) {
	str := "xxx"
	v := NewVersion(&str, []string{"hoge"}, []string{"foo"}, id.FieldIDList{})
	b, _ := New().NewID().Versions([]*Version{v}).Build()
	assert.Equal(t, []*Version{v}, b.Versions())
}

func TestNew(t *testing.T) {
	res := New()
	assert.NotNil(t, res)
}

func TestBuilder_NewID(t *testing.T) {
	res, _ := New().NewID().Build()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Build(t *testing.T) {
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	iid := NewID()
	type fields struct {
		i *Item
	}
	tests := []struct {
		name    string
		fields  fields
		want    *Item
		wantErr bool
	}{
		{
			name: "should build an item",
			fields: fields{
				i: &Item{
					id:        iid,
					updatedAt: d,
				},
			},
			want: &Item{
				id:        iid,
				updatedAt: d,
			},
			wantErr: false,
		},
		{
			name: "should fail",
			fields: fields{
				i: &Item{},
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := &Builder{
				i: tt.fields.i,
			}
			got, err := b.Build()
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}
