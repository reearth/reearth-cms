package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createIntegration(e *httpexpect.Expect, name, desc, logoUrl, iType string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `
		mutation CreateIntegration(
		  $name: String!
		  $description: String
		  $logoUrl: URL!
		  $type: IntegrationType!
		) {
		  createIntegration(
			input: { name: $name, description: $description, logoUrl: $logoUrl, type: $type }
		  ) {
			integration {
			  id
			  name
			  description
			  logoUrl
			  iType
			  config {
				token
			  }
			}
		  }
		}
	  `,
		Variables: map[string]any{
			"name":        name,
			"description": desc,
			"logoUrl":     logoUrl,
			"type":        iType,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.createIntegration.integration.id").Raw().(string), res
}

func regenerateToken(e *httpexpect.Expect, iId string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `
		mutation regenerateIntegrationToken($integrationId: ID!) {
			regenerateIntegrationToken(input: { integrationId: $integrationId }) {
			  integration {
				id
				name
				description
				logoUrl
				iType
				config {
					token
				}
			  }
			}
		  }
		`,
		Variables: map[string]any{
			"integrationId": iId,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.regenerateIntegrationToken.integration.config.token").Raw().(string), res
}

func TestRegenerateToken(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	iId, integration := createIntegration(e, "test", "test", "https://example.com/logo.png", "Public")
	oldToken := integration.Object().
		Value("data").Object().
		Value("createIntegration").Object().
		Value("integration").Object().
		Value("config").Object().
		Value("token")

	_, updatedIntegration := regenerateToken(e, iId)
	newToken := updatedIntegration.Object().
		Value("data").Object().
		Value("regenerateIntegrationToken").Object().
		Value("integration").Object().
		Value("config").Object().
		Value("token")

	// Check if the token is regenerated
	newToken.NotEqual(oldToken)
}
