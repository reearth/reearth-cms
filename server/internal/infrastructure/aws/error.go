package aws

import (
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrMissingConfig = rerror.NewE(i18n.T("missing required config"))
)
