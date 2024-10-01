package gql

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/vikstrous/dataloadgen"
)

const (
	dataLoaderWait     = 1 * time.Millisecond
	dataLoaderMaxBatch = 100
)

type Loaders struct {
	usecases          interfaces.Container
	Asset             *AssetLoader
	Workspace         *WorkspaceLoader
	Item              *ItemLoader
	View              *ViewLoader
	ItemStatus        *ItemStatusLoader
	AssetItem         *AssetItemLoader
	User              *UserLoader
	Project           *ProjectLoader
	Model             *ModelLoader
	Request           *RequestLoader
	Schema            *SchemaLoader
	Thread            *ThreadLoader
	Integration       *IntegrationLoader
	Group             *GroupLoader
	WorkspaceSettings *WorkspaceSettingsLoader
}

func NewLoaders(usecases *interfaces.Container) *Loaders {
	if usecases == nil {
		return nil
	}
	return &Loaders{
		usecases:          *usecases,
		Asset:             NewAssetLoader(usecases.Asset),
		Workspace:         NewWorkspaceLoader(usecases.Workspace),
		User:              NewUserLoader(usecases.User),
		Project:           NewProjectLoader(usecases.Project),
		Model:             NewModelLoader(usecases.Model),
		Request:           NewRequestLoader(usecases.Request),
		Schema:            NewSchemaLoader(usecases.Schema),
		AssetItem:         NewAssetItemLoader(usecases.Item),
		Integration:       NewIntegrationLoader(usecases.Integration),
		Item:              NewItemLoader(usecases.Item, usecases.Schema, usecases.Model),
		View:              NewViewLoader(usecases.View),
		ItemStatus:        NewItemStatusLoader(usecases.Item),
		Thread:            NewThreadLoader(usecases.Thread),
		Group:             NewGroupLoader(usecases.Group),
		WorkspaceSettings: NewWorkspaceSettingsLoader(usecases.WorkspaceSettings),
	}
}

type DataLoaders struct {
	Asset             Loader[gqlmodel.Asset]
	Workspace         Loader[gqlmodel.Workspace]
	User              Loader[gqlmodel.User]
	Project           Loader[gqlmodel.Project]
	Item              Loader[gqlmodel.Item]
	View              Loader[gqlmodel.View]
	ItemStatus        Loader[gqlmodel.ItemStatus]
	AssetItems        Loader[[]gqlmodel.AssetItem]
	Model             Loader[gqlmodel.Model]
	Request           Loader[gqlmodel.Request]
	Schema            Loader[gqlmodel.Schema]
	Thread            Loader[gqlmodel.Thread]
	Integration       Loader[gqlmodel.Integration]
	Group             Loader[gqlmodel.Group]
	WorkspaceSettings Loader[gqlmodel.WorkspaceSettings]
}

func (l Loaders) DataLoadersWith(ctx context.Context, enabled bool) *DataLoaders {
	if enabled {
		return l.DataLoaders(ctx)
	}
	return l.OrdinaryDataLoaders(ctx)
}

func (l Loaders) DataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:             NewCashedLoader(ctx, l.Asset.FindByIDs),
		Workspace:         NewCashedLoader(ctx, l.Workspace.Fetch),
		User:              NewCashedLoader(ctx, l.User.Fetch),
		Project:           NewCashedLoader(ctx, l.Project.Fetch),
		Model:             NewCashedLoader(ctx, l.Model.Fetch),
		Request:           NewCashedLoader(ctx, l.Request.Fetch),
		AssetItems:        NewCashedLoader(ctx, l.AssetItem.Fetch),
		Schema:            NewCashedLoader(ctx, l.Schema.Fetch),
		Integration:       NewCashedLoader(ctx, l.Integration.Fetch),
		Item:              NewCashedLoader(ctx, l.Item.Fetch),
		View:              NewCashedLoader(ctx, l.View.Fetch),
		ItemStatus:        NewCashedLoader(ctx, l.ItemStatus.Fetch),
		Thread:            NewCashedLoader(ctx, l.Thread.FindByIDs),
		Group:             NewCashedLoader(ctx, l.Group.Fetch),
		WorkspaceSettings: NewCashedLoader(ctx, l.WorkspaceSettings.Fetch),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:             NewOrdinaryLoader(ctx, l.Asset.FindByIDs),
		Workspace:         NewOrdinaryLoader(ctx, l.Workspace.Fetch),
		User:              NewOrdinaryLoader(ctx, l.User.Fetch),
		Project:           NewOrdinaryLoader(ctx, l.Project.Fetch),
		Model:             NewOrdinaryLoader(ctx, l.Model.Fetch),
		AssetItems:        NewOrdinaryLoader(ctx, l.AssetItem.Fetch),
		Request:           NewOrdinaryLoader(ctx, l.Request.Fetch),
		Schema:            NewOrdinaryLoader(ctx, l.Schema.Fetch),
		Item:              NewOrdinaryLoader(ctx, l.Item.Fetch),
		View:              NewOrdinaryLoader(ctx, l.View.Fetch),
		ItemStatus:        NewOrdinaryLoader(ctx, l.ItemStatus.Fetch),
		Integration:       NewOrdinaryLoader(ctx, l.Integration.Fetch),
		Thread:            NewOrdinaryLoader(ctx, l.Thread.FindByIDs),
		Group:             NewOrdinaryLoader(ctx, l.Group.Fetch),
		WorkspaceSettings: NewOrdinaryLoader(ctx, l.WorkspaceSettings.Fetch),
	}
}

type Loader[T any] interface {
	Load(gqlmodel.ID) (*T, error)
	LoadAll([]gqlmodel.ID) ([]*T, []error)
}

type FetchFn[T any] func(context.Context, []gqlmodel.ID) ([]*T, []error)

type OrdinaryLoader[T any] struct {
	ctx   context.Context
	fetch FetchFn[T]
}

func NewOrdinaryLoader[T any](ctx context.Context, f FetchFn[T]) Loader[T] {
	return &OrdinaryLoader[T]{
		ctx:   ctx,
		fetch: f,
	}
}

func (l *OrdinaryLoader[T]) Load(key gqlmodel.ID) (*T, error) {
	res, errs := l.fetch(l.ctx, []gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *OrdinaryLoader[T]) LoadAll(keys []gqlmodel.ID) ([]*T, []error) {
	return l.fetch(l.ctx, keys)
}

type CashedLoader[T any] struct {
	ctx    context.Context
	loader *dataloadgen.Loader[gqlmodel.ID, *T]
}

func NewCashedLoader[T any](ctx context.Context, f FetchFn[T]) Loader[T] {
	return &CashedLoader[T]{
		ctx:    ctx,
		loader: dataloadgen.NewLoader[gqlmodel.ID, *T](f, dataloadgen.WithWait(dataLoaderWait), dataloadgen.WithBatchCapacity(dataLoaderMaxBatch)),
	}
}

func (l *CashedLoader[T]) Load(key gqlmodel.ID) (*T, error) {
	return l.loader.Load(l.ctx, key)
}

func (l *CashedLoader[T]) LoadAll(keys []gqlmodel.ID) ([]*T, []error) {
	res, err := l.loader.LoadAll(l.ctx, keys)
	return res, []error{err}
}
