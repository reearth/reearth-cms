package project

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.ProjectID
type WorkspaceID = id.WorkspaceID
type APIKeyID = id.APIKeyID
type ModelID = id.ModelID

type IDList = id.ProjectIDList
type ModelIDList = id.ModelIDList

var NewID = id.NewProjectID
var NewWorkspaceID = accountdomain.NewWorkspaceID
var NewAPIKeyID = id.NewAPIKeyID
var NewModelID = id.NewModelID

var MustID = id.MustProjectID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.ProjectIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom
var AccessTokenIDFrom = id.APIKeyIDFrom
var ModelIDFrom = id.ModelIDFrom

var IDFromRef = id.ProjectIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID

type IDOrAlias string

func (i IDOrAlias) ID() *ID {
	return IDFromRef(new(string(i)))
}

func (i IDOrAlias) Alias() *string {
	if string(i) != "" && i.ID() == nil {
		return new(string(i))
	}
	return nil
}
