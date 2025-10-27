package project

import (
	"net/url"
	"regexp"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

var (
	ErrInvalidAlias error = rerror.NewE(i18n.T("invalid alias"))
	aliasRegexp           = regexp.MustCompile("^[a-zA-Z0-9_-]{5,32}$")
)

type Project struct {
	id            ID
	workspaceID   accountdomain.WorkspaceID
	alias         string
	name          string
	description   string
	readme        string
	license       string
	imageURL      *url.URL
	starCount     int64
	starredBy     []string
	updatedAt     time.Time
	accessibility *Accessibility
	requestRoles  []workspace.Role
}

func (p *Project) ID() ID {
	return p.id
}

func (p *Project) UpdatedAt() time.Time {
	return p.updatedAt
}

func (p *Project) Name() string {
	return p.name
}

func (p *Project) Description() string {
	return p.description
}

func (p *Project) Readme() string {
	return p.readme
}

func (p *Project) License() string {
	return p.license
}

func (p *Project) Alias() string {
	return p.alias
}

func (p *Project) ImageURL() *url.URL {
	if p == nil || p.imageURL == nil {
		return nil
	}
	// https://github.com/golang/go/issues/38351
	imageURL2 := *p.imageURL
	return &imageURL2
}

func (p *Project) StarCount() int64 {
	return p.starCount
}

func (p *Project) StarredBy() []string {
	return p.starredBy
}

func (p *Project) Workspace() accountdomain.WorkspaceID {
	return p.workspaceID
}

func (p *Project) CreatedAt() time.Time {
	return p.id.Timestamp()
}

func (p *Project) Accessibility() *Accessibility {
	return p.accessibility
}

func (p *Project) RequestRoles() []workspace.Role {
	return p.requestRoles
}

func (p *Project) SetUpdatedAt(updatedAt time.Time) {
	p.updatedAt = updatedAt
}

func (p *Project) SetImageURL(imageURL *url.URL) {
	if imageURL == nil {
		p.imageURL = nil
	} else {
		// https://github.com/golang/go/issues/38351
		imageURL2 := *imageURL
		p.imageURL = &imageURL2
	}
}

func (p *Project) SetAccessibility(accessibility Accessibility) {
	p.accessibility = accessibility.Clone()
}

func (p *Project) UpdateName(name string) {
	p.name = name
}

func (p *Project) UpdateDescription(description string) {
	p.description = description
}

func (p *Project) UpdateReadMe(readme string) {
	p.readme = readme
}

func (p *Project) UpdateLicense(license string) {
	p.license = license
}

func (p *Project) Star(uId accountdomain.UserID) {
	if p == nil {
		return
	}
	uIdStr := uId.String()
	for _, id := range p.starredBy {
		if id == uIdStr {
			return // already starred
		}
	}
	p.starCount++
	p.starredBy = append(p.starredBy, uIdStr)
}

func (p *Project) Unstar(uId accountdomain.UserID) {
	if p == nil {
		return
	}
	uIdStr := uId.String()
	for i, id := range p.starredBy {
		if id == uIdStr {
			p.starCount--
			p.starredBy = append(p.starredBy[:i], p.starredBy[i+1:]...)
			return
		}
	}
}

func (p *Project) SetRequestRoles(sr []workspace.Role) {
	p.requestRoles = slices.Clone(sr)
}

func (p *Project) UpdateAlias(alias string) error {
	if CheckAliasPattern(alias) {
		p.alias = alias
	} else {
		return ErrInvalidAlias
	}
	return nil
}

func (p *Project) Clone() *Project {
	if p == nil {
		return nil
	}

	return &Project{
		id:            p.id.Clone(),
		workspaceID:   p.workspaceID.Clone(),
		name:          p.name,
		description:   p.description,
		alias:         p.alias,
		imageURL:      util.CopyURL(p.imageURL),
		updatedAt:     p.updatedAt,
		accessibility: p.accessibility.Clone(),
		requestRoles:  p.requestRoles,
	}
}

func CheckAliasPattern(alias string) bool {
	return alias != "" && aliasRegexp.Match([]byte(alias))
}
