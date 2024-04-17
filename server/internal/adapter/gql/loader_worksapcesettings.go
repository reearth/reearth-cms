package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type WorkspaceSettingsLoader struct {
	usecase interfaces.WorkspaceSettings
}

func NewWorkspaceSettingsLoader(usecase interfaces.WorkspaceSettings) *WorkspaceSettingsLoader {
	return &WorkspaceSettingsLoader{usecase: usecase}
}

func (c *WorkspaceSettingsLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
	wsIDs, err := util.TryMap(ids, gqlmodel.ToID[accountdomain.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, wsIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(wsIDs, func(id workspacesettings.ID, _ int) *gqlmodel.WorkspaceSettings {
		ws, ok := lo.Find(res, func(ws *workspacesettings.WorkspaceSettings) bool {
			return ws != nil && ws.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToWorkspaceSettings(ws)
	}), nil
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
