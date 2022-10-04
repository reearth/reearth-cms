package gql

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

const (
	dataLoaderWait     = 1 * time.Millisecond
	dataLoaderMaxBatch = 100
)

type Loaders struct {
	usecases  interfaces.Container
	Asset     *AssetLoader
	Workspace *WorkspaceLoader
	User      *UserLoader
	Project   *ProjectLoader
	Model     *ModelLoader
	Schema    *SchemaLoader
}

type DataLoaders struct {
	Asset     AssetDataLoader
	Workspace WorkspaceDataLoader
	User      UserDataLoader
	Project   ProjectDataLoader
	Model     ModelDataLoader
	Schema    SchemaDataLoader
}

func NewLoaders(usecases *interfaces.Container) *Loaders {
	if usecases == nil {
		return nil
	}
	return &Loaders{
		usecases:  *usecases,
		Asset:     NewAssetLoader(usecases.Asset),
		Workspace: NewWorkspaceLoader(usecases.Workspace),
		User:      NewUserLoader(usecases.User),
		Project:   NewProjectLoader(usecases.Project),
		Model:     NewModelLoader(usecases.Model),
		Schema:    NewSchemaLoader(usecases.Schema),
	}
}

func (l Loaders) DataLoadersWith(ctx context.Context, enabled bool) *DataLoaders {
	if enabled {
		return l.DataLoaders(ctx)
	}
	return l.OrdinaryDataLoaders(ctx)
}

func (l Loaders) DataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:     l.Asset.DataLoader(ctx),
		Workspace: l.Workspace.DataLoader(ctx),
		User:      l.User.DataLoader(ctx),
		Project:   l.Project.DataLoader(ctx),
		Model:     l.Model.DataLoader(ctx),
		Schema:    l.Schema.DataLoader(ctx),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:     l.Asset.OrdinaryDataLoader(ctx),
		Workspace: l.Workspace.OrdinaryDataLoader(ctx),
		User:      l.User.OrdinaryDataLoader(ctx),
		Project:   l.Project.OrdinaryDataLoader(ctx),
		Model:     l.Model.OrdinaryDataLoader(ctx),
		Schema:    l.Schema.OrdinaryDataLoader(ctx),
	}
}
