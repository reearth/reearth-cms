package interactor

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestCollectReferenceIDs(t *testing.T) {
	t.Parallel()

	// Setup test data
	refID1 := id.NewItemID()
	refID2 := id.NewItemID()
	refID3 := id.NewItemID()
	fid1 := id.NewFieldID()
	fid2 := id.NewFieldID()
	fid3 := id.NewFieldID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	pid := id.NewProjectID()

	tests := []struct {
		name  string
		items item.List
		want  []id.ItemID
	}{
		{
			name:  "empty items list",
			items: item.List{},
			want:  nil,
		},
		{
			name: "items with no reference fields",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil),
					item.NewField(fid2, value.TypeNumber.Value(42).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: nil,
		},
		{
			name: "single item with single reference",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1},
		},
		{
			name: "single item with multiple references in one field",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.NewMultiple(value.TypeReference, []any{refID1, refID2}), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1, refID2},
		},
		{
			name: "multiple items with different references",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid2, value.TypeReference.Value(refID2).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1, refID2},
		},
		{
			name: "multiple items with duplicate references (deduplication)",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid2, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid3, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1},
		},
		{
			name: "items with mixed field types",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil),
					item.NewField(fid2, value.TypeReference.Value(refID1).AsMultiple(), nil),
					item.NewField(fid3, value.TypeNumber.Value(123).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1},
		},
		{
			name: "multiple reference fields in same item",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeReference.Value(refID1).AsMultiple(), nil),
					item.NewField(fid2, value.TypeReference.Value(refID2).AsMultiple(), nil),
					item.NewField(fid3, value.TypeReference.Value(refID3).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1, refID2, refID3},
		},
		{
			name: "complex scenario with duplicates across items",
			items: item.List{
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.NewMultiple(value.TypeReference, []any{refID1, refID2}), nil),
					item.NewField(fid2, value.TypeText.Value("test").AsMultiple(), nil),
				}).MustBuild(),
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.NewMultiple(value.TypeReference, []any{refID2, refID3}), nil),
				}).MustBuild(),
				item.New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*item.Field{
					item.NewField(fid1, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
			},
			want: []id.ItemID{refID1, refID2, refID3},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := collectReferenceIDs(tt.items)

			if tt.want == nil {
				assert.Nil(t, got)
			} else {
				assert.Len(t, got, len(tt.want))
				// Check that all expected IDs are present (order may vary due to map iteration)
				for _, wantID := range tt.want {
					assert.Contains(t, got, wantID)
				}
			}
		})
	}
}
