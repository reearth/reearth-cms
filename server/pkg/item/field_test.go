package item

import (
	"reflect"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func TestNewField(t *testing.T) {
	type args struct {
		schemaFieldID schema.FieldID
		valueType     schema.Type
		value         any
	}
	tests := []struct {
		name string
		args args
		want *Field
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NewField(tt.args.schemaFieldID, tt.args.valueType, tt.args.value); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewField() = %v, want %v", got, tt.want)
			}
		})
	}
}
