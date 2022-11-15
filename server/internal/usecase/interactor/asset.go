package interactor

import (
	"context"
	"path"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Asset struct {
	repos     *repo.Container
	gateways  *gateway.Container
	eventFunc func(ctx context.Context, wid id.WorkspaceID, t event.Type, a *asset.Asset, op operator.Operator) (*event.Event[any], error)
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
		eventFunc: func(ctx context.Context, wid id.WorkspaceID, t event.Type, a *asset.Asset, op operator.Operator) (*event.Event[any], error) {
			return createEvent(ctx, r, g, wid, t, a, op)
		},
	}
}

func (i *Asset) FindByID(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	return i.repos.Asset.FindByID(ctx, aid)

}

func (i *Asset) FindByIDs(ctx context.Context, assets []id.AssetID, operator *usecase.Operator) (asset.List, error) {
	return i.repos.Asset.FindByIDs(ctx, assets)
}

func (i *Asset) FindByProject(ctx context.Context, pid id.ProjectID, filter interfaces.AssetFilter, operator *usecase.Operator) (asset.List, *usecasex.PageInfo, error) {
	return i.repos.Asset.FindByProject(ctx, pid, repo.AssetFilter{
		Sort:       filter.Sort,
		Keyword:    filter.Keyword,
		Pagination: filter.Pagination,
	})
}

func (i *Asset) GetURL(a *asset.Asset) string {
	return i.gateways.File.GetURL(a)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, op *usecase.Operator) (result *asset.Asset, err error) {
	if op.User == nil && op.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, err
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(prj.Workspace()).Transaction(),
		func() (*asset.Asset, error) {
			uuid, err := i.gateways.File.UploadAsset(ctx, inp.File)
			if err != nil {
				return nil, err
			}

			th, err := thread.New().NewID().Workspace(prj.Workspace()).Build()

			if err != nil {
				return nil, err
			}
			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, err
			}

			f := asset.NewFile().Name(inp.File.Path).Path(inp.File.Path).Size(uint64(inp.File.Size)).ContentType(inp.File.ContentType).Build()

			ab := asset.New().
				NewID().
				Project(inp.ProjectID).
				FileName(path.Base(inp.File.Path)).
				Size(uint64(inp.File.Size)).
				File(f).
				Type(asset.PreviewTypeFromContentType(inp.File.ContentType)).
				UUID(uuid).
				Thread(th.ID())

			if op.User != nil {
				ab.CreatedByUser(*op.User)
			}
			if op.Integration != nil {
				ab.CreatedByIntegration(*op.Integration)
			}

			a, err := ab.Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			// taskPayload for runner
			taskPayload := task.DecompressAssetPayload{
				AssetID: a.ID().String(),
				Path:    a.RootPath(),
			}

			err = i.gateways.TaskRunner.Run(ctx, taskPayload.Payload())
			if err != nil {
				return nil, err
			}

			// create event
			if _, err := i.eventFunc(ctx, prj.Workspace(), event.AssetCreate, a, op.Operator()); err != nil {
				return nil, err
			}

			return a, nil
		})
}

func (i *Asset) Update(ctx context.Context, inp interfaces.UpdateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if operator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	a, err := i.repos.Asset.FindByID(ctx, inp.AssetID)
	if err != nil {
		return nil, err
	}
	p, err := i.repos.Project.FindByID(ctx, a.Project())
	if err != nil {
		return nil, err
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction().WithWritableWorkspaces(p.Workspace()),
		func() (*asset.Asset, error) {
			if err := updatable(a.User(), a.Integration(), p.Workspace(), operator); err != nil {
				return nil, err
			}

			if inp.PreviewType != nil {
				a.UpdatePreviewType(inp.PreviewType)
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		},
	)
}

func (i *Asset) UpdateFiles(ctx context.Context, aId id.AssetID, op *usecase.Operator) (*asset.Asset, error) {
	if op.User == nil && op.Integration == nil && !op.Machine {
		return nil, interfaces.ErrInvalidOperator
	}

	a, err := i.repos.Asset.FindByID(ctx, aId)
	if err != nil {
		return nil, err
	}
	p, err := i.repos.Project.FindByID(ctx, a.Project())
	if err != nil {
		return nil, err
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction().WithWritableWorkspaces(p.Workspace()),
		func() (*asset.Asset, error) {
			if err := updatable(a.User(), a.Integration(), p.Workspace(), op); err != nil {
				return nil, err
			}

			files, err := i.gateways.File.GetAssetFiles(ctx, a.UUID())
			if err != nil {
				return nil, err
			}

			assetFiles := lo.Filter(lo.Map(files, func(f gateway.FileEntry, _ int) *asset.File {
				return asset.NewFile().
					Name(path.Base(f.Name)).
					Path(f.Name).
					GuessContentType().
					Build()
			}), func(f *asset.File, _ int) bool {
				return a.File().Path() != f.Path()
			})

			a.SetFile(asset.FoldFiles(assetFiles, a.File()))
			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			if _, err := i.eventFunc(ctx, p.Workspace(), event.AssetDecompress, a, op.Operator()); err != nil {
				return nil, err
			}

			return a, nil
		},
	)
}

func (i *Asset) Delete(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	if operator.User == nil && operator.Integration == nil {
		return aId, interfaces.ErrInvalidOperator
	}
	a, err := i.repos.Asset.FindByID(ctx, aId)
	if err != nil {
		return aId, err
	}
	p, err := i.repos.Project.FindByID(ctx, a.Project())
	if err != nil {
		return aId, err
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction().WithWritableWorkspaces(p.Workspace()),
		func() (id.AssetID, error) {
			if err := updatable(a.User(), a.Integration(), p.Workspace(), operator); err != nil {
				return aId, err
			}

			uuid := a.UUID()
			filename := a.FileName()
			if uuid != "" && filename != "" {
				if err := i.gateways.File.DeleteAsset(ctx, uuid, filename); err != nil {
					return aId, err
				}
			}

			err = i.repos.Asset.Delete(ctx, aId)
			if err != nil {
				return aId, err
			}

			if _, err := i.eventFunc(ctx, p.Workspace(), event.AssetDelete, a, operator.Operator()); err != nil {
				return aId, err
			}

			return aId, nil
		},
	)
}
