package e2e

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExportModel_TimestampedFilename(t *testing.T) {
	e, gw := StartServerWithGateway(t, &app.Config{}, true, baseSeederUser)

	pID, _ := createProject(e, wId.String(), "export-test", "export test", "export-test-ts")
	mID, _ := createModel(e, pID, "ExportModel", "model for export", "export-model-ts")

	callExport := func() string {
		res := e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query: `mutation ExportModel($modelId: ID!, $format: ExportFormat!) {
					exportModel(input: {modelId: $modelId, format: $format}) {
						modelId
						url
					}
				}`,
				Variables: map[string]any{
					"modelId": mID,
					"format":  "JSON",
				},
			}).
			Expect().
			Status(http.StatusOK).
			JSON()
		return res.Path("$.data.exportModel.url").Raw().(string)
	}

	url1 := callExport()
	require.NotEmpty(t, url1)

	// URL must contain a Unix timestamp: {modelId}-{digits}.json
	tsPattern := regexp.MustCompile(`-(\d+)\.json$`)
	m1 := tsPattern.FindStringSubmatch(url1)
	require.Lenf(t, m1, 2, "URL %q should contain a timestamp", url1)

	// Extract the model-id prefix from the filename (part before first "-")
	filename1 := extractFilename(url1)
	modelIDPrefix := strings.SplitN(filename1, "-", 2)[0]

	// Exactly one export file should exist after the first export
	files1, err := gw.File.ListByPrefix(context.Background(), modelIDPrefix)
	assert.NoError(t, err)
	assert.Len(t, files1, 1, "exactly one export file should exist after first export")

	// Wait to ensure the next call gets a different Unix timestamp
	time.Sleep(1100 * time.Millisecond)

	url2 := callExport()
	require.NotEmpty(t, url2)
	assert.NotEqual(t, url1, url2, "second export should produce a different URL")

	m2 := tsPattern.FindStringSubmatch(url2)
	require.Lenf(t, m2, 2, "URL %q should contain a timestamp", url2)
	assert.NotEqual(t, m1[1], m2[1], "timestamps should differ between exports")

	// After the second export only the latest file should remain
	files2, err := gw.File.ListByPrefix(context.Background(), modelIDPrefix)
	assert.NoError(t, err)
	assert.Len(t, files2, 1, "old export file should have been deleted")
	assert.Contains(t, files2, extractFilename(url2), "new file should be present")
	assert.NotContains(t, files2, filename1, "old file should be deleted")
}

func TestExportModelSchema_TimestampedFilename(t *testing.T) {
	e, gw := StartServerWithGateway(t, &app.Config{}, true, baseSeederUser)

	pID, _ := createProject(e, wId.String(), "export-schema-test", "export schema", "export-schema-ts")
	mID, _ := createModel(e, pID, "ExportSchemaModel", "model for schema export", "export-schema-model-ts2")

	callExportSchema := func() string {
		res := e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query: `mutation ExportModelSchema($modelId: ID!) {
					exportModelSchema(input: {modelId: $modelId}) {
						modelId
						url
					}
				}`,
				Variables: map[string]any{
					"modelId": mID,
				},
			}).
			Expect().
			Status(http.StatusOK).
			JSON()
		return res.Path("$.data.exportModelSchema.url").Raw().(string)
	}

	url1 := callExportSchema()
	require.NotEmpty(t, url1)

	// URL must contain a Unix timestamp: {modelKey}-{digits}.schema.json
	tsPattern := regexp.MustCompile(`-(\d+)\.schema\.json$`)
	m1 := tsPattern.FindStringSubmatch(url1)
	require.Lenf(t, m1, 2, "URL %q should contain a timestamp", url1)

	// Use the known model key as prefix for FS queries
	const modelKey = "export-schema-model-ts2"

	files1, err := gw.File.ListByPrefix(context.Background(), modelKey)
	assert.NoError(t, err)
	assert.Len(t, files1, 1, "exactly one schema export file should exist after first export")

	// Wait to ensure a different Unix timestamp
	time.Sleep(1100 * time.Millisecond)

	url2 := callExportSchema()
	require.NotEmpty(t, url2)
	assert.NotEqual(t, url1, url2, "second schema export should produce a different URL")

	// After the second export only the latest file should remain
	files2, err := gw.File.ListByPrefix(context.Background(), modelKey)
	assert.NoError(t, err)
	assert.Len(t, files2, 1, "old schema export file should have been deleted")
	assert.Contains(t, files2, extractFilename(url2), "new schema file should be present")
	assert.NotContains(t, files2, extractFilename(url1), "old schema file should be deleted")
}

// extractFilename returns the last path segment of a URL or path string.
func extractFilename(rawURL string) string {
	if idx := strings.LastIndex(rawURL, "/"); idx >= 0 {
		return rawURL[idx+1:]
	}
	return rawURL
}
