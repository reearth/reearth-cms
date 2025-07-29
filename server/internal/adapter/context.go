package adapter

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"golang.org/x/text/language"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/appx"
)

type ContextKey string

const (
	contextUser     ContextKey = "user"
	contextOperator ContextKey = "operator"
	contextAPIKeyId ContextKey = "api-key-id"
	ContextAuthInfo ContextKey = "auth-info"
	contextUsecases ContextKey = "usecases"
	contextGateways ContextKey = "gateways"
)

func AttachUser(ctx context.Context, u *user.User) context.Context {
	return context.WithValue(ctx, contextUser, u)
}

func User(ctx context.Context) *user.User {
	if v := ctx.Value(contextUser); v != nil {
		if u, ok := v.(*user.User); ok {
			return u
		}
	}
	return nil
}

func AttachOperator(ctx context.Context, o *usecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func Operator(ctx context.Context) *usecase.Operator {
	if v := ctx.Value(contextOperator); v != nil {
		if op, ok := v.(*usecase.Operator); ok {
			return op
		}
	}
	return nil
}

func AttachUsecases(ctx context.Context, u *interfaces.Container) context.Context {
	return context.WithValue(ctx, contextUsecases, u)
}

func Usecases(ctx context.Context) *interfaces.Container {
	if v := ctx.Value(contextUsecases); v != nil {
		if uc, ok := v.(*interfaces.Container); ok {
			return uc
		}
	}
	return nil
}

func AttachGateways(ctx context.Context, g *gateway.Container) context.Context {
	return context.WithValue(ctx, contextGateways, g)
}

func Gateways(ctx context.Context) *gateway.Container {
	if v := ctx.Value(contextGateways); v != nil {
		if g, ok := v.(*gateway.Container); ok {
			return g
		}
	}
	return nil
}

func AttachAPIKeyId(ctx context.Context, a *project.APIKeyID) context.Context {
	return context.WithValue(ctx, contextAPIKeyId, a)
}

func APIKeyId(ctx context.Context) *project.APIKeyID {
	if v := ctx.Value(contextAPIKeyId); v != nil {
		if a, ok := v.(*project.APIKeyID); ok {
			return a
		}
	}
	return nil
}

func Lang(ctx context.Context, lang *language.Tag) string {
	if lang != nil && !lang.IsRoot() {
		return lang.String()
	}

	u := User(ctx)
	if u == nil {
		return "en" // default language
	}

	l := u.Metadata().Lang()
	if l.IsRoot() {
		return "en" // default language
	}

	return l.String()
}

func GetAuthInfo(ctx context.Context) *appx.AuthInfo {
	if v := ctx.Value(ContextAuthInfo); v != nil {
		if v2, ok := v.(appx.AuthInfo); ok {
			return &v2
		}
	}
	return nil
}
