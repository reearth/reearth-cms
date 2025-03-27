package e2e

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

// GET /assets/{assetId}
func TestInternalGetProjectsAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e = e

}
