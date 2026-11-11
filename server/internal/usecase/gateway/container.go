package gateway

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrServeNotConfigured error = rerror.NewE(i18n.T("serve storage is not configured"))

type Container struct {
	Authenticator Authenticator
	File          File
	ServeFile     File
	ServeUpload   bool
	Mailer        Mailer
	PolicyChecker PolicyChecker
	TaskRunner    TaskRunner
	Accounts      Account
	JobPubSub     JobPubSub
	Authorization Authorization
}

func (c *Container) AssetFile(a *asset.Asset) (File, string, error) {
	if a.StoredInServe() {
		if c.ServeFile == nil {
			return nil, "", ErrServeNotConfigured
		}
		return c.ServeFile, *a.ServeID(), nil
	}
	return c.File, a.UUID(), nil
}

func (c *Container) AssetUploadFile() (File, bool) {
	if c.ServeUpload && c.ServeFile != nil {
		return c.ServeFile, true
	}
	return c.File, false
}

func (c *Container) AssetUploadFileOf(u *asset.Upload) (File, error) {
	if u.StoredInServe() {
		if c.ServeFile == nil {
			return nil, ErrServeNotConfigured
		}
		return c.ServeFile, nil
	}
	return c.File, nil
}

func (c *Container) AssetAccessInfoResolver() asset.AccessInfoResolver {
	return func(a *asset.Asset) *asset.AccessInfo {
		f, _, err := c.AssetFile(a)
		if err != nil || f == nil {
			return nil
		}
		return f.GetAccessInfo(a)
	}
}
