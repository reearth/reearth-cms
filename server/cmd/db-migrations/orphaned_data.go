package main

import (
	"context"
	"fmt"
	"os"
	"sort"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// orphanedDataSource is a collection whose documents belong to a project.
type orphanedDataSource struct {
	collection   string
	projectField string
	sizeField    string // optional: field to sum (e.g. asset file size)
}

var orphanedDataSources = []orphanedDataSource{
	{collection: "model", projectField: "project"},
	{collection: "schema", projectField: "project"},
	{collection: "group", projectField: "project"},
	{collection: "view", projectField: "project"},
	{collection: "item", projectField: "project"},
	{collection: "asset", projectField: "project", sizeField: "size"},
	{collection: "asset_upload", projectField: "project"},
	{collection: "request", projectField: "project"},
	{collection: "job", projectField: "projectid"},
}

// projectGroup is the per-project aggregation result of one collection.
type projectGroup struct {
	Project string `bson:"_id"`
	Count   int64  `bson:"count"`
	Size    int64  `bson:"size"`
}

// orphanedSummary is the audit result of one collection.
type orphanedSummary struct {
	Collection string
	Docs       int64
	Projects   int
	Size       int64
}

// OrphanedData audits data that belongs to deleted projects (and projects of deleted workspaces).
// Only dry run (audit) is supported for now. Deletion will reuse the project cascade deletion.
func OrphanedData(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	if wetRun {
		return fmt.Errorf("wet run is not supported yet: deletion will reuse the project cascade deletion")
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() { _ = client.Disconnect(ctx) }()
	db := client.Database(dbName)

	projects, err := _od_loadProjects(ctx, db.Collection("project"))
	if err != nil {
		return err
	}
	fmt.Printf("dry run: %d existing projects\n\n", len(projects))

	summaries := make([]orphanedSummary, 0, len(orphanedDataSources))
	for _, src := range orphanedDataSources {
		groups, err := _od_groupByProject(ctx, db.Collection(src.collection), src)
		if err != nil {
			return fmt.Errorf("failed to aggregate %s: %w", src.collection, err)
		}
		summaries = append(summaries, summarizeOrphaned(src.collection, groups, projects))
	}
	printOrphanedSummaries(summaries)

	// projects whose workspace no longer exists (optional, needs the account DB)
	accountDBName := os.Getenv("REEARTH_CMS_DB_ACCOUNT")
	if accountDBName == "" {
		accountDBName = "reearth_account"
	}
	workspaces, err := _od_loadIDs(ctx, client.Database(accountDBName).Collection("workspace"))
	if err != nil {
		return fmt.Errorf("failed to load workspaces: %w", err)
	}
	if len(workspaces) == 0 {
		fmt.Printf("\nskipped workspace check: no workspaces found in account DB '%s'\n", accountDBName)
		return nil
	}
	orphanedProjects := 0
	for _, ws := range projects {
		if _, ok := workspaces[ws]; !ok {
			orphanedProjects++
		}
	}
	fmt.Printf("\nprojects whose workspace no longer exists: %d (account DB '%s', %d workspaces)\n", orphanedProjects, accountDBName, len(workspaces))
	return nil
}

// summarizeOrphaned keeps only the groups whose project does not exist.
func summarizeOrphaned(collection string, groups []projectGroup, projects map[string]string) orphanedSummary {
	s := orphanedSummary{Collection: collection}
	for _, g := range groups {
		// documents without a project are not caused by project deletion
		if g.Project == "" {
			continue
		}
		if _, ok := projects[g.Project]; ok {
			continue
		}
		s.Docs += g.Count
		s.Size += g.Size
		s.Projects++
	}
	return s
}

func printOrphanedSummaries(summaries []orphanedSummary) {
	sort.SliceStable(summaries, func(i, j int) bool { return summaries[i].Docs > summaries[j].Docs })
	fmt.Printf("%-14s %14s %18s %14s\n", "collection", "orphaned docs", "deleted projects", "size")
	for _, s := range summaries {
		size := "-"
		if s.Size > 0 {
			size = formatBytes(s.Size)
		}
		fmt.Printf("%-14s %14d %18d %14s\n", s.Collection, s.Docs, s.Projects, size)
	}
}

func formatBytes(b int64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %ciB", float64(b)/float64(div), "KMGTPE"[exp])
}

// _od_loadProjects returns existing projects as project ID -> workspace ID.
func _od_loadProjects(ctx context.Context, col *mongo.Collection) (map[string]string, error) {
	cur, err := col.Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"id": 1, "workspace": 1}))
	if err != nil {
		return nil, fmt.Errorf("failed to load projects: %w", err)
	}
	defer func() { _ = cur.Close(ctx) }()

	res := map[string]string{}
	for cur.Next(ctx) {
		var d struct {
			ID        string `bson:"id"`
			Workspace string `bson:"workspace"`
		}
		if err := cur.Decode(&d); err != nil {
			return nil, fmt.Errorf("failed to decode project: %w", err)
		}
		res[d.ID] = d.Workspace
	}
	return res, cur.Err()
}

func _od_loadIDs(ctx context.Context, col *mongo.Collection) (map[string]struct{}, error) {
	cur, err := col.Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"id": 1}))
	if err != nil {
		return nil, err
	}
	defer func() { _ = cur.Close(ctx) }()

	res := map[string]struct{}{}
	for cur.Next(ctx) {
		var d struct {
			ID string `bson:"id"`
		}
		if err := cur.Decode(&d); err != nil {
			return nil, err
		}
		res[d.ID] = struct{}{}
	}
	return res, cur.Err()
}

// _od_groupByProject counts documents (and sums sizeField if set) per project.
func _od_groupByProject(ctx context.Context, col *mongo.Collection, src orphanedDataSource) ([]projectGroup, error) {
	group := bson.M{
		"_id":   "$" + src.projectField,
		"count": bson.M{"$sum": 1},
	}
	if src.sizeField != "" {
		group["size"] = bson.M{"$sum": "$" + src.sizeField}
	}
	pipeline := mongo.Pipeline{{{Key: "$group", Value: group}}}

	cur, err := col.Aggregate(ctx, pipeline, options.Aggregate().SetAllowDiskUse(true))
	if err != nil {
		return nil, err
	}
	var res []projectGroup
	if err := cur.All(ctx, &res); err != nil {
		return nil, err
	}
	return res, nil
}
