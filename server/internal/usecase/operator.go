package usecase

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Operator struct {
	User          user.ID
	ReadableTeams user.TeamIDList
	WritableTeams user.TeamIDList
	OwningTeams   user.TeamIDList
}

func (o *Operator) Teams(r user.Role) []id.TeamID {
	if o == nil {
		return nil
	}
	if r == user.RoleReader {
		return o.ReadableTeams
	}
	if r == user.RoleWriter {
		return o.WritableTeams
	}
	if r == user.RoleOwner {
		return o.OwningTeams
	}
	return nil
}

func (o *Operator) AllReadableTeams() user.TeamIDList {
	return append(o.ReadableTeams, o.AllWritableTeams()...)
}

func (o *Operator) AllWritableTeams() user.TeamIDList {
	return append(o.WritableTeams, o.AllOwningTeams()...)
}

func (o *Operator) AllOwningTeams() user.TeamIDList {
	return o.OwningTeams
}

func (o *Operator) IsReadableTeam(team ...id.TeamID) bool {
	return o.AllReadableTeams().Filter(team...).Len() > 0
}

func (o *Operator) IsWritableTeam(team ...id.TeamID) bool {
	return o.AllWritableTeams().Filter(team...).Len() > 0
}

func (o *Operator) IsOwningTeam(team ...id.TeamID) bool {
	return o.AllOwningTeams().Filter(team...).Len() > 0
}

func (o *Operator) AddNewTeam(team id.TeamID) {
	o.OwningTeams = append(o.OwningTeams, team)
}
