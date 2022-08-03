package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_Build(t *testing.T) {
	sId := NewID()
	wId := id.NewWorkspaceID()
	tests := []struct {
		name    string
		s       *Schema
		want    *Schema
		wantErr error
	}{
		{
			name:    "empty",
			s:       &Schema{},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "id only",
			s:       &Schema{id: NewID()},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "wid only",
			s:       &Schema{workspace: id.NewWorkspaceID()},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "minimal",
			s:       &Schema{id: sId, workspace: wId},
			want:    &Schema{id: sId, workspace: wId},
			wantErr: nil,
		},
		{
			name:    "full",
			s:       &Schema{id: sId, workspace: wId, fields: []*Field{{name: "F1"}}},
			want:    &Schema{id: sId, workspace: wId, fields: []*Field{{name: "F1"}}},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			b := &Builder{
				s: tt.s,
			}
			got, err := b.Build()
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestBuilder_Fields(t *testing.T) {
	b := &Builder{s: &Schema{}}
	f := []*Field{{name: "N1"}}
	b.Fields(f)
	assert.Equal(t, f, b.s.fields)
	assert.NotSame(t, f, b.s.fields)
}

func TestBuilder_ID(t *testing.T) {
	b := &Builder{s: &Schema{}}
	sId := NewID()
	b.ID(sId)
	assert.Equal(t, sId, b.s.id)
	assert.NotSame(t, sId, b.s.id)
}

func TestBuilder_MustBuild(t *testing.T) {
	sId := NewID()
	wId := id.NewWorkspaceID()
	tests := []struct {
		name    string
		s       *Schema
		want    *Schema
		wantErr error
	}{
		{
			name:    "empty",
			s:       &Schema{},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "id only",
			s:       &Schema{id: NewID()},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "wid only",
			s:       &Schema{workspace: id.NewWorkspaceID()},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name:    "minimal",
			s:       &Schema{id: sId, workspace: wId},
			want:    &Schema{id: sId, workspace: wId},
			wantErr: nil,
		},
		{
			name:    "full",
			s:       &Schema{id: sId, workspace: wId, fields: []*Field{{name: "F1"}}},
			want:    &Schema{id: sId, workspace: wId, fields: []*Field{{name: "F1"}}},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			b := &Builder{
				s: tt.s,
			}
			if tt.wantErr != nil {
				assert.PanicsWithValue(t, tt.wantErr, func() {
					b.MustBuild()
				})
			} else {
				assert.Equal(t, tt.want, b.MustBuild())
			}

		})
	}
}

func TestBuilder_NewID(t *testing.T) {
	b := &Builder{s: &Schema{}}
	assert.True(t, b.s.id.IsNil())
	b.NewID()
	assert.False(t, b.s.id.IsNil() || b.s.id.IsEmpty())
}

func TestBuilder_Workspace(t *testing.T) {
	b := &Builder{s: &Schema{}}
	wId := id.NewWorkspaceID()
	b.Workspace(wId)
	assert.Equal(t, wId, b.s.workspace)
	assert.NotSame(t, wId, b.s.workspace)
}

func TestNew(t *testing.T) {
	assert.Equal(t, &Builder{s: &Schema{}}, New())
}
