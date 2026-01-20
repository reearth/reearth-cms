package job

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestImportPayload_ToJSON(t *testing.T) {
	payload := &ImportPayload{
		ModelID:      "model-123",
		AssetID:      "asset-456",
		Format:       "json",
		Strategy:     "insert",
		GeoFieldKey:  "geometry",
		MutateSchema: true,
	}

	data, err := payload.ToJSON()
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	// Verify round-trip
	restored, err := ImportPayloadFromJSON(data)
	assert.NoError(t, err)
	assert.Equal(t, payload, restored)
}

func TestImportPayloadFromJSON(t *testing.T) {
	tests := []struct {
		name    string
		input   json.RawMessage
		want    *ImportPayload
		wantErr bool
	}{
		{
			name:    "empty data returns nil",
			input:   json.RawMessage{},
			want:    nil,
			wantErr: false,
		},
		{
			name:    "nil data returns nil",
			input:   nil,
			want:    nil,
			wantErr: false,
		},
		{
			name:  "valid JSON",
			input: json.RawMessage(`{"modelId":"m1","format":"json","strategy":"insert"}`),
			want: &ImportPayload{
				ModelID:  "m1",
				Format:   "json",
				Strategy: "insert",
			},
			wantErr: false,
		},
		{
			name:  "full payload",
			input: json.RawMessage(`{"modelId":"m1","assetId":"a1","format":"geojson","strategy":"upsert","geoFieldKey":"geo","mutateSchema":true}`),
			want: &ImportPayload{
				ModelID:      "m1",
				AssetID:      "a1",
				Format:       "geojson",
				Strategy:     "upsert",
				GeoFieldKey:  "geo",
				MutateSchema: true,
			},
			wantErr: false,
		},
		{
			name:    "invalid JSON",
			input:   json.RawMessage(`{invalid}`),
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ImportPayloadFromJSON(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestImportResult_ToJSON(t *testing.T) {
	result := &ImportResult{
		Total:    100,
		Inserted: 50,
		Updated:  30,
		Ignored:  20,
	}

	data, err := result.ToJSON()
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	// Verify round-trip
	restored, err := ImportResultFromJSON(data)
	assert.NoError(t, err)
	assert.Equal(t, result, restored)
}

func TestImportResultFromJSON(t *testing.T) {
	tests := []struct {
		name    string
		input   json.RawMessage
		want    *ImportResult
		wantErr bool
	}{
		{
			name:    "empty data returns nil",
			input:   json.RawMessage{},
			want:    nil,
			wantErr: false,
		},
		{
			name:    "nil data returns nil",
			input:   nil,
			want:    nil,
			wantErr: false,
		},
		{
			name:  "valid JSON",
			input: json.RawMessage(`{"total":100,"inserted":50,"updated":30,"ignored":20}`),
			want: &ImportResult{
				Total:    100,
				Inserted: 50,
				Updated:  30,
				Ignored:  20,
			},
			wantErr: false,
		},
		{
			name:    "invalid JSON",
			input:   json.RawMessage(`{invalid}`),
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ImportResultFromJSON(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestJob_ImportPayload(t *testing.T) {
	payload := &ImportPayload{
		ModelID:  "m1",
		Format:   "json",
		Strategy: "insert",
	}
	payloadJSON, _ := payload.ToJSON()

	t.Run("returns payload for import job", func(t *testing.T) {
		t.Parallel()

		j := &Job{
			jobType: TypeImport,
			payload: payloadJSON,
		}

		got, err := j.ImportPayload()
		assert.NoError(t, err)
		assert.Equal(t, payload, got)
	})

	t.Run("returns nil for non-import job", func(t *testing.T) {
		t.Parallel()

		j := &Job{
			jobType: Type("export"),
			payload: payloadJSON,
		}

		got, err := j.ImportPayload()
		assert.NoError(t, err)
		assert.Nil(t, got)
	})
}

func TestJob_ImportResult(t *testing.T) {
	result := &ImportResult{
		Total:    100,
		Inserted: 50,
		Updated:  30,
		Ignored:  20,
	}
	resultJSON, _ := result.ToJSON()

	t.Run("returns result for import job", func(t *testing.T) {
		t.Parallel()

		j := &Job{
			jobType: TypeImport,
			result:  resultJSON,
		}

		got, err := j.ImportResult()
		assert.NoError(t, err)
		assert.Equal(t, result, got)
	})

	t.Run("returns nil for non-import job", func(t *testing.T) {
		t.Parallel()

		j := &Job{
			jobType: Type("export"),
			result:  resultJSON,
		}

		got, err := j.ImportResult()
		assert.NoError(t, err)
		assert.Nil(t, got)
	})
}
