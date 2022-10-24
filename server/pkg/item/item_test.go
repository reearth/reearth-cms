package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
	f := NewField(id.NewFieldID(), schema.TypeText, "test")
	now := time.Now()
	defer util.MockNow(now)()

	tests := []struct {
		name  string
		input []*Field
		want  *Item
	}{
		{
			name:  "should update fields",
			input: []*Field{f},
			want: &Item{
				fields:    []*Field{f},
				timestamp: now,
			},
		},
		{
			name:  "nil fields",
			input: nil,
			want:  &Item{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			i := &Item{}
			i.UpdateFields(tt.input)
			assert.Equal(t, tt.want, i)
		})
	}
}
