package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestM2MEndpointIntegration(t *testing.T) {
	e := echo.New()

	db := memory.New()
	g := &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	uc := &interfaces.Container{
		Asset:   interactor.NewAsset(db, g, interactor.ContainerConfig{}),
		Project: interactor.NewProject(db, g),
	}

	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	uid := accountdomain.NewUserID()

	privProj := project.New().NewID().
		Workspace(wid).
		Name("Private Project").
		Accessibility(project.NewAccessibility(
			project.VisibilityPrivate,
			nil,
			nil)).
		MustBuild()

	pubProj := project.New().NewID().
		Workspace(wid).
		Name("Public Project").
		Accessibility(project.NewAccessibility(
			project.VisibilityPublic,
			nil,
			nil)).
		MustBuild()

	privAsset := asset.New().NewID().
		Project(privProj.ID()).
		CreatedByUser(uid).
		FileName("private.txt").
		Size(100).
		NewUUID().
		MustBuild()

	pubAsset := asset.New().NewID().
		Project(pubProj.ID()).
		CreatedByUser(uid).
		FileName("public.txt").
		Size(100).
		NewUUID().
		MustBuild()

	assert.NoError(t, db.Project.Save(ctx, privProj))
	assert.NoError(t, db.Project.Save(ctx, pubProj))
	assert.NoError(t, db.Asset.Save(ctx, privAsset))
	assert.NoError(t, db.Asset.Save(ctx, pubAsset))

	token := "test-m2m-token"
	authMiddleware := M2MTokenAuthMiddleware(token)
	usecaseMiddleware := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := adapter.AttachUsecases(c.Request().Context(), uc)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}

	handler := echo.HandlerFunc(func(c echo.Context) error {
		return authMiddleware(usecaseMiddleware(M2MAssetHandler()))(c)
	})

	tests := []struct {
		name            string
		uuid            string
		token           string
		expectedStatus  int
		expectedPrivate *bool
	}{
		{
			name:            "Private asset with valid token",
			uuid:            privAsset.UUID(),
			token:           token,
			expectedStatus:  http.StatusOK,
			expectedPrivate: lo.ToPtr(true),
		},
		{
			name:            "Public asset with valid token",
			uuid:            pubAsset.UUID(),
			token:           token,
			expectedStatus:  http.StatusOK,
			expectedPrivate: lo.ToPtr(false),
		},
		{
			name:            "Non-existent asset with valid token",
			uuid:            "non-existent-uuid",
			token:           token,
			expectedStatus:  http.StatusNotFound,
			expectedPrivate: nil,
		},
		{
			name:            "Private asset without token",
			uuid:            privAsset.UUID(),
			token:           "",
			expectedStatus:  http.StatusUnauthorized,
			expectedPrivate: nil,
		},
		{
			name:            "Private asset with wrong token",
			uuid:            privAsset.UUID(),
			token:           "wrong-token",
			expectedStatus:  http.StatusUnauthorized,
			expectedPrivate: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/m2m/assets/"+tt.uuid+"/is-private", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", "Bearer "+tt.token)
			}
			rec := httptest.NewRecorder()

			c := e.NewContext(req, rec)
			c.SetPath("/api/m2m/assets/:uuid/is-private")
			c.SetParamNames("uuid")
			c.SetParamValues(tt.uuid)

			err := handler(c)
			assert.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, rec.Code)

			if tt.expectedStatus == http.StatusOK && tt.expectedPrivate != nil {
				var resp map[string]interface{}
				assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
				assert.Equal(t, *tt.expectedPrivate, resp["isPrivate"])
			}
		})
	}
}
