package user

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.UserID
type WorkspaceID = id.WorkspaceID

var NewID = id.NewUserID
var NewWorkspaceID = id.NewWorkspaceID

var MustID = id.MustUserID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.UserIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.UserIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef

var IDFromRefID = id.UserIDFromRefID
var WorkspaceIDFromRefID = id.WorkspaceIDFromRefID

var ErrInvalidID = id.ErrInvalidID

type WorkspaceIDList []WorkspaceID

func (l WorkspaceIDList) Clone() WorkspaceIDList {
	if l == nil {
		return nil
	}
	return append(WorkspaceIDList{}, l...)
}

func (l WorkspaceIDList) Filter(ids ...WorkspaceID) WorkspaceIDList {
	if l == nil {
		return nil
	}

	res := make(WorkspaceIDList, 0, len(l))
	for _, t := range l {
		for _, t2 := range ids {
			if t == t2 {
				res = append(res, t)
			}
		}
	}
	return res
}

func (l WorkspaceIDList) Includes(ids ...WorkspaceID) bool {
	for _, t := range l {
		for _, t2 := range ids {
			if t == t2 {
				return true
			}
		}
	}
	return false
}

func (k WorkspaceIDList) Len() int {
	return len(k)
}

func (k WorkspaceIDList) Strings() []string {
	return id.WorkspaceIDsToStrings(k)
}
