package webhook

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestWebhook_requestBody(t *testing.T) {
	time := time.Date(2022, 10, 10, 1, 1, 1, 1, time.UTC)

	rawExpected := requestBody{
		ID:        "event",
		Timestamp: time,
		Type:      "asset.create",
		Data: `{
			"id": "aaa",
			"name": "name"
		}`,
	}
	expected, err := json.Marshal(rawExpected)
	assert.NoError(t, err)

	w := &Webhook{
		URL:       "https://example.com",
		Secret:    "secret",
		Timestamp: time,
		EventID:   "event",
		EventType: "asset.create",
		EventData: `{
			"id": "aaa",
			"name": "name"
		}`,
	}

	res, err := w.requestBody()
	assert.NoError(t, err)

	fmt.Print(string(res))
	assert.Equal(t, expected, res)

}

func TestSign(t *testing.T) {
	time := time.Date(2022, 10, 10, 1, 1, 1, 1, time.UTC)
	assert.Equal(t, "v1,t=1665363661,df7340aca1823ae160b7f72e3851b4d6da7c026588b467a6c59fd0f7350c1e7f", Sign([]byte("a"), []byte("b"), time, "v1"))
}
