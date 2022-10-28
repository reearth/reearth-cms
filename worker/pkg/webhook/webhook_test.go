package webhook

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSign(t *testing.T) {
	now := time.Date(2022, 10, 10, 1, 1, 1, 1, time.UTC)
	assert.Equal(t, "v1,t=1665363661,df7340aca1823ae160b7f72e3851b4d6da7c026588b467a6c59fd0f7350c1e7f", Sign([]byte("a"), []byte("b"), now, "v1"))
}
