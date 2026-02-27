package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
)

type Webhook struct {
	URL       string    `json:"url"`
	Secret    string    `json:"secret"`
	Timestamp time.Time `json:"timestamp"`
	WebhookID string    `json:"webhookId"`
	EventID   string    `json:"eventId"`
	EventType string    `json:"type"`
	EventData any       `json:"data"`
	Operator  any       `json:"operator"`
}

type requestBody struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Type      string    `json:"type"`
	Data      any       `json:"data"`
	Operator  any       `json:"operator"`
}

func Send(ctx context.Context, w *Webhook) error {
	b, err := w.requestBody()
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", w.URL, bytes.NewBuffer(b))
	if err != nil {
		return fmt.Errorf("failed to create a request: %w", err)
	}

	now := util.Now()
	signature := Sign(b, []byte(w.Secret), now, "v1")

	req.Header.Set("Reearth-Signature", signature)
	req.Header.Set("Content-Type", "application/json")

	// Debug logging for 400 investigation
	correlationID := fmt.Sprintf("%s_%d", w.EventID, now.Unix())
	log.Infof("webhook debug [%s]: sending request to %s", correlationID, w.URL)
	log.Infof("webhook debug: headers: %v", req.Header)
	// Log body preview (truncated to avoid sensitive data exposure)
	log.Infof("webhook debug: body_preview: %s", truncateString(string(b), 200))
	log.Infof("webhook debug: signature: %s", signature)

	client := &http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send a request: %w", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}(res.Body)

	// Read response body for debugging
	responseBody, err := io.ReadAll(res.Body)
	if err != nil {
		log.Errorf("webhook debug: failed to read response body: %v", err)
		responseBody = []byte("ERROR_READING_RESPONSE_BODY")
	}

	// Log response details
	log.Infof("webhook debug: response status=%d", res.StatusCode)
	log.Infof("webhook debug: response headers: %v", res.Header)
	log.Infof("webhook debug: response body: %s", truncateString(string(responseBody), 500))

	if res.StatusCode > 300 {
		// Detailed error analysis for 400s
		if res.StatusCode == 400 {
			log.Errorf("webhook 400 analysis [%s]: url=%s, signature=%s, body_length=%d", correlationID, w.URL, signature, len(b))
			log.Errorf("webhook 400 analysis: response_body=%s", truncateString(string(responseBody), 500))

			// Check common 400 causes
			responseStr := string(responseBody)
			if len(responseStr) > 0 && responseStr != "ERROR_READING_RESPONSE_BODY" {
				log.Errorf("webhook 400 cause: %s", truncateString(responseStr, 300))
			} else if responseStr == "ERROR_READING_RESPONSE_BODY" {
				log.Errorf("webhook 400 cause: Unable to read response body - connection issue or malformed response")
			} else {
				log.Errorf("webhook 400 cause: Empty response body from external API")
			}
		}
		return fmt.Errorf("ERROR: id=%s, url=%s, status=%d", w.EventID, w.URL, res.StatusCode)
	}

	return nil
}

func (w Webhook) requestBody() ([]byte, error) {
	b := requestBody{
		ID:        w.EventID,
		Timestamp: w.Timestamp,
		Type:      w.EventType,
		Data:      w.EventData,
		Operator:  w.Operator,
	}
	return json.Marshal(b)
}

func Sign(payload, secret []byte, t time.Time, v string) string {
	mac := hmac.New(sha256.New, secret)
	signaturePayload := fmt.Sprintf("%s:%d:", v, t.Unix())
	_, _ = mac.Write([]byte(signaturePayload))
	_, _ = mac.Write(payload)
	s := hex.EncodeToString(mac.Sum(nil))
	signature := fmt.Sprintf("%s,t=%d,%s", v, t.Unix(), s)

	// Debug signature generation (without exposing secret)
	log.Infof("webhook signature debug: version=%s, timestamp=%d, secret_length=%d", v, t.Unix(), len(secret))
	log.Infof("webhook signature debug: signature_payload=%s", signaturePayload)
	// Don't log the full body as it may contain sensitive data
	log.Infof("webhook signature debug: body_length=%d, body_preview=%s", len(payload), truncateString(string(payload), 100))
	log.Infof("webhook signature debug: final_signature=%s", signature)

	return signature
}

// truncateString safely truncates strings for logging without exposing sensitive data
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "...[truncated]"
}
