package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_summarizeOrphaned(t *testing.T) {
	projects := map[string]string{"p1": "w1", "p2": "w1"}
	groups := []projectGroup{
		{Project: "p1", Count: 10, Size: 100},
		{Project: "p2", Count: 5},
		{Project: "deleted1", Count: 3, Size: 30},
		{Project: "deleted2", Count: 2, Size: 20},
		{Project: "", Count: 7},
	}

	got := summarizeOrphaned("asset", groups, projects)

	assert.Equal(t, orphanedSummary{Collection: "asset", Docs: 5, Projects: 2, Size: 50}, got)
}

func Test_formatBytes(t *testing.T) {
	assert.Equal(t, "512 B", formatBytes(512))
	assert.Equal(t, "1.5 KiB", formatBytes(1536))
	assert.Equal(t, "2.0 GiB", formatBytes(2*1024*1024*1024))
}
