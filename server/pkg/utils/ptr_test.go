package utils

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestIsPtrEqual(t *testing.T) {
	type args struct {
		a *int
		b *int
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{
			name: "both nil",
			args: args{
				a: nil,
				b: nil,
			},
			want: true,
		},
		{
			name: "one nil",
			args: args{
				a: nil,
				b: new(int),
			},
			want: false,
		},
		{
			name: "one nil",
			args: args{
				a: new(int),
				b: nil,
			},
			want: false,
		},
		{
			name: "both equal",
			args: args{
				a: new(int),
				b: new(int),
			},
			want: true,
		},
		{
			name: "both not equal",
			args: args{
				a: lo.ToPtr(123),
				b: new(int),
			},
			want: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, IsPtrEqual(tt.args.a, tt.args.b))
		})
	}
}
