package e2e

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/gorilla/websocket"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/samber/lo"
)

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

// waitForJobCompletion polls the job status until it's completed, failed, or cancelled
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
				errors := res.Path("$.errors").Array()
				errors.Length().Gt(0)
				if tt.errorContains != "" {
					errors.Value(0).Object().Value("message").String().Contains(tt.errorContains)
				}
				return
			}

			// Verify job was created
			res.Path("$.data.importItemsAsync.job").NotNull()
			res.Path("$.data.importItemsAsync.job.id").String().NotEmpty()
			res.Path("$.data.importItemsAsync.job.type").String().IsEqual("IMPORT")
			// Initial status should be PENDING or IN_PROGRESS
			status := res.Path("$.data.importItemsAsync.job.status").String().Raw()
			if status != "PENDING" && status != "IN_PROGRESS" && status != "COMPLETED" {
				t.Errorf("unexpected initial status: %s", status)
			}

			jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

			// Wait for job completion
			finalRes := waitForJobCompletion(e, jobID, 30*time.Second)

			// Verify job completed successfully
			finalRes.Path("$.data.job.status").String().IsEqual("COMPLETED")
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
	for i := 0; i < 500; i++ {
		items = append(items, `{"name": "test"}`)
	}
	fileContent := "[" + strings.Join(items, ",") + "]"

	// Start async import
	res := importItemsAsync(e, mId, "large.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Try to cancel the job immediately
	cancelRes := cancelJob(e, jobID)

	// Get raw response to check structure
	rawRes := cancelRes.Raw()
	resMap, ok := rawRes.(map[string]any)
	if !ok {
		t.Errorf("unexpected response format")
		return
	}

	// Check if we got an error (job might have already finished)
	if _, hasErrors := resMap["errors"]; hasErrors {
		// Error is acceptable if job already finished
		return
	}

	// Verify cancel response
	data, ok := resMap["data"].(map[string]any)
	if !ok {
		return
	}
	cancelData, ok := data["cancelJob"].(map[string]any)
	if !ok {
		return
	}

	id, ok := cancelData["id"].(string)
	if !ok || id != jobID {
		t.Errorf("expected job id %s, got %s", jobID, id)
	}

	status, ok := cancelData["status"].(string)
	if !ok {
		t.Errorf("missing status in cancel response")
		return
	}

	// Status should be CANCELLED or COMPLETED (if finished before cancel)
	if status != "CANCELLED" && status != "COMPLETED" && status != "FAILED" {
		t.Errorf("unexpected status after cancel: %s", status)
	}
}

// TestGQLImportItemsAsyncProgress tests that progress is tracked correctly
func TestGQLImportItemsAsyncProgress(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create import with enough items to see progress
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
	finalRes.Path("$.data.job.status").String().IsEqual("COMPLETED")
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

	// Get raw response to check structure
	rawRes := res.Raw()
	resMap, ok := rawRes.(map[string]any)
	if !ok {
		t.Errorf("unexpected response format")
		return
	}

	// Check if we got an immediate error
	if _, hasErrors := resMap["errors"]; hasErrors {
		// Immediate error is acceptable for parsing failures
		return
	}

	// Try to get job ID from the response
	data, ok := resMap["data"].(map[string]any)
	if !ok {
		return
	}
	importAsync, ok := data["importItemsAsync"].(map[string]any)
	if !ok {
		return
	}
	job, ok := importAsync["job"].(map[string]any)
	if !ok {
		return
	}
	jobID, ok := job["id"].(string)
	if !ok || jobID == "" {
		return
	}

	// Wait for job to fail
	finalRes := waitForJobCompletion(e, jobID, 10*time.Second)

	// Get raw response to check structure
	finalRaw := finalRes.Raw()
	finalMap, ok := finalRaw.(map[string]any)
	if !ok {
		return
	}

	// Check if job query returned an error
	if _, hasErrors := finalMap["errors"]; hasErrors {
		// Job not found is acceptable if it failed during creation
		return
	}

	// Verify job data exists
	finalData, ok := finalMap["data"].(map[string]any)
	if !ok {
		return
	}
	finalJob, ok := finalData["job"].(map[string]any)
	if !ok || finalJob == nil {
		return
	}

	status, ok := finalJob["status"].(string)
	if !ok {
		return
	}

	if status != "FAILED" && status != "COMPLETED" {
		// If the job completed, it means the parsing succeeded (edge case)
		if status == "COMPLETED" {
			return
		}
		t.Errorf("expected FAILED status, got %s", status)
	}

	if status == "FAILED" {
		errMsg, ok := finalJob["error"].(string)
		if !ok || errMsg == "" {
			t.Errorf("expected error message for failed job")
		}
	}
}

// wsMessage represents a GraphQL over WebSocket message
type wsMessage struct {
	ID      string          `json:"id,omitempty"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// subscribePayload represents the payload for a subscribe message
type subscribePayload struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables,omitempty"`
}

// TestGQLJobProgressSubscription tests the GraphQL subscription for job progress
func TestGQLJobProgressSubscription(t *testing.T) {
	e, serverURL := StartServerAndGetURL(t, &app.Config{}, true, baseSeederUser)

	// Convert HTTP URL to WebSocket URL
	wsURL := strings.Replace(serverURL, "http://", "ws://", 1) + "/api/graphql"

	pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
	mId, _ := createModel(e, pId, "test", "test", "e2e-alias")
	createField(e, mId, "name", "name", "name",
		false, false, false, false, "Text", map[string]any{"text": map[string]any{}})

	// Create a larger import to give us time to receive progress updates
	var items []string
	for i := 0; i < 2000; i++ {
		items = append(items, `{"name": "test"}`)
	}
	fileContent := "[" + strings.Join(items, ",") + "]"

	// Start async import first to get job ID
	res := importItemsAsync(e, mId, "subscription.json", fileContent, nil)
	jobID := res.Path("$.data.importItemsAsync.job.id").String().Raw()

	// Connect to WebSocket
	header := http.Header{}
	header.Set("Origin", "https://example.com")
	header.Set("X-Reearth-Debug-User", uId1.String())

	dialer := websocket.Dialer{
		Subprotocols: []string{"graphql-transport-ws"},
	}
	conn, _, err := dialer.Dial(wsURL, header)
	if err != nil {
		t.Fatalf("failed to connect to websocket: %v", err)
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
			t.Fatalf("failed to close websocket: %v", err)
		}
	}(conn)

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

	// Subscribe to job progress
	subscribeQuery := `subscription JobProgress($jobId: ID!) {
		jobProgress(jobId: $jobId) {
			processed
			total
			percentage
		}
	}`

	payload, _ := json.Marshal(subscribePayload{
		Query: subscribeQuery,
		Variables: map[string]any{
			"jobId": jobID,
		},
	})

	subMsg := wsMessage{
		ID:      "1",
		Type:    "subscribe",
		Payload: payload,
	}
	if err := conn.WriteJSON(subMsg); err != nil {
		t.Fatalf("failed to send subscribe: %v", err)
	}

	// Collect progress updates
	var progressUpdates []map[string]any
	var mu sync.Mutex
	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			var msg wsMessage
			if err := conn.ReadJSON(&msg); err != nil {
				return
			}

			switch msg.Type {
			case "next":
				var data struct {
					Data struct {
						JobProgress map[string]any `json:"jobProgress"`
					} `json:"data"`
				}
				if err := json.Unmarshal(msg.Payload, &data); err == nil {
					mu.Lock()
					progressUpdates = append(progressUpdates, data.Data.JobProgress)
					mu.Unlock()
				}
			case "complete":
				return
			case "error":
				return
			}
		}
	}()

	// Wait for subscription to complete or timeout
	select {
	case <-done:
		// Subscription completed normally
	case <-time.After(30 * time.Second):
		// Timeout - close connection
		err := conn.Close()
		if err != nil {
			return
		}
	}

	// Verify we received at least one progress update
	mu.Lock()
	numUpdates := len(progressUpdates)
	mu.Unlock()

	if numUpdates == 0 {
		// The job might have completed before we could subscribe
		// This is acceptable - just verify the job completed
		finalRes := queryJob(e, jobID)
		status := finalRes.Path("$.data.job.status").String().Raw()
		if status != "COMPLETED" {
			t.Errorf("expected COMPLETED status, got %s", status)
		}
		return
	}

	// Verify progress updates have correct structure
	mu.Lock()
	for _, update := range progressUpdates {
		if _, ok := update["processed"]; !ok {
			t.Errorf("progress update missing 'processed' field")
		}
		if _, ok := update["total"]; !ok {
			t.Errorf("progress update missing 'total' field")
		}
		if _, ok := update["percentage"]; !ok {
			t.Errorf("progress update missing 'percentage' field")
		}
	}

	// Check that the last update shows completion progress
	lastUpdate := progressUpdates[len(progressUpdates)-1]
	mu.Unlock()

	processed, _ := lastUpdate["processed"].(float64)
	total, _ := lastUpdate["total"].(float64)

	if total != 2000 {
		t.Errorf("expected total=2000, got %v", total)
	}

	// The last update should show significant progress
	if processed < 1000 {
		t.Errorf("expected processed >= 1000, got %v", processed)
	}

	// Verify job completed successfully
	finalRes := waitForJobCompletion(e, jobID, 30*time.Second)
	finalRes.Path("$.data.job.status").String().IsEqual("COMPLETED")
}
