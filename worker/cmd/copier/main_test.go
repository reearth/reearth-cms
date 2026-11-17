package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetDBName(t *testing.T) {
	tests := []struct {
		name, worker, shared, want string
	}{
		{"default", "", "", "reearth_cms"},
		{"shared only", "", "shared_db", "shared_db"},
		{"worker only", "worker_db", "", "worker_db"},
		{"worker wins over shared", "worker_db", "shared_db", "worker_db"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("REEARTH_CMS_WORKER_DB_CMS", tt.worker)
			t.Setenv("REEARTH_CMS_DB_CMS", tt.shared)
			assert.Equal(t, tt.want, getDBName())
		})
	}
}
