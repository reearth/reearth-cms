//go:build tools

package tools

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen"
	_ "github.com/reearth/reearthx/tools"
	_ "go.uber.org/mock/mockgen"
)
