package exporters

import (
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrUnsupportedFormat  = rerror.NewE(i18n.T("unsupported export format"))
	ErrInvalidRequest     = rerror.NewE(i18n.T("invalid export request"))
	ErrNoGeometryField    = rerror.NewE(i18n.T("no geometry field in this model"))
	ErrNoPointField       = rerror.NewE(i18n.T("no point field in this model"))
	ErrWriterRequired     = rerror.NewE(i18n.T("writer is required for export"))
	ErrSchemaRequired     = rerror.NewE(i18n.T("schema is required for export"))
	ErrItemsRequired      = rerror.NewE(i18n.T("items are required for export"))
	ErrIncompatibleFormat = rerror.NewE(i18n.T("format is incompatible with export type"))
)
