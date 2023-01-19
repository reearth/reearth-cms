//go:build tools

//go:generate go run github.com/nicksnyder/go-i18n/v2/goi18n@latest extract -outdir ./intrnal/app/i18n -format yaml
//go:generate go run github.com/nicksnyder/go-i18n/v2/goi18n@latest merge -outdir ./intrnal/app/i18n -format yaml ./intrnal/app/i18n/locale.en.yaml ./intrnal/app/i18n/translate.ja.yaml

package tools

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/deepmap/oapi-codegen/cmd/oapi-codegen"
	_ "github.com/golang/mock/mockgen"
	_ "github.com/vektah/dataloaden"
)
