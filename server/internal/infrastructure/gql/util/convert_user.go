package util

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"golang.org/x/text/language"
)

func ToUserMetadata(m gqlmodel.UserMetadata) user.Metadata {
	return user.NewMetadata().
		Description(string(m.Description)).
		Lang(language.Make(string(m.Lang))).
		PhotoURL(string(m.PhotoURL)).
		Theme(string(m.Theme)).
		Website(string(m.Website)).
		MustBuild()
}
