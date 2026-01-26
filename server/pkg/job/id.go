package job

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.JobID
type IDList = id.JobIDList
type ProjectID = id.ProjectID
type UserID = id.UserID
type IntegrationID = id.IntegrationID

var NewID = id.NewJobID
var MustID = id.MustJobID
var IDFrom = id.JobIDFrom
var IDFromRef = id.JobIDFromRef
var IDListFrom = id.JobIDListFrom
