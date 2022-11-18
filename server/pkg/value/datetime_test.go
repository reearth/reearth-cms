package value

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_propertyDateTime_ToValue(t *testing.T) {
	now := time.Now().Truncate(time.Second)
	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name: "time",
			args: []any{
				now, now.Format(time.RFC3339), now.Format(time.RFC3339Nano),
			},
			want1: now,
			want2: true,
		},
		{
			name:  "integer",
			args:  []any{now.Unix(), float64(now.Unix()), json.Number(fmt.Sprintf("%d", now.Unix()))},
			want1: now,
			want2: true,
		},
		{
			name:  "nil",
			args:  []any{"foo", (*float64)(nil), (*string)(nil), (*int)(nil), (*json.Number)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &propertyDateTime{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyDateTime_ToInterface(t *testing.T) {
	v := time.Now()
	tt, ok := (&propertyDateTime{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyDateTime_Validate(t *testing.T) {
	assert.True(t, (&propertyDateTime{}).Validate(time.Now()))
	assert.False(t, (&propertyDateTime{}).Validate("a"))
}
