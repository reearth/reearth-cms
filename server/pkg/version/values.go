package version

import (
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var ErrArchived = rerror.NewE(i18n.T("archived"))

func UnwrapValues[T, M any](l []*Version[T, M]) []*T {
	if l == nil {
		return nil
	}

	return lo.Map(l, func(v *Version[T, M], _ int) *T {
		return v.Value()
	})
}
