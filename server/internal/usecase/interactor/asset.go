package interactor

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Asset struct {
	repos       *repo.Container
	gateways    *gateway.Container
	ignoreEvent bool
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
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

	if inp.File == nil && inp.URL == "" {
		return nil, interfaces.ErrFileNotIncluded
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
			if err != nil {
				return nil, err
			}

			if !op.IsWritableWorkspace(prj.Workspace()) {
				return nil, interfaces.ErrOperationDenied
			}

			var uuid string
			var size int64
			var file *file.File
			if inp.File != nil {
				file = inp.File
				uuid, size, err = i.gateways.File.UploadAsset(ctx, inp.File)
				if err != nil {
					return nil, err
				}
			}
			if inp.URL != "" {
				file, err = getExternalFile(ctx, inp.URL)
				if err != nil {
					return nil, err
				}
				uuid, size, err = i.gateways.File.UploadAsset(ctx, file)
				if err != nil {
					return nil, err
				}
			}
			file.Size = int64(size)

			th, err := thread.New().NewID().Workspace(prj.Workspace()).Build()

			if err != nil {
				return nil, err
			}
			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, err
			}

			f := asset.NewFile().Name(file.Path).Path(file.Path).Size(uint64(file.Size)).ContentType(file.ContentType).Build()

			ab := asset.New().
				NewID().
				Project(inp.ProjectID).
				FileName(path.Base(file.Path)).
				Size(uint64(file.Size)).
				File(f).
				Type(asset.PreviewTypeFromContentType(file.ContentType)).
				UUID(uuid).
				Thread(th.ID())
				//set status to "pending"

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

			taskPayload := task.DecompressAssetPayload{
				AssetID: a.ID().String(),
				Path:    a.RootPath(),
			}
			if err := i.gateways.TaskRunner.Run(ctx, taskPayload.Payload()); err != nil {
				return nil, err
			}

			//set status to in progress and save asset

			if err := i.event(ctx, Event{
				Workspace: prj.Workspace(),
				Type:      event.AssetCreate,
				Object:    a,
				Operator:  op.Operator(),
			}); err != nil {
				return nil, err
			}

			return a, nil
		})
}

func (i *Asset) Update(ctx context.Context, inp interfaces.UpdateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if operator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, inp.AssetID)
			if err != nil {
				return nil, err
			}

			if !operator.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
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

	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, aId)
			if err != nil {
				return nil, err
			}

			if !op.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
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
			//set status
			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			p, err := i.repos.Project.FindByID(ctx, a.Project())
			if err != nil {
				return nil, err
			}

			if err := i.event(ctx, Event{
				Workspace: p.Workspace(),
				Type:      event.AssetDecompress,
				Object:    a,
				Operator:  op.Operator(),
			}); err != nil {
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

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (id.AssetID, error) {
			a, err := i.repos.Asset.FindByID(ctx, aId)
			if err != nil {
				return aId, err
			}

			if !operator.CanUpdate(a) {
				return aId, interfaces.ErrOperationDenied
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

			p, err := i.repos.Project.FindByID(ctx, a.Project())
			if err != nil {
				return aId, err
			}

			if err := i.event(ctx, Event{
				Workspace: p.Workspace(),
				Type:      event.AssetDelete,
				Object:    a,
				Operator:  operator.Operator(),
			}); err != nil {
				return aId, err
			}

			return aId, nil
		},
	)
}

func (i *Asset) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}

func getExternalFile(ctx context.Context, rawURL string) (*file.File, error) {
	URL, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	filename := path.Join("/", path.Base(URL.Path))
	req, err := http.NewRequestWithContext(ctx, "GET", URL.String(), nil)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	client := http.DefaultClient
	res, err := client.Do(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	if res.StatusCode > 300 {
		return nil, rerror.ErrInternalBy(fmt.Errorf("status code is %d", res.StatusCode))
	}
	ct := res.Header.Get("Content-Type")
	file := &file.File{Content: res.Body, Path: filename, ContentType: ct}

	return file, nil
}
