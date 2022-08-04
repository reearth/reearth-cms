//go:generate go run github.com/99designs/gqlgen generate

package gql

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
)

// THIS CODE IS A STARTING POINT ONLY. IT WILL NOT BE UPDATED WITH SCHEMA CHANGES.

func NewDirective() DirectiveRoot {
	return DirectiveRoot{
		OnlyOne: func(ctx context.Context, obj interface{}, next graphql.Resolver) (res interface{}, err error) {
			return next(ctx)
		},
	}
}
