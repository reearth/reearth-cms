package main

import (
	"context"
	"fmt"

	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ItemDocument struct {
	ID     string `bson:"_id,omitempty"`
	Fields []ItemFieldDocument
	Assets []string `bson:"assets,omitempty"`
}

func (d ItemDocument) GetID() primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(d.ID)
	if err != nil {
		fmt.Printf("failed to parse id: %v\n", d.ID)
		return primitive.NilObjectID
	}
	return id
}

type ItemFieldDocument struct {
	F         string        `bson:"f,omitempty"`
	V         ValueDocument `bson:"v,omitempty"`
	Field     string        `bson:"schemafield,omitempty"` // compat
	ValueType string        `bson:"valuetype,omitempty"`   // compat
	Value     any           `bson:"value,omitempty"`       // compat
}

type ValueDocument struct {
	T string `bson:"t"`
	V any    `bson:"v"`
}

func ItemMigration(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	col := client.Database(dbName).Collection("item")

	filter := bson.M{}

	if testID != "" {
		filter = bson.M{
			"$and": []bson.M{
				{"id": testID},
				filter,
			},
		}
		count, err := col.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("test mode: filter on item id '%s' is applyed, %d items selected.\n", testID, count)
	}

	if !wetRun {
		fmt.Printf("dry run\n")
		count, err := col.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("%d docs will be updated\n", count)
		return nil
	}

	_, err = BatchUpdate(ctx, col, filter, 1000, updateItem)
	if err != nil {
		return fmt.Errorf("failed to apply batches: %w", err)
	}

	fmt.Printf("done.\n")
	return nil
}

func updateItem(item ItemDocument) (ItemDocument, error) {
	updatedItem := ItemDocument{}
	var assets []string
	for _, f := range item.Fields {
		if f.Field != "" {
			f.F = f.Field
		}
		if f.ValueType != "" {
			f.V.T = f.ValueType
		}
		if f.Value != nil {
			f.V.V = f.Value
		}

		// value should be an array, the value is always treated as multiple in db
		if f.V.V != nil {
			_, ok := f.V.V.(bson.A)
			if !ok {
				f.V.V = bson.A{f.V.V}
			}
		}

		// migrate old value: date to datetime
		if f.V.T == "date" {
			f.V.T = "datetime"
		}
		updatedItem.Fields = append(updatedItem.Fields, ItemFieldDocument{
			F: f.F,
			V: ValueDocument{
				T: f.V.T,
				V: f.V.V,
			},
		})
		if f.V.T == "asset" && f.V.V != nil {
			pa, ok := f.V.V.(bson.A)
			if ok {
				aa := lo.FilterMap(pa, func(v any, _ int) (string, bool) {
					s, ok := v.(string)
					if !ok {
						fmt.Printf("failed to parse asset: asset=%v item=%v\n", v, item.ID)
					}
					return s, ok && s != ""
				})
				assets = append(assets, aa...)
				continue
			}
			fmt.Printf("failed to parse assets: assets=%v item=%v\n", f.V.V, item.ID)
		}
	}
	if len(assets) > 0 {
		updatedItem.Assets = lo.Uniq(assets)
	}

	return updatedItem, nil
}
