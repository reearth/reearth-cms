package main

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProjectMetadataDocument struct {
	ID            string                        `bson:"_id,omitempty"`
	Name          string                        `bson:"name,omitempty"`
	Description   string                        `bson:"description,omitempty"`
	License       string                        `bson:"license,omitempty"`
	Readme        string                        `bson:"readme,omitempty"`
	Alias         string                        `bson:"alias,omitempty"`
	ImageURL      string                        `bson:"imageurl,omitempty"`
	Workspace     string                        `bson:"workspace,omitempty"`
	Accessibility *ProjectAccessibilityDocument `bson:"accessibility,omitempty"`
	RequestRoles  []string                      `bson:"requestroles,omitempty"`
	Topics        []string                      `bson:"topics,omitempty"`
	StarCount     int                           `bson:"star_count,omitempty"`
	StarredBy     []string                      `bson:"starred_by,omitempty"`
}

func (d ProjectMetadataDocument) GetID() primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(d.ID)
	if err != nil {
		fmt.Printf("failed to parse project id: %v\n", d.ID)
		return primitive.NilObjectID
	}
	return id
}

func AddProjectMetadataFields(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		err := client.Disconnect(ctx)
		if err != nil {
			fmt.Printf("failed to disconnect from db: %v\n", err)
		}
	}()

	pCol := client.Database(dbName).Collection("project")

	filter := bson.M{}

	if testID != "" {
		filter = bson.M{
			"$and": []bson.M{
				{"_id": testID},
				filter,
			},
		}
		count, err := pCol.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("test mode: filter on document id '%s' is applied, %d document selected.\n", testID, count)
	}

	if !wetRun {
		fmt.Printf("dry run\n")
		count, err := pCol.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("%d docs will be updated\n", count)
		return nil
	}

	_, err = BatchUpdateWithCustomOperation(ctx, pCol, filter, 1000, updateProjectMetadata())
	if err != nil {
		return fmt.Errorf("failed to apply batches: %w", err)
	}

	fmt.Printf("done.\n")
	return nil
}

func updateProjectMetadata() func(ProjectMetadataDocument) (bson.M, error) {
	return func(oldP ProjectMetadataDocument) (bson.M, error) {
		
		updateOp := bson.M{
			"$set": bson.M{
				"topics":     []string{},
				"star_count": 0,
				"starred_by": []string{},
			},
		}

		return updateOp, nil
	}
}

// BatchUpdateWithCustomOperation processes documents and applies custom update operations
func BatchUpdateWithCustomOperation(ctx context.Context, col *mongo.Collection, filter bson.M, batchSize int, fn func(ProjectMetadataDocument) (bson.M, error)) (int, error) {
	opts := options.Find().
		SetBatchSize(int32(batchSize)).
		SetNoCursorTimeout(true)

	cursor, err := col.Find(ctx, filter, opts)
	if err != nil {
		return 0, fmt.Errorf("failed to query collection: %w", err)
	}
	defer func() {
		err := cursor.Close(ctx)
		if err != nil {
			fmt.Printf("failed to close cursor: %v\n", err)
		}
	}()

	batch := make([]mongo.WriteModel, 0, batchSize)
	processed := 0

	for cursor.Next(ctx) {
		if ctx.Err() != nil {
			return 0, ctx.Err()
		}

		var item ProjectMetadataDocument
		if err := cursor.Decode(&item); err != nil {
			return 0, fmt.Errorf("failed to decode document: %w", err)
		}

		updateOp, err := fn(item)
		if err != nil {
			return 0, fmt.Errorf("failed to process document: %w", err)
		}

		update := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": item.GetID()}).
			SetUpdate(updateOp)

		batch = append(batch, update)
		processed++

		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return 0, err
			}

			fmt.Printf("Processed %d documents\n", processed)
			batch = batch[:0]
		}
	}

	if len(batch) > 0 {
		if err := executeBatch(ctx, col, batch); err != nil {
			return 0, err
		}
	}

	if err := cursor.Err(); err != nil {
		return 0, fmt.Errorf("cursor error: %w", err)
	}

	fmt.Printf("Completed processing %d documents\n", processed)
	return processed, nil
}