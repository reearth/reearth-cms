package integration

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.IntegrationID
type UserID = id.UserID
type ModelID = id.ModelID

var NewID = id.NewIntegrationID
var MustID = id.MustIntegrationID
var IDFrom = id.IntegrationIDFrom
var IDFromRef = id.IntegrationIDFromRef
var ErrInvalidID = id.ErrInvalidID
