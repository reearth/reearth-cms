package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestFieldInputList_TopLevel(t *testing.T) {
	t.Parallel()

	fid := id.NewFieldID()
	ig := id.NewItemGroupID()
	top := FieldInput{Field: &fid, Value: "a"}
	grouped := FieldInput{Field: &fid, Value: "b", Group: &ig}

	assert.Equal(t, FieldInputList{top}, FieldInputList{top, grouped}.TopLevel())
	assert.Empty(t, FieldInputList{grouped}.TopLevel())
	assert.Empty(t, FieldInputList(nil).TopLevel())
}

func TestFieldInputList_InGroups(t *testing.T) {
	t.Parallel()

	fid := id.NewFieldID()
	ig1, ig2, ig3 := id.NewItemGroupID(), id.NewItemGroupID(), id.NewItemGroupID()
	top := FieldInput{Field: &fid, Value: "top"}
	in1 := FieldInput{Field: &fid, Value: "1", Group: &ig1}
	in2 := FieldInput{Field: &fid, Value: "2", Group: &ig2}
	in3 := FieldInput{Field: &fid, Value: "3", Group: &ig3}
	l := FieldInputList{top, in1, in2, in3}

	assert.Equal(t, FieldInputList{in1, in3}, l.InGroups(id.ItemGroupIDList{ig1, ig3}))
	assert.Empty(t, l.InGroups(nil))
}

func TestFieldInputList_Has(t *testing.T) {
	t.Parallel()

	fid, fid2 := id.NewFieldID(), id.NewFieldID()
	ig, ig2 := id.NewItemGroupID(), id.NewItemGroupID()
	key := id.NewKey("k")
	l := FieldInputList{
		{Field: &fid, Value: "top"},
		{Field: &fid2, Value: "grouped", Group: &ig},
		{Key: &key, Value: "key only"},
	}

	tests := []struct {
		name  string
		fid   FieldID
		group *ItemGroupID
		want  bool
	}{
		{name: "top-level field", fid: fid, want: true},
		{name: "top-level field is not in a group", fid: fid, group: &ig, want: false},
		{name: "field in the group", fid: fid2, group: &ig, want: true},
		{name: "field in another group", fid: fid2, group: &ig2, want: false},
		{name: "group field is not top-level", fid: fid2, want: false},
		{name: "unknown field", fid: id.NewFieldID(), want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, l.Has(tt.fid, tt.group))
		})
	}
}
