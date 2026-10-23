package mongo

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestApplyProjectFilter(t *testing.T) {
	t.Parallel()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	in := bson.M{"$in": []string{p1.String()}}

	tests := []struct {
		name   string
		filter any
		ids    id.ProjectIDList
		want   any
	}{
		{
			name:   "must keep the filter without a restriction",
			filter: bson.M{"id": "x"},
			want:   bson.M{"id": "x"},
		},
		{
			name:   "must add the restriction",
			filter: bson.M{"id": "x"},
			ids:    id.ProjectIDList{p1},
			want:   bson.M{"id": "x", "project": in},
		},
		{
			name:   "must keep the restriction of a filter keyed by project",
			filter: bson.M{"project": p2.String()},
			ids:    id.ProjectIDList{p1},
			want:   bson.M{"$and": []any{bson.M{"project": p2.String()}, bson.M{"project": in}}},
		},
		{
			name:   "must restrict to nothing with an empty list",
			filter: bson.M{"project": p2.String()},
			ids:    id.ProjectIDList{},
			want: bson.M{"$and": []any{
				bson.M{"project": p2.String()},
				bson.M{"project": bson.M{"$in": []string{}}},
			}},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, applyProjectFilter(tc.filter, tc.ids))
		})
	}
}

func TestReadableProjects(t *testing.T) {
	t.Parallel()
	p1, p2 := id.NewProjectID(), id.NewProjectID()

	tests := []struct {
		name   string
		filter repo.ProjectFilter
		want   id.ProjectIDList
	}{
		{
			name:   "must not restrict without a readable list",
			filter: repo.ProjectFilter{Writable: id.ProjectIDList{p1}},
		},
		{
			name:   "must not restrict without a writable list, as every project is writable",
			filter: repo.ProjectFilter{Readable: id.ProjectIDList{p1}},
		},
		{
			name:   "must include writable projects",
			filter: repo.ProjectFilter{Readable: id.ProjectIDList{p1}, Writable: id.ProjectIDList{p2}},
			want:   id.ProjectIDList{p1, p2},
		},
		{
			name:   "must keep empty lists restricted",
			filter: repo.ProjectFilter{Readable: id.ProjectIDList{}, Writable: id.ProjectIDList{}},
			want:   id.ProjectIDList{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, readableProjects(tc.filter))
		})
	}
}
