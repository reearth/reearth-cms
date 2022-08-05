package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_Build(t *testing.T) {
	tests := []struct {
		name    string
		builder *FieldBuilder
		want    *Field
		wantErr error
	}{
		{
			name: "nil id",
			builder: &FieldBuilder{
				f:   &Field{},
				err: ErrInvalidID,
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			got, err := tt.builder.Build()
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}
