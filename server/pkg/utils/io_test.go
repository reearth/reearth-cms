package utils

import (
	"io"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewReplyReader(t *testing.T) {
	input := "hello world stream test"
	r := strings.NewReader(input)

	replay := NewReplyReader(r)

	// Step 1: Read part of the stream from Partial
	buf := make([]byte, 11)
	n, err := replay.Partial.Read(buf)
	assert.NoError(t, err)
	assert.Equal(t, 11, n)
	assert.Equal(t, "hello world", string(buf[:n]))

	// Step 2: Read from Full
	allData, err := io.ReadAll(replay.Full)
	assert.NoError(t, err)
	assert.Equal(t, len(input), len(allData))
	assert.Equal(t, input, string(allData))
}
