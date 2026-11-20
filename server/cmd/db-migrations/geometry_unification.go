package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"sort"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// The value types of the Geometry Object and Geometry Editor fields, which are migrated to the Geometry field.
const (
	geometryObjectType = "geometryObject"
	geometryEditorType = "geometryEditor"
)

var geometryTypes = []string{geometryObjectType, geometryEditorType, string(value.TypeGeometry)}

// GeometryUnification converts Geometry Object and Geometry Editor fields and their values into Geometry fields.
// Values stored as GeoJSON strings become GeoJSON objects, and every Geometry value is saved with sorted keys,
// so that equal geometries are stored identically and the uniqueness query matches them.
// Values that do not pass the Geometry validation and duplicates in unique fields are converted and reported.
func GeometryUnification(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	db := client.Database(dbName)
	if !wetRun {
		fmt.Println("dry run: nothing is written")
	}

	fields, err := migrateGeometrySchemas(ctx, db.Collection("schema"), wetRun)
	if err != nil {
		return fmt.Errorf("schema migration failed: %w", err)
	}
	if err := migrateGeometryItems(ctx, db.Collection("item"), fields, wetRun); err != nil {
		return fmt.Errorf("item migration failed: %w", err)
	}
	return nil
}

type geometrySchemaDocument struct {
	ObjectID primitive.ObjectID `bson:"_id"`
	ID       string             `bson:"id"`
	Fields   []struct {
		ID           string                  `bson:"id"`
		Key          string                  `bson:"key"`
		Unique       bool                    `bson:"unique"`
		DefaultValue *mongodoc.ValueDocument `bson:"defaultvalue"`
		TypeProperty struct {
			Type string `bson:"type"`
		} `bson:"typeproperty"`
	} `bson:"fields"`
}

type geometryField struct {
	schema string
	key    string
	unique bool
}

// migrateGeometrySchemas converts the fields and their default values, and returns the geometry fields by ID.
func migrateGeometrySchemas(ctx context.Context, col *mongo.Collection, wetRun bool) (map[string]geometryField, error) {
	fmt.Println("=== Schemas ===")

	cursor, err := col.Find(ctx, bson.M{"fields.typeproperty.type": bson.M{"$in": geometryTypes}})
	if err != nil {
		return nil, fmt.Errorf("failed to query schemas: %w", err)
	}
	defer func() { _ = cursor.Close(ctx) }()

	fields := map[string]geometryField{}
	updates := make([]mongo.WriteModel, 0)
	converted := 0

	for cursor.Next(ctx) {
		var s geometrySchemaDocument
		if err := cursor.Decode(&s); err != nil {
			return nil, fmt.Errorf("failed to decode schema: %w", err)
		}

		set := bson.M{}
		for i, f := range s.Fields {
			if !slices.Contains(geometryTypes, f.TypeProperty.Type) {
				continue
			}
			fields[f.ID] = geometryField{schema: s.ID, key: f.Key, unique: f.Unique}

			if f.TypeProperty.Type != string(value.TypeGeometry) {
				fmt.Printf("schema %s: field %s (%s) is converted from %s\n", s.ID, f.ID, f.Key, f.TypeProperty.Type)
				set[fmt.Sprintf("fields.%d.typeproperty", i)] = bson.D{{Key: "type", Value: string(value.TypeGeometry)}}
				converted++
			}

			if f.DefaultValue == nil {
				continue
			}
			res := convertGeometryValue(*f.DefaultValue)
			res.report(fmt.Sprintf("schema %s: default value of field %s (%s)", s.ID, f.ID, f.Key))
			if res.changed {
				set[fmt.Sprintf("fields.%d.defaultvalue", i)] = res.doc
			}
		}

		if len(set) > 0 {
			updates = append(updates, mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": s.ObjectID}).
				SetUpdate(bson.M{"$set": set}))
		}
	}
	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	fmt.Printf("%d fields to convert, %d schemas to update\n", converted, len(updates))
	if wetRun && len(updates) > 0 {
		if err := executeBatch(ctx, col, updates); err != nil {
			return nil, err
		}
	}
	return fields, nil
}

type geometryItemDocument struct {
	ObjectID primitive.ObjectID `bson:"_id"`
	ID       string             `bson:"id"`
	ModelID  string             `bson:"modelid"`
	Refs     []string           `bson:"__r"`
	Fields   []struct {
		F string                 `bson:"f"`
		V mongodoc.ValueDocument `bson:"v"`
	} `bson:"fields"`
}

// migrateGeometryItems converts the values of every item version and reports duplicates in the latest versions of unique fields.
func migrateGeometryItems(ctx context.Context, col *mongo.Collection, fields map[string]geometryField, wetRun bool) error {
	fmt.Println("=== Items ===")

	cursor, err := col.Find(ctx, bson.M{"fields.v.t": bson.M{"$in": geometryTypes}}, options.Find().SetBatchSize(1000))
	if err != nil {
		return fmt.Errorf("failed to query items: %w", err)
	}
	defer func() { _ = cursor.Close(ctx) }()

	// unique field values of the latest item versions: model, field and value -> item IDs
	uniqueValues := map[[3]string][]string{}
	batch := make([]mongo.WriteModel, 0, 1000)
	updated := 0

	for cursor.Next(ctx) {
		var it geometryItemDocument
		if err := cursor.Decode(&it); err != nil {
			return fmt.Errorf("failed to decode item: %w", err)
		}
		latest := slices.Contains(it.Refs, "latest")

		set := bson.M{}
		for i, f := range it.Fields {
			if !slices.Contains(geometryTypes, f.V.T) {
				continue
			}
			res := convertGeometryValue(f.V)
			if latest {
				// older versions are converted too, but only the latest version is reported
				res.report(fmt.Sprintf("item %s: field %s", it.ID, f.F))
				if fields[f.F].unique && res.key != "" {
					k := [3]string{it.ModelID, f.F, res.key}
					uniqueValues[k] = append(uniqueValues[k], it.ID)
				}
			}
			if res.changed {
				set[fmt.Sprintf("fields.%d.v", i)] = res.doc
			}
		}

		if len(set) == 0 {
			continue
		}
		updated++
		batch = append(batch, mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": it.ObjectID}).
			SetUpdate(bson.M{"$set": set}))
		if wetRun && len(batch) >= 1000 {
			if err := executeBatch(ctx, col, batch); err != nil {
				return err
			}
			batch = batch[:0]
		}
	}
	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}
	if wetRun && len(batch) > 0 {
		if err := executeBatch(ctx, col, batch); err != nil {
			return err
		}
	}
	fmt.Printf("%d item documents (all versions) to update\n", updated)

	reportGeometryDuplicates(uniqueValues, fields)
	return nil
}

func reportGeometryDuplicates(uniqueValues map[[3]string][]string, fields map[string]geometryField) {
	keys := make([][3]string, 0)
	for k, items := range uniqueValues {
		if len(items) > 1 {
			keys = append(keys, k)
		}
	}
	sort.Slice(keys, func(i, j int) bool {
		return fmt.Sprint(keys[i]) < fmt.Sprint(keys[j])
	})
	for _, k := range keys {
		f := fields[k[1]]
		fmt.Printf("duplicate: model %s, field %s (%s) of schema %s: items %v have the same value %s\n", k[0], k[1], f.key, f.schema, uniqueValues[k], k[2])
	}
	fmt.Printf("%d duplicate values in unique fields\n", len(keys))
}

type geometryValueResult struct {
	// doc is the converted value document
	doc *mongodoc.ValueDocument
	// changed is true when doc differs from the stored document
	changed bool
	// key identifies the value for the duplicate check; it is empty when the value is empty
	key string
	// dropped is the number of values that could not be read as a GeoJSON object
	dropped int
	// invalid are the validation errors of the converted values
	invalid []error
}

// convertGeometryValue converts a stored value of any geometry type into a Geometry value saved with sorted keys.
func convertGeometryValue(stored mongodoc.ValueDocument) geometryValueResult {
	d := mongodoc.ValueDocument{T: string(value.TypeGeometry), V: stored.V}
	m := d.MultipleValue()
	res := geometryValueResult{doc: mongodoc.NewMultipleValue(m)}

	res.dropped = len(stored.V) - m.Len()
	for _, v := range m.Values() {
		if err := schema.NewGeometry().Validate(v); err != nil {
			res.invalid = append(res.invalid, err)
		}
	}
	if m.Len() > 0 {
		if b, err := json.Marshal(m.Interface()); err == nil {
			res.key = string(b)
		}
	}
	res.changed = !sameValueDocument(stored, res.doc)
	return res
}

func sameValueDocument(a mongodoc.ValueDocument, b *mongodoc.ValueDocument) bool {
	ab, err := bson.Marshal(a)
	if err != nil {
		return false
	}
	bb, err := bson.Marshal(b)
	if err != nil {
		return false
	}
	return bytes.Equal(ab, bb)
}

func (r geometryValueResult) report(where string) {
	if r.dropped > 0 {
		fmt.Printf("%s: %d values are not GeoJSON objects and are removed\n", where, r.dropped)
	}
	for _, err := range r.invalid {
		fmt.Printf("%s: invalid value: %v\n", where, err)
	}
}
