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
	usecases    interfaces.Container
	Asset       *AssetLoader
	Workspace   *WorkspaceLoader
	Item        *ItemLoader
	User        *UserLoader
	Project     *ProjectLoader
	Model       *ModelLoader
	Schema      *SchemaLoader
	Thread      *ThreadLoader
	Integration *IntegrationLoader
}

type DataLoaders struct {
	Asset       AssetDataLoader
	Workspace   WorkspaceDataLoader
	User        UserDataLoader
	Project     ProjectDataLoader
	Item        ItemDataLoader
	Model       ModelDataLoader
	Schema      SchemaDataLoader
	Thread      ThreadDataLoader
	Integration IntegrationDataLoader
}

func NewLoaders(usecases *interfaces.Container) *Loaders {
	if usecases == nil {
		return nil
	}
	return &Loaders{
		usecases:    *usecases,
		Asset:       NewAssetLoader(usecases.Asset),
		Workspace:   NewWorkspaceLoader(usecases.Workspace),
		User:        NewUserLoader(usecases.User),
		Project:     NewProjectLoader(usecases.Project),
		Model:       NewModelLoader(usecases.Model),
		Schema:      NewSchemaLoader(usecases.Schema),
		Integration: NewIntegrationLoader(usecases.Integration),
		Item:        NewItemLoader(usecases.Item),
		Thread:      NewThreadLoader(usecases.Thread),
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
		Asset:       l.Asset.DataLoader(ctx),
		Workspace:   l.Workspace.DataLoader(ctx),
		User:        l.User.DataLoader(ctx),
		Project:     l.Project.DataLoader(ctx),
		Model:       l.Model.DataLoader(ctx),
		Schema:      l.Schema.DataLoader(ctx),
		Integration: l.Integration.DataLoader(ctx),
		Item:        l.Item.DataLoader(ctx),
		Thread:      l.Thread.DataLoader(ctx),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:       l.Asset.OrdinaryDataLoader(ctx),
		Workspace:   l.Workspace.OrdinaryDataLoader(ctx),
		User:        l.User.OrdinaryDataLoader(ctx),
		Project:     l.Project.OrdinaryDataLoader(ctx),
		Model:       l.Model.OrdinaryDataLoader(ctx),
		Schema:      l.Schema.OrdinaryDataLoader(ctx),
		Item:        l.Item.OrdinaryDataLoader(ctx),
		Integration: l.Integration.OrdinaryDataLoader(ctx),
		Thread:      l.Thread.OrdinaryDataLoader(ctx),
	}
}
