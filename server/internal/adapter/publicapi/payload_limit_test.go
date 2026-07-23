package publicapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func textField(key string) *schema.Field {
	return schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey(key)).MustBuild()
}

func urlField(key string) *schema.Field {
	return schema.NewField(schema.NewURL().TypeProperty()).NewID().Key(id.NewKey(key)).MustBuild()
}

// fieldDetail mirrors a single entry of the validation_error "details" array.
type fieldDetail struct {
	Field string `json:"field"`
	Code  string `json:"code"`
}

func TestHandler_PostItem_PayloadLimit(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	// bodyOfSize returns a JSON posting request whose serialized length is
	// exactly size bytes, padded via a field not present in the schema.
	bodyOfSize := func(size int) []byte {
		base, err := json.Marshal(postItemRequest{Fields: map[string]any{"pad": ""}})
		require.NoError(t, err)
		pad := size - len(base)
		if pad < 0 {
			pad = 0
		}
		b, err := json.Marshal(postItemRequest{Fields: map[string]any{"pad": strings.Repeat("a", pad)}})
		require.NoError(t, err)
		return b
	}
	jsonBody := func(fields map[string]any) []byte {
		b, err := json.Marshal(postItemRequest{Fields: fields})
		require.NoError(t, err)
		return b
	}

	tests := []struct {
		name        string
		fields      []*schema.Field
		origin      string
		body        []byte
		wantStatus  int
		wantCode    string       // expected error/code in the envelope; "" skips the envelope check (success)
		wantMessage string       // expected human message
		wantDetail  *fieldDetail // optional details[0] assertion
	}{
		{
			name:       "body exactly at limit passes",
			fields:     []*schema.Field{textField("title")},
			origin:     allowedOrigin,
			body:       bodyOfSize(maxPayloadBytes),
			wantStatus: http.StatusAccepted,
		},
		{
			name:        "body exceeding limit rejected with 413 before parsing",
			fields:      []*schema.Field{textField("title")},
			origin:      allowedOrigin,
			body:        bodyOfSize(maxPayloadBytes + 1),
			wantStatus:  http.StatusRequestEntityTooLarge,
			wantCode:    codePayloadTooLarge,
			wantMessage: msgPayloadTooLarge,
		},
		{
			name:        "CORS rejection happens before size check",
			fields:      []*schema.Field{textField("title")},
			origin:      "https://evil.com", // not in allowed origins → 403, not 413
			body:        bodyOfSize(maxPayloadBytes + 1),
			wantStatus:  http.StatusForbidden,
			wantCode:    codeOriginNotAllowed,
			wantMessage: msgOriginNotAllowed,
		},
		{
			name:        "field limit violation returns 400 validation shape",
			fields:      []*schema.Field{urlField("link")},
			origin:      allowedOrigin,
			body:        jsonBody(map[string]any{"link": "https://e.com/" + strings.Repeat("a", 2049)}),
			wantStatus:  http.StatusBadRequest,
			wantCode:    codeValidationError,
			wantMessage: msgValidationError,
			wantDetail:  &fieldDetail{Field: "link", Code: string(schema.FieldValidationCodeMaxLengthExceeded)},
		},
		{
			name:       "legitimate submission within limits reaches stub",
			fields:     []*schema.Field{textField("title")},
			origin:     allowedOrigin,
			body:       jsonBody(map[string]any{"title": "hello"}),
			wantStatus: http.StatusAccepted,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			rec := doPost(t, tt.fields, []string{allowedOrigin}, tt.origin, tt.body)
			assert.Equal(t, tt.wantStatus, rec.Code)

			if tt.wantCode == "" {
				return // success case — no error envelope to assert
			}

			var resp struct {
				Error   string        `json:"error"`
				Code    string        `json:"code"`
				Message string        `json:"message"`
				Details []fieldDetail `json:"details"`
			}
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
			assert.Equal(t, tt.wantCode, resp.Error)
			assert.Equal(t, tt.wantCode, resp.Code)
			assert.Equal(t, tt.wantMessage, resp.Message)
			if tt.wantDetail != nil {
				require.Len(t, resp.Details, 1)
				assert.Equal(t, *tt.wantDetail, resp.Details[0])
			}
		})
	}
}

// doPost runs the PostItem handler against an in-memory controller.
func doPost(t *testing.T, fields []*schema.Field, allowedOrigins []string, origin string, body []byte) *httptest.ResponseRecorder {
	t.Helper()
	ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, nil, allowedOrigins, nil, fields...)

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	if origin != "" {
		req.Header.Set("Origin", origin)
	}
	rec := httptest.NewRecorder()

	req = req.WithContext(AttachController(baseCtx, ctrl))
	c := e.NewContext(req, rec)
	c.SetPathValues(echo.PathValues{
		{Name: "workspace", Value: wAlias},
		{Name: "project", Value: pAlias},
		{Name: "model", Value: mKey},
	})

	require.NoError(t, PostItem()(c))
	return rec
}
