package main

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OldModelDocument struct {
	ID      string
	Public  bool
	Project string
}

type ProjectDocument struct {
	ID            string                        `bson:"_id,omitempty"`
	Publication   *ProjectPublicationDocument   `bson:"publication,omitempty"`   // Old structure to be removed
	Accessibility *ProjectAccessibilityDocument `bson:"accessibility,omitempty"` // New structure to be used
}

func (d ProjectDocument) GetID() primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(d.ID)
	if err != nil {
		fmt.Printf("failed to parse id: %v\n", d.ID)
		return primitive.NilObjectID
	}
	return id
}

type ProjectPublicationDocument struct {
	AssetPublic bool
	Scope       string
	Token       *string
}

type ProjectAccessibilityDocument struct {
	Visibility  string
	Publication *PublicationSettingsDocument
	Keys        []APIKeyDocument
}

type PublicationSettingsDocument struct {
	PublicModels []string
	PublicAssets bool
}

type APIKeyDocument struct {
	ID          string
	Name        string
	Description string
	Key         string
	Publication *PublicationSettingsDocument
}

func ProjectVisibility(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	pCol := client.Database(dbName).Collection("project")
	mCol := client.Database(dbName).Collection("model")

	models, err := _pv_loadModels(ctx, mCol)
	if err != nil {
		return err
	}
	if len(models) == 0 {
		return fmt.Errorf("no models found")
	}

	filter := bson.M{}

	if testID != "" {
		filter = bson.M{
			"$and": []bson.M{
				{"id": testID},
				filter,
			},
		}
		count, err := pCol.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("test mode: filter on document id '%s' is applyed, %d document selected.\n", testID, count)
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

	_, err = BatchUpdate(ctx, pCol, filter, 1000, updateProject(models))
	if err != nil {
		return fmt.Errorf("failed to apply batches: %w", err)
	}

	fmt.Printf("done.\n")
	return nil
}

func _pv_loadModels(ctx context.Context, col *mongo.Collection) (map[string][]OldModelDocument, error) {
	cur, err := col.Find(
		ctx,
		bson.M{}, // No filter, we want all models
		options.Find().SetProjection(bson.M{"id": 1, "public": 1, "project": 1}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find models docs: %w", err)
	}

	var models []OldModelDocument
	err = cur.All(ctx, &models)
	if err != nil {
		return nil, fmt.Errorf("failed to decode models docs: %w", err)
	}
	return lo.GroupBy(models, func(m OldModelDocument) string {
		return m.Project

	}), nil
}

const charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

func updateProject(models map[string][]OldModelDocument) func(ProjectDocument) (ProjectDocument, error) {
	return func(oldP ProjectDocument) (ProjectDocument, error) {
		p := ProjectDocument{
			Accessibility: &ProjectAccessibilityDocument{},
		}
		if oldP.Publication == nil || oldP.Publication.Scope == "" || oldP.Publication.Scope == "public" {
			p.Accessibility.Visibility = "public"
			p.Accessibility.Publication = nil
			p.Accessibility.Keys = nil
			return p, nil
		}
		if oldP.Publication.Scope == "private" {
			p.Accessibility.Visibility = "private"
			p.Accessibility.Publication = &PublicationSettingsDocument{
				PublicModels: []string{},
				PublicAssets: false,
			}
			return p, nil
		}

		// Publication.Scope == "LIMITED"
		p.Accessibility.Visibility = "private"
		p.Accessibility.Publication = &PublicationSettingsDocument{
			PublicModels: []string{},
			PublicAssets: false,
		}

		modelsForProject, ok := models[oldP.ID]
		if !ok {
			modelsForProject = []OldModelDocument{}
		}

		key := APIKeyDocument{
			ID:          idx.New[id.Project]().String(),
			Name:        "limited migration key",
			Description: "Key for limited publication migration",
			Key:         lo.FromPtrOr(oldP.Publication.Token, "secret_"+lo.RandomString(43, []rune(charSet))),
			Publication: &PublicationSettingsDocument{
				PublicModels: lo.FilterMap(modelsForProject, func(m OldModelDocument, _ int) (string, bool) { return m.ID, m.Public }),
				PublicAssets: oldP.Publication.AssetPublic,
			},
		}

		p.Accessibility.Keys = []APIKeyDocument{key}

		return p, nil
	}
}
