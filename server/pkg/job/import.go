package job

import (
	"encoding/json"
)

type ImportPayload struct {
	ModelID      string `json:"modelId"`
	AssetID      string `json:"assetId,omitempty"`
	Format       string `json:"format"`
	Strategy     string `json:"strategy"`
	GeoFieldKey  string `json:"geoFieldKey,omitempty"`
	MutateSchema bool   `json:"mutateSchema"`
}

func (p *ImportPayload) ToJSON() (json.RawMessage, error) {
	return json.Marshal(p)
}

func ImportPayloadFromJSON(data json.RawMessage) (*ImportPayload, error) {
	if len(data) == 0 {
		return nil, nil
	}
	var p ImportPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	return &p, nil
}

// ImportColumnResult reports whether a column of the imported file was mapped to a schema field.
type ImportColumnResult struct {
	Header         string  `json:"header"`
	Status         string  `json:"status"`
	SchemaFieldKey *string `json:"schemaFieldKey,omitempty"`
	Reason         *string `json:"reason,omitempty"`
}

type ImportResult struct {
	Total    int                  `json:"total"`
	Inserted int                  `json:"inserted"`
	Updated  int                  `json:"updated"`
	Ignored  int                  `json:"ignored"`
	Columns  []ImportColumnResult `json:"columns,omitempty"`
}

func (r *ImportResult) ToJSON() (json.RawMessage, error) {
	return json.Marshal(r)
}

func ImportResultFromJSON(data json.RawMessage) (*ImportResult, error) {
	if len(data) == 0 {
		return nil, nil
	}
	var r ImportResult
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, err
	}
	return &r, nil
}

func (j *Job) ImportPayload() (*ImportPayload, error) {
	if j.jobType != TypeImport {
		return nil, nil
	}
	return ImportPayloadFromJSON(j.payload)
}

func (j *Job) ImportResult() (*ImportResult, error) {
	if j.jobType != TypeImport {
		return nil, nil
	}
	return ImportResultFromJSON(j.result)
}
