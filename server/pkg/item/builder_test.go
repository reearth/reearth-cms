package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	iid := NewID()
	b, _ := New().ID(iid).Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	assert.Equal(t, iid, b.id)
}

func TestBuilder_SchemaID(t *testing.T) {
	sid := schema.NewID()
	b, _ := New().NewID().Schema(sid).Project(id.NewProjectID()).Build()
	assert.Equal(t, sid, b.Schema())
}

func TestBuilder_Fields(t *testing.T) {
	sfid := schema.NewFieldID()
	fs := []*Field{NewField(sfid, schema.TypeBool, true)}
	b, _ := New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Fields(fs).Build()
	assert.Equal(t, fs, b.Fields())
}

func TestNew(t *testing.T) {
	res := New()
	assert.NotNil(t, res)
}

func TestBuilder_NewID(t *testing.T) {
	res, _ := New().NewID().Schema(id.NewSchemaID()).Project(id.NewProjectID()).Build()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Build(t *testing.T) {
	iid := NewID()
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
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
					schemaID:  sid,
					projectID: pid,
				},
			},
			want: &Item{
				id:        iid,
				schemaID:  sid,
				projectID: pid,
			},
			wantErr: false,
		},
		{
			name: "should fail: invalid item ID",
			fields: fields{
				i: &Item{},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "should fail: invalid schema ID",
			fields: fields{
				i: &Item{
					id:        iid,
					projectID: pid,
				},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "should fail: invalid project ID",
			fields: fields{
				i: &Item{
					id:       iid,
					schemaID: sid,
				},
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

func TestBuilder_Project(t *testing.T) {
	pid := project.NewID()
	b, _ := New().NewID().Project(pid).Schema(id.NewSchemaID()).Build()
	assert.Equal(t, pid, b.Project())
}
