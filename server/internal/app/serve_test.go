package app

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/appx"
	"github.com/stretchr/testify/assert"
)

func TestUserJWT(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		ctx  context.Context
		want string
	}{
		{name: "with auth info", ctx: context.WithValue(context.Background(), adapter.ContextAuthInfo, appx.AuthInfo{Token: "jwt"}), want: "jwt"},
		{name: "without auth info", ctx: context.Background(), want: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, userJWT(tt.ctx))
		})
	}
}
