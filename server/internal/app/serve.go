package app

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
)

// userJWT returns the raw JWT the caller authenticated to CMS with, so
// reearth-serve requests are made on behalf of that user. It is empty for
// callers without a JWT, such as integration tokens or background jobs.
func userJWT(ctx context.Context) string {
	if ai := adapter.GetAuthInfo(ctx); ai != nil {
		return ai.Token
	}
	return ""
}
