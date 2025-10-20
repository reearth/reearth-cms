package main

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Test_updateProjectMetadata(t *testing.T) {
	// Create a fixed timestamp for testing
	fixedTime := time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)
	objID := primitive.NewObjectIDFromTimestamp(fixedTime)

	tests := []struct {
		name       string
		project    ProjectMetadataDocument
		wantFields map[string]interface{}
	}{
		{
			name: "basic project",
			project: ProjectMetadataDocument{
				ID:          objID.Hex(),
				Name:        "Test Project",
				Description: "Test Description",
				Workspace:   "workspace1",
			},
			wantFields: map[string]interface{}{
				"Topics":    []string{},
				"StarCount": 0,
				"StarredBy": []string{},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updateOp, err := updateProjectMetadata()(tt.project)

			assert.NoError(t, err)
			assert.NotNil(t, updateOp)
			
			// Check that we have a $set operation
			setOp, exists := updateOp["$set"]
			assert.True(t, exists, "Should have $set operation")
			
			setMap := setOp.(bson.M)
			
			// Check the new fields in the $set operation
			assert.Equal(t, tt.wantFields["Topics"], setMap["topics"])
			assert.Equal(t, tt.wantFields["StarCount"], setMap["star_count"])
			assert.Equal(t, tt.wantFields["StarredBy"], setMap["starred_by"])

			// Should not have $unset operation
			_, hasUnset := updateOp["$unset"]
			assert.False(t, hasUnset, "Should not have $unset operation")
		})
	}
}


