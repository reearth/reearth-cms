package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	iid := NewID()
	b := New().ID(iid).Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).MustBuild()
	assert.Equal(t, iid, b.id)
}

func TestBuilder_SchemaID(t *testing.T) {
	sid := schema.NewID()
	b := New().NewID().Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).MustBuild()
	assert.Equal(t, sid, b.Schema())
}

func TestBuilder_Fields(t *testing.T) {
	sfid := schema.NewFieldID()
	fields := []*Field{NewField(sfid, schema.TypeBool, true)}
	b := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Fields(fields).MustBuild()
	assert.Equal(t, fields, b.Fields())
	b = New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Model(id.NewModelID()).Fields(nil).MustBuild()
	assert.Nil(t, b.Fields())
}

func TestNew(t *testing.T) {
	res := New()
	assert.NotNil(t, res)
}

func TestBuilder_NewID(t *testing.T) {
	res, _ := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Build()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Project(t *testing.T) {
	pid := project.NewID()
	b := New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).MustBuild()
	assert.Equal(t, pid, b.Project())
}

func TestBuilder_Model(t *testing.T) {
	mid := id.NewModelID()
	b := New().NewID().Model(mid).Project(id.NewProjectID()).Schema(id.NewSchemaID()).MustBuild()
	assert.Equal(t, mid, b.Model())
}

func TestBuilder_Timestamp(t *testing.T) {
	tt := time.Now()
	b := New().NewID().Project(id.NewProjectID()).Schema(id.NewSchemaID()).Model(id.NewModelID()).Timestamp(tt).Schema(id.NewSchemaID()).MustBuild()
	assert.Equal(t, tt, b.Timestamp())
}

func TestBuilder_Build(t *testing.T) {
	iid := NewID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	pid := id.NewProjectID()
	now := time.Now()
	defer util.MockNow(now)()

	type fields struct {
		i *Item
	}
	tests := []struct {
		name    string
		fields  fields
		want    *Item
		wantErr error
	}{
		{
			name: "should build an item",
			fields: fields{
				i: &Item{
					id:      iid,
					schema:  sid,
					project: pid,
					model:   mid,
				},
			},
			want: &Item{
				id:        iid,
				schema:    sid,
				project:   pid,
				model:     mid,
				timestamp: now,
			},
			wantErr: nil,
		},
		{
			name: "should fail: invalid item ID",
			fields: fields{
				i: &Item{},
			},
			want:    nil,
			wantErr: id.ErrInvalidID,
		},
		{
			name: "should fail: invalid schema ID",
			fields: fields{
				i: &Item{
					id:      iid,
					project: pid,
				},
			},
			want:    nil,
			wantErr: id.ErrInvalidID,
		},
		{
			name: "should fail: invalid project ID",
			fields: fields{
				i: &Item{
					id:     iid,
					schema: sid,
				},
			},
			want:    nil,
			wantErr: id.ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			b := &Builder{
				i: tt.fields.i,
			}

			got, err := b.Build()
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Panics(t, func() {
					_ = b.MustBuild()
				})
			} else {
				assert.Equal(t, tt.want, got)
				got = b.MustBuild()
				assert.Equal(t, tt.want, got)
			}
		})
	}
}
