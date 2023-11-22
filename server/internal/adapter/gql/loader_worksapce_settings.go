package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettingsLoader struct {
	usecase interfaces.WorkspaceSettings
}

func NewWorkspaceSettingsLoader(usecase interfaces.WorkspaceSettings) *WorkspaceSettingsLoader {
	return &WorkspaceSettingsLoader{usecase: usecase}
}

func (c *WorkspaceSettingsLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
	wsids, err := util.TryMap(ids, gqlmodel.ToID[id.WorkspaceSettings])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, wsids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	workspaces := make([]*gqlmodel.WorkspaceSettings, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspaceSettings(t))
	}
	return workspaces, nil
}

// data loader

type WorkspaceSettingsDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.WorkspaceSettings, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error)
}

func (c *WorkspaceSettingsLoader) DataLoader(ctx context.Context) WorkspaceSettingsDataLoader {
	return gqldataloader.NewWorkspaceSettingsLoader(gqldataloader.WorkspaceSettingsLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *WorkspaceSettingsLoader) OrdinaryDataLoader(ctx context.Context) WorkspaceSettingsDataLoader {
	return &ordinaryWorkspaceSettingsLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryWorkspaceSettingsLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error)
}

func (l *ordinaryWorkspaceSettingsLoader) Load(key gqlmodel.ID) (*gqlmodel.WorkspaceSettings, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryWorkspaceSettingsLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
	return l.fetch(keys)
}
