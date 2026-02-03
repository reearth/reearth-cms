package e2e

import (
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/gorilla/websocket"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// subscribeJob connects to a GraphQL WebSocket subscription and calls onMessage for each received message.
// It handles connection initialization, subscription setup, and cleanup.
// The onMessage callback receives the parsed payload data for each "next" message.
// Returns when the subscription completes, errors, or times out.
func subscribeJob(t *testing.T, wsURL, jobId string, timeout time.Duration, onMessage func(*httpexpect.Value, int)) {
	t.Helper()

	// Subscribe to job state updates
	header := http.Header{
		"Origin":               []string{"https://example.com"},
		"X-Reearth-Debug-User": []string{uId1.String()},
	}

	query := `subscription JobState($jobId: ID!) {
		jobState(jobId: $jobId) {
			status
			progress {
				processed
				total
				percentage
			}
			error
		}
	}`

	// wsMessage represents a GraphQL over WebSocket message
	type wsMessage struct {
		ID      string          `json:"id,omitempty"`
		Type    string          `json:"type"`
		Payload json.RawMessage `json:"payload,omitempty"`
	}

	// subscribePayload represents the payload for a subscription message
	type subscribePayload struct {
		Query     string         `json:"query"`
		Variables map[string]any `json:"variables,omitempty"`
	}

	dialer := websocket.Dialer{Subprotocols: []string{"graphql-transport-ws"}}
	conn, _, err := dialer.Dial(wsURL, header)
	if err != nil {
		t.Fatalf("failed to connect to websocket: %v", err)
	}
	defer func() {
		if err := conn.Close(); err != nil && !errors.Is(err, net.ErrClosed) {
			t.Fatalf("failed to close websocket: %v", err)
		}
	}()

	// Send connection_init
	initMsg := wsMessage{Type: "connection_init"}
	if err := conn.WriteJSON(initMsg); err != nil {
		t.Fatalf("failed to send connection_init: %v", err)
	}

	// Wait for connection_ack
	var ackMsg wsMessage
	if err := conn.ReadJSON(&ackMsg); err != nil {
		t.Fatalf("failed to read connection_ack: %v", err)
	}
	if ackMsg.Type != "connection_ack" {
		t.Fatalf("expected connection_ack, got %s", ackMsg.Type)
	}

	// Send subscription
	b, err := json.Marshal(subscribePayload{
		Query:     query,
		Variables: map[string]any{"jobId": jobId},
	})
	if err != nil {
		t.Fatalf("failed to marshal subscribe payload: %v", err)
	}

	subMsg := wsMessage{
		ID:      "1",
		Type:    "subscribe",
		Payload: json.RawMessage(b),
	}
	if err := conn.WriteJSON(subMsg); err != nil {
		t.Fatalf("failed to send subscribe: %v", err)
	}

	// Read messages
	done := make(chan struct{})
	idx := 0
	go func() {
		defer close(done)
		for {
			var msg wsMessage
			if err := conn.ReadJSON(&msg); err != nil {
				return
			}

			switch msg.Type {
			case "next":
				// Wrap the payload in httpexpect.Value and pass to onMessage
				v := httpexpect.NewValue(t, msg.Payload)
				onMessage(v, idx)
				idx++
			case "complete", "error":
				return
			}
		}
	}()

	// Wait for completion or timeout
	select {
	case <-done:
		// Subscription completed normally
	case <-time.After(timeout):
		if err := conn.Close(); err != nil && !errors.Is(err, net.ErrClosed) {
			t.Fatalf("failed to close websocket connection on timeout: %v", err)
		}
	}
}

// importItemsAsync executes the importItemsAsync GraphQL mutation with file upload
func importItemsAsync(e *httpexpect.Expect, modelID string, fileName string, fileContent string, geoField *string) *httpexpect.Value {
	query := `mutation ImportItemsAsync($input: ImportItemsInput!) {
		importItemsAsync(input: $input) {
			job {
				id
				type
				status
				projectId
				progress {
					processed
					total
					percentage
				}
			}
		}
	}`

	inputMap := map[string]any{
		"modelId": modelID,
		"file":    nil, // placeholder for multipart file upload
	}
	if geoField != nil {
		inputMap["geoField"] = *geoField
	}

	variables := map[string]any{
		"input": inputMap,
	}

	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	operations, _ := json.Marshal(requestBody)
	mapJSON := `{ "0": ["variables.input.file"] }`

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithMultipart().
		WithFormField("operations", string(operations)).
		WithFormField("map", mapJSON).
		WithFile("0", fileName, strings.NewReader(fileContent)).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// queryJob queries a job by ID
func queryJob(e *httpexpect.Expect, jobID string) *httpexpect.Value {
	query := `query Job($jobId: ID!) {
		job(jobId: $jobId) {
			id
			type
			status
			projectId
			progress {
				processed
				total
				percentage
			}
			error
			createdAt
			updatedAt
			startedAt
			completedAt
		}
	}`

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithJSON(GraphQLRequest{
			Query: query,
			Variables: map[string]any{
				"jobId": jobID,
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// queryJobs queries jobs by project ID
func queryJobs(e *httpexpect.Expect, projectID string, jobType *string, status *string) *httpexpect.Value {
	query := `query Jobs($projectId: ID!, $type: JobType, $status: JobStatus) {
		jobs(projectId: $projectId, type: $type, status: $status) {
			id
			type
			status
			projectId
			progress {
				processed
				total
				percentage
			}
		}
	}`

	variables := map[string]any{
		"projectId": projectID,
	}
	if jobType != nil {
		variables["type"] = *jobType
	}
	if status != nil {
		variables["status"] = *status
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithJSON(GraphQLRequest{
			Query:     query,
			Variables: variables,
		}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// cancelJob cancels a job by ID
func cancelJob(e *httpexpect.Expect, jobID string) *httpexpect.Value {
	query := `mutation CancelJob($jobId: ID!) {
		cancelJob(jobId: $jobId) {
			id
			status
		}
	}`

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithJSON(GraphQLRequest{
			Query: query,
			Variables: map[string]any{
				"jobId": jobID,
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// waitForJobCompletion polls the job status until it's completed, failed, or canceled
func waitForJobCompletion(e *httpexpect.Expect, jobID string, timeout time.Duration) *httpexpect.Value {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		res := queryJob(e, jobID)
		status := res.Path("$.data.job.status").String().Raw()
		if status == "COMPLETED" || status == "FAILED" || status == "CANCELLED" {
			return res
		}
		time.Sleep(100 * time.Millisecond)
	}
	return queryJob(e, jobID)
}

// TestGQLImportItemsAsync tests the async import functionality
func TestGQLImportItemsAsync(t *testing.T) {
	type createFieldParams struct {
		title    string
		key      string
		fType    string
		typeProp map[string]any
	}

	tests := []struct {
		name           string
		fields         []createFieldParams
		fileName       string
		fileContent    func() string
		geoField       *string
		expectError    bool
		errorContains  string
		expectedTotal  int
		expectedInsert int
	}{
		{
			name: "async import returns job immediately",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "test.json",
			fileContent: func() string {
				return `[
					{"name": "Item 1", "count": 10},
					{"name": "Item 2", "count": 20},
					{"name": "Item 3", "count": 30}
				]`
			},
			expectError:    false,
			expectedTotal:  3,
			expectedInsert: 3,
		},
		{
			name: "async import with GeoJSON",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "location", key: "location", fType: "GeometryObject", typeProp: map[string]any{
					"geometryObject": map[string]any{
						"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
					},
				}},
			},
			fileName: "locations.geojson",
			fileContent: func() string {
				return `{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [139.6917, 35.6895]},
							"properties": {"name": "Tokyo"}
						},
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [-122.4194, 37.7749]},
							"properties": {"name": "San Francisco"}
						}
					]
				}`
			},
			geoField:       lo.ToPtr("location"),
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "async import with multiple batches",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "batches.json",
			fileContent: func() string {
				var items []string
				for i := 0; i < 1050; i++ {
					items = append(items, `{"name": "test"}`)
				}
				return "[" + strings.Join(items, ",") + "]"
			},
			expectError:    false,
			expectedTotal:  1050,
			expectedInsert: 1050,
		},
		{
			name: "async import with empty array",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "empty.json",
			fileContent: func() string {
				return "[]"
			},
			expectError:    false,
			expectedTotal:  0,
			expectedInsert: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := StartServer(t, &app.Config{}, true, baseSeederUser)

			pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
			mId, _ := createModel(e, pId, "test", "test", "e2e-alias")

			// Create fields for the model
			for _, f := range tt.fields {
				createField(e, mId, f.title, f.title, f.key,
					false, false, false, false, f.fType, f.typeProp)
			}

			// Execute async import
			res := importItemsAsync(e, mId, tt.fileName, tt.fileContent(), tt.geoField)

			if tt.expectError {
				errs := res.Path("$.errors").Array()
				errs.Length().Gt(0)
				if tt.errorContains != "" {
					errs.Value(0).Object().Value("message").String().Contains(tt.errorContains)
				}
				return
			}

			// Verify a job was created
			res.Path("$.data.importItemsAsync.job").NotNull()
			res.Path("$.data.importItemsAsync.job.id").String().NotEmpty()
			res.Path("$.data.importItemsAsync.job.type").String().IsEqual("IMPORT")
			res.Path("$.data.importItemsAsync.job.status").String().InList(
				gqlmodel.JobStatusPending.String(),
				gqlmodel.JobStatusInProgress.String(),
				gqlmodel.JobStatusCompleted.String(),
			)

			jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

			// Wait for job completion
			finalRes := waitForJobCompletion(e, jobID, 30*time.Second)

			// Verify a job completed successfully
			finalRes.Path("$.data.job.status").String().IsEqual(gqlmodel.JobStatusCompleted.String())
			finalRes.Path("$.data.job.error").IsNull()
			finalRes.Path("$.data.job.completedAt").NotNull()

			// Verify progress shows correct totals
			finalRes.Path("$.data.job.progress.total").Number().IsEqual(tt.expectedTotal)
			finalRes.Path("$.data.job.progress.processed").Number().IsEqual(tt.expectedTotal)
			if tt.expectedTotal > 0 {
				finalRes.Path("$.data.job.progress.percentage").Number().IsEqual(100)
			}

			// Verify items were created by searching
			if tt.expectedTotal > 0 {
				searchRes := SearchItem(e,
					map[string]any{"project": pId, "model": mId},
					nil,
					nil,
					map[string]any{"first": 1},
				)
				searchRes.Path("$.data.searchItem.totalCount").Number().IsEqual(tt.expectedTotal)
			}
		})
	}
}

// TestGQLImportItemsAsyncJobQuery tests querying jobs
func TestGQLImportItemsAsyncJobQuery(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create a job via async import
	fileContent := `[{"name": "Item 1"}, {"name": "Item 2"}]`
	res := importItemsAsync(e, mId, "test.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Wait for completion
	waitForJobCompletion(e, jobID, 10*time.Second)

	// Query job by ID
	jobRes := queryJob(e, jobID)
	jobRes.Path("$.data.job").NotNull()
	jobRes.Path("$.data.job.id").String().IsEqual(jobID)
	jobRes.Path("$.data.job.type").String().IsEqual("IMPORT")
	jobRes.Path("$.data.job.status").String().IsEqual("COMPLETED")

	// Query jobs by project
	jobsRes := queryJobs(e, pId, nil, nil)
	jobsRes.Path("$.data.jobs").Array().Length().Ge(1)

	// Query jobs by project and type
	jobsRes = queryJobs(e, pId, lo.ToPtr("IMPORT"), nil)
	jobsRes.Path("$.data.jobs").Array().Length().Ge(1)

	// Query jobs by project and status
	jobsRes = queryJobs(e, pId, nil, lo.ToPtr("COMPLETED"))
	jobsRes.Path("$.data.jobs").Array().Length().Ge(1)
}

// TestGQLImportItemsAsyncCancelJob tests cancelling a job
func TestGQLImportItemsAsyncCancelJob(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create a large import that will take time
	var items []string
	for i := 0; i < 50000; i++ {
		items = append(items, `{"name": "test"}`)
	}
	fileContent := "[" + strings.Join(items, ",") + "]"

	// Start async import
	res := importItemsAsync(e, mId, "large.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Try to cancel the job immediately
	cancelRes := cancelJob(e, jobID)

	// assert cancellation result
	assert.Equal(t, jobID, cancelRes.Path("$.data.cancelJob.id").String().Raw())
	assert.Equal(t, "CANCELLED", cancelRes.Path("$.data.cancelJob.status").String().Raw())
}

// TestGQLImportItemsAsyncProgress tests that progress is tracked correctly
func TestGQLImportItemsAsyncProgress(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create an import with enough items to see progress
	var items []string
	for i := 0; i < 100; i++ {
		items = append(items, `{"name": "test"}`)
	}
	fileContent := "[" + strings.Join(items, ",") + "]"

	// Start async import
	res := importItemsAsync(e, mId, "progress.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Wait for completion
	finalRes := waitForJobCompletion(e, jobID, 10*time.Second)

	// Verify final progress
	finalRes.Path("$.data.job.status").String().IsEqual(gqlmodel.JobStatusCompleted.String())
	finalRes.Path("$.data.job.progress.processed").Number().IsEqual(100)
	finalRes.Path("$.data.job.progress.total").Number().IsEqual(100)
	finalRes.Path("$.data.job.progress.percentage").Number().IsEqual(100)
}

// TestGQLImportItemsAsyncError tests that errors are captured in the job
func TestGQLImportItemsAsyncError(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create invalid JSON that will fail during parsing
	fileContent := `[{"name": "valid"}, {invalid json}]`

	// Start async import - this should fail
	res := importItemsAsync(e, mId, "invalid.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Wait for a job to fail
	finalRes := waitForJobCompletion(e, jobID, 10*time.Second)

	finalRes.Path("$.data.job.status").String().IsEqual(gqlmodel.JobStatusFailed.String())
	finalRes.Path("$.data.job.error").String().NotEmpty()
}

// TestGQLJobStateSubscription tests the GraphQL subscription for job state
func TestGQLJobStateSubscription(t *testing.T) {
	e, serverURL := StartServerAndGetURL(t, &app.Config{}, true, baseSeederUser)

	// Convert HTTP URL to WebSocket URL
	wsURL := strings.Replace(serverURL, "http://", "ws://", 1) + "/api/graphql"

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create a larger import to give us time to receive state updates
	var items []string
	for i := 0; i < 5000; i++ {
		items = append(items, `{"name": "test"}`)
	}
	fileContent := "[" + strings.Join(items, ",") + "]"

	// Start async import first to get job ID
	res := importItemsAsync(e, mId, "subscription.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	totalUpdates := 0
	subscribeJob(t, wsURL, jobID, 30*time.Second, func(payload *httpexpect.Value, idx int) {
		totalUpdates++
		if idx == 0 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(0)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(0)
		}
		if idx == 1 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(5000)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(1000)
		}
		if idx == 2 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(5000)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(2000)
		}
		if idx == 3 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(5000)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(3000)
		}
		if idx == 4 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(5000)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(4000)
		}
		if idx == 5 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("IN_PROGRESS")
			payload.Path("$.data.jobState.progress.total").Number().IsEqual(5000)
			payload.Path("$.data.jobState.progress.processed").Number().IsEqual(5000)
		}
		if idx == 6 {
			payload.Path("$.data.jobState").NotNull()
			payload.Path("$.data.jobState.status").String().IsEqual("COMPLETED")
			payload.Path("$.data.jobState.progress").IsNull()
		}
	})
	assert.Equal(t, 7, totalUpdates)
}

// TestGQLJobStateSubscriptionAfterComplete tests that subscribing to a completed job
// returns the latest state from the job object when no publisher is active
func TestGQLJobStateSubscriptionAfterComplete(t *testing.T) {
	e, serverURL := StartServerAndGetURL(t, &app.Config{}, true, baseSeederUser)

	// Convert HTTP URL to WebSocket URL
	wsURL := strings.Replace(serverURL, "http://", "ws://", 1) + "/api/graphql"

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create a small import that will complete quickly
	fileContent := `[{"name": "Item 1"}, {"name": "Item 2"}]`

	// Start async import and wait for completion
	res := importItemsAsync(e, mId, "test.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Wait for job to complete
	waitForJobCompletion(e, jobID, 10*time.Second)

	// Verify job is completed via query
	jobRes := queryJob(e, jobID)
	jobRes.Path("$.data.job.status").String().IsEqual("COMPLETED")

	// Now subscribe to the completed job - should receive the latest state immediately
	// since no publisher is active (cache was cleared after job completed)
	totalUpdates := 0
	subscribeJob(t, wsURL, jobID, 5*time.Second, func(payload *httpexpect.Value, idx int) {
		totalUpdates++
		// Should receive the current job state from the database
		payload.Path("$.data.jobState").NotNull()
		payload.Path("$.data.jobState.status").String().IsEqual("COMPLETED")
		payload.Path("$.data.jobState.progress").IsNull()
		payload.Path("$.data.jobState.error").IsNull()
	})

	// Should receive exactly one update with the current state
	assert.Equal(t, 1, totalUpdates)
}
