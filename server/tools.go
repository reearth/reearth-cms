//go:build tools

package tools

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/deepmap/oapi-codegen/cmd/oapi-codegen"
	_ "github.com/golang/mock/mockgen"
	_ "github.com/nicksnyder/go-i18n/v2/goi18n"
	_ "github.com/vektah/dataloaden"
)
