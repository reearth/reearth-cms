package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchema_AddField(t *testing.T) {
	tests := []struct {
		name string
		s    *Schema
		f    *Field
		want *Schema
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			f:    &Field{name: "f1"},
			want: &Schema{fields: []*Field{{name: "f1"}}},
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{name: "f1"}}},
			f:    &Field{name: "f2"},
			want: &Schema{fields: []*Field{{name: "f1"}, {name: "f2"}}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			tc.s.AddField(*tc.f)
			assert.Equal(t, tc.want, tc.s)
		})
	}
}

func TestSchema_ID(t *testing.T) {
	sid := NewID()
	tests := []struct {
		name string
		s    Schema
		want ID
	}{
		{
			name: "id",
			want: ID{},
		},
		{
			name: "id",
			s: Schema{
				id: sid,
			},
			want: sid,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.ID())
		})
	}
}

func TestSchema_SetID(t *testing.T) {
	sid := NewID()
	tests := []struct {
		name string
		id   ID
		want *Schema
	}{
		{
			name: "id",
			id:   sid,
			want: &Schema{id: sid},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := &Schema{}
			s.SetID(tt.id)
			assert.Equal(t, tt.want, s)
		})
	}
}

func TestSchema_SetWorkspace(t *testing.T) {
	wid := id.NewWorkspaceID()
	tests := []struct {
		name string
		wid  id.WorkspaceID
		want *Schema
	}{
		{
			name: "id",
			wid:  wid,
			want: &Schema{workspace: wid},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := &Schema{}
			s.SetWorkspace(tt.wid)
			assert.Equal(t, tt.want, s)
		})
	}
}

func TestSchema_Workspace(t *testing.T) {
	wId := id.NewWorkspaceID()
	tests := []struct {
		name string
		s    Schema
		want id.WorkspaceID
	}{
		{
			name: "id",
			want: id.WorkspaceID{},
		},
		{
			name: "id",
			s: Schema{
				workspace: wId,
			},
			want: wId,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Workspace())
		})
	}
}
