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

			// Check that created_at is set
			assert.NotNil(t, setMap["created_at"])

			// Check that created_at matches ObjectID timestamp
			createdAt := setMap["created_at"].(time.Time)
			assert.Equal(t, fixedTime, createdAt)

			// Should not have $unset operation
			_, hasUnset := updateOp["$unset"]
			assert.False(t, hasUnset, "Should not have $unset operation")
		})
	}
}

func Test_updateProjectMetadata_with_existing_created_at(t *testing.T) {
	existingCreatedAt := time.Date(2022, 6, 15, 10, 30, 0, 0, time.UTC)
	objID := primitive.NewObjectID()

	project := ProjectMetadataDocument{
		ID:        objID.Hex(),
		Name:      "Test Project",
		Workspace: "workspace1",
	}

	updateOp, err := updateProjectMetadata()(project)

	assert.NoError(t, err)
	
	setOp := updateOp["$set"].(bson.M)
	createdAt := setOp["created_at"].(time.Time)
	assert.Equal(t, existingCreatedAt, createdAt, "Should preserve existing created_at")
}

