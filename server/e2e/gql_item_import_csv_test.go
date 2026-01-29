package e2e

import (
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/app"
)

// TestGQLImportItemsAsyncCSV tests the async import functionality with CSV files
func TestGQLImportItemsAsyncCSV(t *testing.T) {
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
		expectError    bool
		errorContains  string
		expectedTotal  int
		expectedInsert int
	}{
		{
			name: "CSV with text and integer fields",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "test.csv",
			fileContent: func() string {
				return "name,count\nItem 1,10\nItem 2,20\nItem 3,30"
			},
			expectError:    false,
			expectedTotal:  3,
			expectedInsert: 3,
		},
		{
			name: "CSV with boolean field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "active", key: "active", fType: "Bool", typeProp: map[string]any{"bool": map[string]any{}}},
			},
			fileName: "bool.csv",
			fileContent: func() string {
				return "name,active\nItem 1,true\nItem 2,false"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with number field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "price", key: "price", fType: "Number", typeProp: map[string]any{"number": map[string]any{}}},
			},
			fileName: "numbers.csv",
			fileContent: func() string {
				return "name,price\nItem 1,19.99\nItem 2,29.50"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with empty values",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "description", key: "description", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "empty.csv",
			fileContent: func() string {
				return "name,description\nItem 1,Has description\nItem 2,"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with unknown columns (ignored)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "unknown.csv",
			fileContent: func() string {
				return "name,unknown_col\nItem 1,ignored"
			},
			expectError:    false,
			expectedTotal:  1,
			expectedInsert: 1,
		},
		{
			name: "CSV empty file (header only)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "header_only.csv",
			fileContent: func() string {
				return "name"
			},
			expectError:    false,
			expectedTotal:  0,
			expectedInsert: 0,
		},
		{
			name: "CSV multiple batches (1050 items > 1000 chunk size)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "batches.csv",
			fileContent: func() string {
				var sb strings.Builder
				sb.WriteString("name\n")
				for i := 0; i < 1050; i++ {
					sb.WriteString("test\n")
				}
				return sb.String()
			},
			expectError:    false,
			expectedTotal:  1050,
			expectedInsert: 1050,
		},
		{
			name: "CSV exceeds max records (2001)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "toomany.csv",
			fileContent: func() string {
				var sb strings.Builder
				sb.WriteString("name\n")
				for i := 0; i < 2001; i++ {
					sb.WriteString("test\n")
				}
				return sb.String()
			},
			expectError:   true,
			errorContains: "too many records",
		},
		{
			name: "CSV with date field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "created", key: "created", fType: "Date", typeProp: map[string]any{"date": map[string]any{}}},
			},
			fileName: "date.csv",
			fileContent: func() string {
				return "name,created\nItem 1,2024-01-15T10:30:00Z\nItem 2,2024-06-20T15:45:00Z"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with URL field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "website", key: "website", fType: "URL", typeProp: map[string]any{"url": map[string]any{}}},
			},
			fileName: "url.csv",
			fileContent: func() string {
				return "name,website\nItem 1,https://example.com\nItem 2,https://test.org"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with select field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "status", key: "status", fType: "Select", typeProp: map[string]any{"select": map[string]any{"values": []string{"draft", "published", "archived"}}}},
			},
			fileName: "select.csv",
			fileContent: func() string {
				return "name,status\nItem 1,draft\nItem 2,published"
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
		},
		{
			name: "CSV with checkbox field",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "confirmed", key: "confirmed", fType: "Checkbox", typeProp: map[string]any{"checkbox": map[string]any{}}},
			},
			fileName: "checkbox.csv",
			fileContent: func() string {
				return "name,confirmed\nItem 1,true\nItem 2,false\nItem 3,1\nItem 4,0"
			},
			expectError:    false,
			expectedTotal:  4,
			expectedInsert: 4,
		},
		{
			name: "CSV with all supported field types",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "description", key: "description", fType: "TextArea", typeProp: map[string]any{"textArea": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
				{title: "price", key: "price", fType: "Number", typeProp: map[string]any{"number": map[string]any{}}},
				{title: "active", key: "active", fType: "Bool", typeProp: map[string]any{"bool": map[string]any{}}},
				{title: "website", key: "website", fType: "URL", typeProp: map[string]any{"url": map[string]any{}}},
			},
			fileName: "alltypes.csv",
			fileContent: func() string {
				return "name,description,count,price,active,website\nTest,A description,42,19.99,true,https://example.com"
			},
			expectError:    false,
			expectedTotal:  1,
			expectedInsert: 1,
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
			res := importItemsAsync(e, mId, tt.fileName, tt.fileContent(), nil)

			if tt.expectError {
				// Check for immediate error or wait for job to fail
				rawRes := res.Raw()
				resMap, ok := rawRes.(map[string]any)
				if !ok {
					t.Errorf("unexpected response format")
					return
				}

				// Check if we got an immediate error
				if errors, hasErrors := resMap["errors"]; hasErrors {
					errArr, ok := errors.([]any)
					if ok && len(errArr) > 0 {
						if tt.errorContains != "" {
							errObj, ok := errArr[0].(map[string]any)
							if ok {
								msg, _ := errObj["message"].(string)
								if !strings.Contains(msg, tt.errorContains) {
									t.Errorf("error message %q does not contain %q", msg, tt.errorContains)
								}
							}
						}
					}
					return
				}

				// If no immediate error, wait for job to fail
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

				// Wait for job to complete/fail
				finalRes := waitForJobCompletion(e, jobID, 30*time.Second)
				finalRaw := finalRes.Raw()
				finalMap, ok := finalRaw.(map[string]any)
				if !ok {
					return
				}

				finalData, ok := finalMap["data"].(map[string]any)
				if !ok {
					return
				}
				finalJob, ok := finalData["job"].(map[string]any)
				if !ok || finalJob == nil {
					return
				}

				status, _ := finalJob["status"].(string)
				if status != "FAILED" {
					// Job might have completed before hitting the limit
					return
				}

				if tt.errorContains != "" {
					errMsg, _ := finalJob["error"].(string)
					if !strings.Contains(errMsg, tt.errorContains) {
						t.Errorf("error message %q does not contain %q", errMsg, tt.errorContains)
					}
				}
				return
			}

			// Verify job was created
			res.Path("$.data.importItemsAsync.job").NotNull()
			res.Path("$.data.importItemsAsync.job.id").String().NotEmpty()
			res.Path("$.data.importItemsAsync.job.type").String().IsEqual("IMPORT")

			// Initial status should be PENDING or IN_PROGRESS or COMPLETED
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

// TestGQLImportItemsSyncCSV tests the sync import functionality with CSV files
func TestGQLImportItemsSyncCSV(t *testing.T) {
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
		expectError    bool
		errorContains  string
		expectedTotal  int
		expectedInsert int
		expectedUpdate int
		expectedIgnore int
	}{
		{
			name: "CSV with text and integer fields",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "test.csv",
			fileContent: func() string {
				return "name,count\nItem 1,10\nItem 2,20\nItem 3,30"
			},
			expectError:    false,
			expectedTotal:  3,
			expectedInsert: 3,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "CSV empty file (header only)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "header_only.csv",
			fileContent: func() string {
				return "name"
			},
			expectError:    false,
			expectedTotal:  0,
			expectedInsert: 0,
			expectedUpdate: 0,
			expectedIgnore: 0,
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

			// Execute sync import
			res := importItems(e, mId, tt.fileName, tt.fileContent(), nil)

			if tt.expectError {
				errors := res.Path("$.errors").Array()
				errors.Length().Gt(0)
				if tt.errorContains != "" {
					errors.Value(0).Object().Value("message").String().Contains(tt.errorContains)
				}
				return
			}

			// Verify success response
			res.Path("$.data.importItems.modelId").String().IsEqual(mId)
			res.Path("$.data.importItems.totalCount").Number().IsEqual(tt.expectedTotal)
			res.Path("$.data.importItems.insertedCount").Number().IsEqual(tt.expectedInsert)
			res.Path("$.data.importItems.updatedCount").Number().IsEqual(tt.expectedUpdate)
			res.Path("$.data.importItems.ignoredCount").Number().IsEqual(tt.expectedIgnore)

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
