package repo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/stretchr/testify/assert"
)

func TestProjectFilter_CanRead(t *testing.T) {
	t.Parallel()
	p1, p2, p3 := project.NewID(), project.NewID(), project.NewID()

	tests := []struct {
		name   string
		filter ProjectFilter
		args   project.IDList
		want   bool
	}{
		{
			name: "must allow any project without a readable filter",
			args: project.IDList{p1, p2},
			want: true,
		},
		{
			name:   "must allow readable projects",
			filter: ProjectFilter{Readable: project.IDList{p1, p2}},
			args:   project.IDList{p1, p2},
			want:   true,
		},
		{
			name:   "must allow writable projects",
			filter: ProjectFilter{Readable: project.IDList{p1}, Writable: project.IDList{p2}},
			args:   project.IDList{p1, p2},
			want:   true,
		},
		{
			name:   "must deny when only some projects are readable",
			filter: ProjectFilter{Readable: project.IDList{p1}, Writable: project.IDList{p2}},
			args:   project.IDList{p1, p2, p3},
			want:   false,
		},
		{
			name:   "must deny an unreadable project",
			filter: ProjectFilter{Readable: project.IDList{}, Writable: project.IDList{}},
			args:   project.IDList{p1},
			want:   false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.filter.CanRead(tc.args...))
		})
	}
}

func TestProjectFilter_CanWrite(t *testing.T) {
	t.Parallel()
	p1, p2, p3 := project.NewID(), project.NewID(), project.NewID()

	tests := []struct {
		name   string
		filter ProjectFilter
		args   project.IDList
		want   bool
	}{
		{
			name: "must allow any project without a writable filter",
			args: project.IDList{p1, p2},
			want: true,
		},
		{
			name:   "must allow writable projects",
			filter: ProjectFilter{Writable: project.IDList{p1, p2}},
			args:   project.IDList{p1, p2},
			want:   true,
		},
		{
			name:   "must deny when only some projects are writable",
			filter: ProjectFilter{Writable: project.IDList{p1, p2}},
			args:   project.IDList{p1, p3},
			want:   false,
		},
		{
			name:   "must deny readable-only projects",
			filter: ProjectFilter{Readable: project.IDList{p1}, Writable: project.IDList{}},
			args:   project.IDList{p1},
			want:   false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.filter.CanWrite(tc.args...))
		})
	}
}
