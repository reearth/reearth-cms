package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchema_AddField(t *testing.T) {
	fid := NewFieldID()
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
			s:    &Schema{fields: []*Field{{id: fid, name: "f1"}}},
			f:    &Field{name: "f2"},
			want: &Schema{fields: []*Field{{id: fid, name: "f1"}, {name: "f2"}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid, name: "f1"}}},
			f:    &Field{id: fid, name: "f2"},
			want: &Schema{fields: []*Field{{id: fid, name: "f1"}}},
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

func TestSchema_HasField(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want bool
	}{
		{
			name: "add on empty array",
			s:    nil,
			fid:  fid1,
			want: false,
		},
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: false,
		},
		{
			name: "add on empty array",
			s:    &Schema{fields: []*Field{}},
			fid:  fid1,
			want: false,
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  NewFieldID(),
			want: false,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.HasField(tc.fid))
		})
	}
}

func TestSchema_RemoveField(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want *Schema
	}{
		{
			name: "add on empty array",
			s:    nil,
			fid:  fid1,
			want: nil,
		},
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: &Schema{},
		},
		{
			name: "add on empty array",
			s:    &Schema{fields: []*Field{}},
			fid:  fid1,
			want: &Schema{fields: []*Field{}},
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: &Schema{fields: []*Field{}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: &Schema{fields: []*Field{{id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid2,
			want: &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid3, name: "f3"}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid3,
			want: &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			tc.s.RemoveField(tc.fid)
			assert.Equal(t, tc.want, tc.s)
		})
	}
}

func TestSchema_Field(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want *Field
	}{
		{
			name: "add on empty array",
			s:    &Schema{fields: []*Field{}},
			fid:  fid1,
			want: nil,
		},
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: nil,
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: &Field{id: fid1, name: "f1"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: &Field{id: fid1, name: "f1"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid2,
			want: &Field{id: fid2, name: "f2"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid3,
			want: &Field{id: fid3, name: "f3"},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Field(tc.fid))
		})
	}
}

func TestSchema_Fields(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		want []*Field
	}{
		{
			name: "add on empty array",
			s:    nil,
			want: nil,
		},
		{
			name: "add on empty array",
			s:    &Schema{},
			want: nil,
		},
		{
			name: "add on empty array",
			s:    &Schema{fields: []*Field{}},
			want: []*Field{},
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			want: []*Field{{id: fid1, name: "f1"}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			want: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Fields())
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
