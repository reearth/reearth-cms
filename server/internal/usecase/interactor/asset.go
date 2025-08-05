package interactor

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type contextKey string

type Asset struct {
	repos       *repo.Container
	gateways    *gateway.Container
	config      ContainerConfig
	ignoreEvent bool
}

func NewAsset(r *repo.Container, g *gateway.Container, config ContainerConfig) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
		config:   config,
	}
}

func (i *Asset) FindByID(ctx context.Context, aid id.AssetID, _ *usecase.Operator) (*asset.Asset, error) {
	a, err := i.repos.Asset.FindByID(ctx, aid)
	if err != nil {
		return nil, err
	}
	if a != nil {
		a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
	}
	return a, nil
}

func (i *Asset) FindByUUID(ctx context.Context, uuid string, _ *usecase.Operator) (*asset.Asset, error) {
	a, err := i.repos.Asset.FindByUUID(ctx, uuid)
	if err != nil {
		return nil, err
	}
	if a != nil {
		a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
	}
	return a, nil
}

func (i *Asset) FindByIDs(ctx context.Context, assets []id.AssetID, _ *usecase.Operator) (asset.List, error) {
	al, err := i.repos.Asset.FindByIDs(ctx, assets)
	if err != nil {
		return nil, err
	}
	if al != nil {
		al.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
	}
	return al, nil
}

func (i *Asset) Search(ctx context.Context, projectID id.ProjectID, filter interfaces.AssetFilter, _ *usecase.Operator) (asset.List, *usecasex.PageInfo, error) {
	al, pi, err := i.repos.Asset.Search(ctx, projectID, repo.AssetFilter{
		Sort:         filter.Sort,
		Keyword:      filter.Keyword,
		Pagination:   filter.Pagination,
		ContentTypes: filter.ContentTypes,
	})
	if err != nil {
		return nil, nil, err
	}
	if al != nil {
		al.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
	}
	return al, pi, nil
}

func (i *Asset) FindFileByID(ctx context.Context, aid id.AssetID, _ *usecase.Operator) (*asset.File, error) {
	_, err := i.repos.Asset.FindByID(ctx, aid)
	if err != nil {
		return nil, err
	}

	files, err := i.repos.AssetFile.FindByID(ctx, aid)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (i *Asset) FindFilesByIDs(ctx context.Context, ids id.AssetIDList, _ *usecase.Operator) (map[id.AssetID]*asset.File, error) {
	_, err := i.repos.Asset.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	files, err := i.repos.AssetFile.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (i *Asset) DownloadByID(ctx context.Context, aid id.AssetID, headers map[string]string, _ *usecase.Operator) (io.ReadCloser, map[string]string, error) {
	a, err := i.repos.Asset.FindByID(ctx, aid)
	if err != nil {
		return nil, nil, err
	}

	f, headers, err := i.gateways.File.ReadAsset(ctx, a.UUID(), a.FileName(), headers)
	if err != nil {
		return nil, nil, err
	}

	return f, headers, nil
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, op *usecase.Operator) (result *asset.Asset, afile *asset.File, err error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}

	if inp.File == nil && inp.Token == "" {
		return nil, nil, interfaces.ErrFileNotIncluded
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, nil, err
	}

	if !op.IsWritableWorkspace(prj.Workspace()) {
		return nil, nil, interfaces.ErrOperationDenied
	}

	var uuid string
	var file *file.File
	if inp.File != nil {
		if inp.File.ContentEncoding == "gzip" {
			inp.File.Name = strings.TrimSuffix(inp.File.Name, ".gz")
		}

		var size int64
		file = inp.File

		if i.gateways != nil && i.gateways.PolicyChecker != nil {
			policyReq := gateway.PolicyCheckRequest{
				WorkspaceID: prj.Workspace(),
				CheckType:   gateway.PolicyCheckUploadAssetsSize,
				Value:       file.Size,
			}
			policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
			if err != nil {
				return nil, nil, rerror.NewE(i18n.T("policy check failed"))
			}
			if !policyResp.Allowed {
				return nil, nil, interfaces.ErrAssetUploadSizeLimitExceeded
			}
		}

		ctxWithWorkspace := context.WithValue(ctx, contextKey("workspace"), prj.Workspace().String())
		uuid, size, err = i.gateways.File.UploadAsset(ctxWithWorkspace, inp.File)
		if err != nil {
			return nil, nil, err
		}

		file.Size = size
	}

	a, f, err := Run2(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, *asset.File, error) {
			if inp.Token != "" {
				uuid = inp.Token
				u, err := i.repos.AssetUpload.FindByID(ctx, uuid)
				if err != nil {
					return nil, nil, err
				}
				if u.Expired(time.Now()) {
					return nil, nil, rerror.ErrInternalBy(fmt.Errorf("expired upload token: %s", uuid))
				}
				file, err = i.gateways.File.UploadedAsset(ctx, u)
				if err != nil {
					return nil, nil, err
				}
			}

			needDecompress := false
			if ext := strings.ToLower(path.Ext(file.Name)); ext == ".zip" || ext == ".7z" {
				needDecompress = true
			}

			es := lo.ToPtr(asset.ArchiveExtractionStatusDone)
			if needDecompress {
				if inp.SkipDecompression {
					es = lo.ToPtr(asset.ArchiveExtractionStatusSkipped)
				} else {
					es = lo.ToPtr(asset.ArchiveExtractionStatusPending)
				}
			}

			ab := asset.New().
				NewID().
				Project(inp.ProjectID).
				FileName(path.Base(file.Name)).
				Size(uint64(file.Size)).
				Type(asset.DetectPreviewType(file)).
				UUID(uuid).
				ArchiveExtractionStatus(es)

			if op.AcOperator.User != nil {
				ab.CreatedByUser(*op.AcOperator.User)
			}
			if op.Integration != nil {
				ab.CreatedByIntegration(*op.Integration)
			}

			a, err := ab.Build()
			if err != nil {
				return nil, nil, err
			}

			a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())

			f := asset.NewFile().
				Name(file.Name).
				Path(file.Name).
				Size(uint64(file.Size)).
				ContentType(file.ContentType).
				GuessContentTypeIfEmpty().
				ContentEncoding(file.ContentEncoding).
				Build()

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, nil, err
			}

			if err := i.repos.AssetFile.Save(ctx, a.ID(), f); err != nil {
				return nil, nil, err
			}

			if needDecompress && !inp.SkipDecompression {
				if err := i.triggerDecompressEvent(ctx, a, f); err != nil {
					return nil, nil, err
				}
			}
			return a, f, nil
		})

	if err != nil {
		return nil, nil, err
	}

	// In AWS, extraction is done in very short time when a zip file is small, so it often results in an error because an asset is not saved yet in MongoDB. So an event should be created after commtting the transaction.
	if err := i.event(ctx, Event{
		Project:   prj,
		Workspace: prj.Workspace(),
		Type:      event.AssetCreate,
		Object:    a,
		Operator:  op.Operator(),
	}); err != nil {
		return nil, nil, err
	}

	return a, f, nil
}

func (i *Asset) Decompress(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, aId)
			if err != nil {
				return nil, err
			}

			a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())

			if !operator.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
			}

			f, err := i.repos.AssetFile.FindByID(ctx, aId)
			if err != nil {
				return nil, err
			}

			if err := i.triggerDecompressEvent(ctx, a, f); err != nil {
				return nil, err
			}

			a.UpdateArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusPending))

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		},
	)
}

func (i *Asset) Publish(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*asset.Asset, error) {
		a, err := i.repos.Asset.FindByID(ctx, aId)
		if err != nil {
			return nil, err
		}

		if a != nil {
			a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
		}

		if !operator.CanUpdate(a) {
			return nil, interfaces.ErrOperationDenied
		}

		err = i.gateways.File.PublishAsset(ctx, a.UUID(), a.FileName())
		if err != nil {
			return nil, err
		}

		a.UpdatePublic(true)

		if err := i.repos.Asset.Save(ctx, a); err != nil {
			return nil, err
		}

		return a, nil
	})
}

func (i *Asset) Unpublish(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*asset.Asset, error) {
		a, err := i.repos.Asset.FindByID(ctx, aId)
		if err != nil {
			return nil, err
		}

		if a != nil {
			a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
		}

		if !operator.CanUpdate(a) {
			return nil, interfaces.ErrOperationDenied
		}

		err = i.gateways.File.UnpublishAsset(ctx, a.UUID(), a.FileName())
		if err != nil {
			return nil, err
		}

		a.UpdatePublic(false)

		if err := i.repos.Asset.Save(ctx, a); err != nil {
			return nil, err
		}

		return a, nil
	})
}

type wrappedUploadCursor struct {
	UUID   string
	Cursor string
}

func (c wrappedUploadCursor) String() string {
	return c.UUID + "_" + c.Cursor
}

func parseWrappedUploadCursor(c string) (*wrappedUploadCursor, error) {
	uuid, cursor, found := strings.Cut(c, "_")
	if !found {
		return nil, fmt.Errorf("separator not found")
	}
	return &wrappedUploadCursor{
		UUID:   uuid,
		Cursor: cursor,
	}, nil
}

func wrapUploadCursor(uuid, cursor string) string {
	if cursor == "" {
		return ""
	}
	return wrappedUploadCursor{UUID: uuid, Cursor: cursor}.String()
}

func (i *Asset) CreateUpload(ctx context.Context, inp interfaces.CreateAssetUploadParam, op *usecase.Operator) (*interfaces.AssetUpload, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	if inp.ContentEncoding == "gzip" {
		inp.Filename = strings.TrimSuffix(inp.Filename, ".gz")
	}

	var param *gateway.IssueUploadAssetParam
	if inp.Cursor == "" {
		if inp.Filename == "" {
			// TODO: Change to the appropriate error
			return nil, interfaces.ErrFileNotIncluded
		}

		const week = 7 * 24 * time.Hour
		expiresAt := time.Now().Add(1 * week)
		param = &gateway.IssueUploadAssetParam{
			UUID:            uuid.New().String(),
			Filename:        inp.Filename,
			ContentLength:   inp.ContentLength,
			ContentType:     inp.ContentType,
			ContentEncoding: inp.ContentEncoding,
			ExpiresAt:       expiresAt,
			Cursor:          "",
		}
	} else {
		wrapped, err := parseWrappedUploadCursor(inp.Cursor)
		if err != nil {
			return nil, fmt.Errorf("parse cursor(%s): %w", inp.Cursor, err)
		}
		au, err := i.repos.AssetUpload.FindByID(ctx, wrapped.UUID)
		if err != nil {
			return nil, fmt.Errorf("find asset upload(uuid=%s): %w", wrapped.UUID, err)
		}
		if inp.ProjectID.Compare(au.Project()) != 0 {
			return nil, fmt.Errorf("unmatched project id(in=%s,db=%s)", inp.ProjectID, au.Project())
		}
		param = &gateway.IssueUploadAssetParam{
			UUID:            wrapped.UUID,
			Filename:        au.FileName(),
			ContentLength:   au.ContentLength(),
			ContentEncoding: au.ContentEncoding(),
			ContentType:     au.ContentType(),
			ExpiresAt:       au.ExpiresAt(),
			Cursor:          wrapped.Cursor,
		}
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, err
	}
	if !op.IsWritableWorkspace(prj.Workspace()) {
		return nil, interfaces.ErrOperationDenied
	}

	param.Workspace = prj.Workspace().String()
	param.Project = prj.ID().String()
	param.Public = prj.Accessibility() == nil || prj.Accessibility().Visibility() == project.VisibilityPublic

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: prj.Workspace(),
			CheckType:   gateway.PolicyCheckUploadAssetsSize,
			Value:       param.ContentLength,
		}
		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, rerror.NewE(i18n.T("policy check failed"))
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrAssetUploadSizeLimitExceeded
		}
	}

	uploadLink, err := i.gateways.File.IssueUploadAssetLink(ctx, *param)
	if errors.Is(err, gateway.ErrUnsupportedOperation) {
		return nil, rerror.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if inp.Cursor == "" {
		u := asset.NewUpload().
			UUID(param.UUID).
			Project(prj.ID()).
			FileName(param.Filename).
			ExpiresAt(param.ExpiresAt).
			ContentLength(uploadLink.ContentLength).
			ContentType(uploadLink.ContentType).
			ContentEncoding(uploadLink.ContentEncoding).
			Build()
		if err := i.repos.AssetUpload.Save(ctx, u); err != nil {
			return nil, err
		}
	}

	return &interfaces.AssetUpload{
		URL:             uploadLink.URL,
		UUID:            param.UUID,
		ContentType:     uploadLink.ContentType,
		ContentLength:   uploadLink.ContentLength,
		ContentEncoding: uploadLink.ContentEncoding,
		Next:            wrapUploadCursor(param.UUID, uploadLink.Next),
	}, nil
}

func (i *Asset) triggerDecompressEvent(ctx context.Context, a *asset.Asset, f *asset.File) error {
	if i.gateways.TaskRunner == nil {
		log.Infof("asset: decompression of asset %s was skipped because task runner is not configured", a.ID())
		return nil
	}

	taskPayload := task.DecompressAssetPayload{
		AssetID: a.ID().String(),
		Path:    f.RootPath(a.UUID()),
	}
	if err := i.gateways.TaskRunner.Run(ctx, taskPayload.Payload()); err != nil {
		return err
	}

	a.UpdateArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusInProgress))
	if err := i.repos.Asset.Save(ctx, a); err != nil {
		return err
	}

	return nil
}

func (i *Asset) Update(ctx context.Context, inp interfaces.UpdateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, inp.AssetID)
			if err != nil {
				return nil, err
			}

			if a != nil {
				a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
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

func (i *Asset) UpdateFiles(ctx context.Context, aid id.AssetID, s *asset.ArchiveExtractionStatus, op *usecase.Operator) (*asset.Asset, error) {
	if op.AcOperator.User == nil && op.Integration == nil && !op.Machine {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				if err == rerror.ErrNotFound {
					return nil, err
				}
				return nil, fmt.Errorf("failed to find an asset: %v", err)
			}

			if a != nil {
				a.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
			}

			if !op.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
			}

			if shouldSkipUpdate(a.ArchiveExtractionStatus(), s) {
				return a, nil
			}

			prj, err := i.repos.Project.FindByID(ctx, a.Project())
			if err != nil {
				return nil, fmt.Errorf("failed to find a project: %v", err)
			}

			srcfile, err := i.repos.AssetFile.FindByID(ctx, aid)
			if err != nil {
				return nil, fmt.Errorf("failed to find an asset file: %v", err)
			}

			files, err := i.gateways.File.GetAssetFiles(ctx, a.UUID())
			if err != nil {
				if err == gateway.ErrFileNotFound {
					return nil, err
				}
				return nil, fmt.Errorf("failed to get asset files: %v", err)
			}

			a.UpdateArchiveExtractionStatus(s)
			if previewType := detectPreviewType(files); previewType != nil {
				a.UpdatePreviewType(previewType)
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, fmt.Errorf("failed to save an asset: %v", err)
			}

			srcPath := srcfile.Path()
			assetFiles := lo.FilterMap(files, func(f gateway.FileEntry, _ int) (*asset.File, bool) {
				if srcPath == f.Name {
					return nil, false
				}
				return asset.NewFile().
					Name(path.Base(f.Name)).
					Path(f.Name).
					Size(uint64(f.Size)).
					ContentType(f.ContentType).
					GuessContentTypeIfEmpty().
					ContentEncoding(f.ContentEncoding).
					Build(), true
			})

			if err := i.repos.AssetFile.SaveFlat(ctx, a.ID(), srcfile, assetFiles); err != nil {
				return nil, fmt.Errorf("failed to save asset files: %v", err)
			}

			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.AssetDecompress,
				Object:    a,
				Operator:  op.Operator(),
			}); err != nil {
				return nil, fmt.Errorf("failed to create an event: %v", err)
			}

			return a, nil
		},
	)
}

func detectPreviewType(files []gateway.FileEntry) *asset.PreviewType {
	for _, entry := range files {
		if path.Base(entry.Name) == "tileset.json" {
			return lo.ToPtr(asset.PreviewTypeGeo3dTiles)
		}
		if path.Ext(entry.Name) == ".mvt" {
			return lo.ToPtr(asset.PreviewTypeGeoMvt)
		}
	}
	return nil
}

func shouldSkipUpdate(from, to *asset.ArchiveExtractionStatus) bool {
	if from.String() == asset.ArchiveExtractionStatusDone.String() {
		return true
	}
	return from.String() == to.String()
}

func (i *Asset) Delete(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return aId, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetID, error) {
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
				Project:   p,
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

// BatchDelete deletes assets in batch based on multiple asset IDs
func (i *Asset) BatchDelete(ctx context.Context, assetIDs id.AssetIDList, operator *usecase.Operator) (result []id.AssetID, err error) {

	if operator.AcOperator.User == nil && operator.Integration == nil {
		return assetIDs, interfaces.ErrInvalidOperator
	}

	if len(assetIDs) == 0 {
		return nil, interfaces.ErrEmptyIDsList
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetIDList, error) {
			assets, err := i.repos.Asset.FindByIDs(ctx, assetIDs)
			if err != nil {
				return assetIDs, err
			}

			if len(assetIDs) != len(assets) {
				return assetIDs, interfaces.ErrPartialNotFound
			}

			if assets == nil {
				return assetIDs, nil
			}

			UUIDList := lo.FilterMap(assets, func(a *asset.Asset, _ int) (string, bool) {
				if a == nil || a.UUID() == "" || a.FileName() == "" {
					return "", false
				}
				return a.UUID(), true
			})

			// deletes assets' files in
			err = i.gateways.File.DeleteAssets(ctx, UUIDList)
			if err != nil {
				return assetIDs, err
			}

			err = i.repos.Asset.BatchDelete(ctx, assetIDs)
			if err != nil {
				return assetIDs, err
			}

			return assetIDs, nil
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

func (i *Asset) RetryDecompression(ctx context.Context, id string) error {
	return i.gateways.TaskRunner.Retry(ctx, id)
}

func (i *Asset) ExportModelToAssets(ctx context.Context, inp interfaces.ExportModelToAssetsParam, op *usecase.Operator) (*asset.Asset, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	if inp.Model == nil {
		return nil, rerror.NewE(i18n.T("model is required"))
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, err
	}

	if !op.IsWritableWorkspace(prj.Workspace()) {
		return nil, interfaces.ErrOperationDenied
	}

	m, err := i.repos.Model.FindByID(ctx, inp.Model.ID())
	if err != nil {
		return nil, err
	}

	s, err := i.repos.Schema.FindByID(ctx, m.Schema())
	if err != nil {
		return nil, err
	}

	// Fetch items for the model with batching
	items, pi, err := i.fetchItemsInBatches(ctx, inp.Model.ID(), inp.Pagination)
	if err != nil {
		return nil, err
	}

	// Generate content based on format
	var content []byte
	var filename string
	var contentType string

	switch inp.Format {
	case interfaces.ExportFormatJSON:
		content, err = i.generateJSONContentWithPagination(inp.Model, items.Unwrap(), s, pi)
		filename = fmt.Sprintf("%s.json", inp.Model.Key().String())
		contentType = "application/json"
	case interfaces.ExportFormatGeoJSON:
		content, err = i.generateGeoJSONContent(s, items.Unwrap())
		filename = fmt.Sprintf("%s.geojson", inp.Model.Key().String())
		contentType = "application/geo+json"
	case interfaces.ExportFormatCSV:
		content, err = i.generateCSVContent(s, items.Unwrap())
		filename = fmt.Sprintf("%s.csv", inp.Model.Key().String())
		contentType = "text/csv"
	default:
		return nil, interfaces.ErrUnsupportedExportFormat
	}

	if err != nil {
		return nil, err
	}

	// Create file object
	f := &file.File{
		Name:        filename,
		Size:        int64(len(content)),
		ContentType: contentType,
		Content:     io.NopCloser(bytes.NewReader(content)),
	}

	// Create asset using existing Create method
	createParam := interfaces.CreateAssetParam{
		ProjectID:         inp.ProjectID,
		File:              f,
		SkipDecompression: true,
	}

	a, _, err := i.Create(ctx, createParam, op)
	if err != nil {
		return nil, err
	}

	return a, nil
}

func (i *Asset) generateJSONContentWithPagination(model *model.Model, items item.List, s *schema.Schema, pageInfo *usecasex.PageInfo) ([]byte, error) {

	// Convert items to readable format with schema field names
	itemsData := make([]map[string]any, 0, len(items))
	for _, item := range items {
		if item == nil {
			continue
		}

		itemData := make(map[string]any)

		// Extract field data using schema field names
		for _, field := range item.Fields() {
			if field == nil {
				continue
			}

			// Extract the actual field value
			var fieldValue any
			if field.Value() != nil {
				vv := field.Value().First()
				if vv != nil {
					fieldValue = vv.Interface()
				}
			}

			fieldName := ""
			if s != nil {
				if schemaField := s.Field(field.FieldID()); schemaField != nil {
					fieldName = schemaField.Name()
				}
			}

			if fieldName != "" {
				itemData[fieldName] = fieldValue
			}
		}

		itemsData = append(itemsData, itemData)
	}

	data := map[string]any{
		"model": map[string]any{
			"id":          model.ID().String(),
			"name":        model.Name(),
			"description": model.Description(),
			"key":         model.Key().String(),
		},
		"items": itemsData,
	}

	// Add pagination info if available
	if pageInfo != nil {
		data["pagination"] = map[string]any{
			"totalCount":  pageInfo.TotalCount,
			"hasNextPage": pageInfo.HasNextPage,
			"hasPrevPage": pageInfo.HasPreviousPage,
			"startCursor": pageInfo.StartCursor,
			"endCursor":   pageInfo.EndCursor,
		}
	}

	return json.MarshalIndent(data, "", "  ")
}

func (i *Asset) generateGeoJSONContent(s *schema.Schema, items item.List) ([]byte, error) {
	// Require geometry fields for GeoJSON export
	if s == nil || !s.HasGeometryFields() {
		return nil, rerror.NewE(i18n.T("no geometry field in this model"))
	}

	// Create GeoJSON FeatureCollection
	features := make([]map[string]any, 0, len(items))

	for _, itm := range items {
		if itm == nil {
			continue
		}

		// Extract geometry fields
		var geometry map[string]any
		var hasGeometry bool

		// Extract properties from non-geometry fields
		properties := make(map[string]any)

		// Iterate through schema fields to get proper field names and types
		for _, schemaField := range s.Fields() {
			if schemaField == nil {
				continue
			}

			// Get the corresponding item field
			itemField := itm.Field(schemaField.ID())
			if itemField == nil || itemField.Value() == nil {
				continue
			}

			// Handle geometry fields
			if schemaField.Type().IsGeometryFieldType() {
				if vv := itemField.Value().First(); vv != nil {
					if geoStr, ok := vv.ValueString(); ok && geoStr != "" {
						// Parse the GeoJSON string
						var geoJSON map[string]any
						if err := json.Unmarshal([]byte(geoStr), &geoJSON); err == nil {
							geometry = geoJSON
							hasGeometry = true
						}
					}
				}
				continue
			}

			// Handle non-geometry fields as properties
			if vv := itemField.Value().First(); vv != nil {
				fieldValue := vv.Interface()
				if fieldValue != nil {
					properties[schemaField.Name()] = fieldValue
				}
			}
		}

		// Only add feature if it has geometry
		if hasGeometry {
			feature := map[string]any{
				"type":       "Feature",
				"id":         itm.ID().String(),
				"geometry":   geometry,
				"properties": properties,
			}
			features = append(features, feature)
		}
	}

	// Create FeatureCollection
	featureCollection := map[string]any{
		"type":     "FeatureCollection",
		"features": features,
	}

	return json.MarshalIndent(featureCollection, "", "  ")
}

func (i *Asset) generateCSVContent(s *schema.Schema, items item.List) ([]byte, error) {
	if s == nil {
		return nil, rerror.NewE(i18n.T("schema is required for CSV export"))
	}

	// Create CSV buffer
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Build headers - include all non-geometry fields
	headers := []string{"id"}
	var nonGeoFields []*schema.Field

	// Add geometry coordinates if geometry fields exist
	hasGeometry := s.HasGeometryFields()
	if hasGeometry {
		headers = append(headers, "location_lat", "location_lng")
	}

	// Add all non-geometry field names as headers
	for _, field := range s.Fields() {
		if field != nil && !field.Type().IsGeometryFieldType() {
			headers = append(headers, field.Name())
			nonGeoFields = append(nonGeoFields, field)
		}
	}

	// Write header row
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	// Write data rows
	rowCount := 0
	for _, itm := range items {
		if itm == nil {
			continue
		}

		row := []string{itm.ID().String()}

		// Add geometry coordinates if geometry fields exist
		if hasGeometry {
			lat, lng := i.extractPointCoordinates(itm, s)
			row = append(row, lat, lng)
		}

		// Add non-geometry field values
		for _, field := range nonGeoFields {
			value := i.extractFieldValueAsString(itm, field)
			row = append(row, value)
		}

		if err := writer.Write(row); err != nil {
			return nil, err
		}
		rowCount++
	}

	// Flush the writer to ensure all data is written to the buffer
	writer.Flush()

	if err := writer.Error(); err != nil {
		return nil, err
	}

	result := buf.Bytes()

	return result, nil
}

// extractPointCoordinates extracts lat/lng from the first Point geometry field found
func (i *Asset) extractPointCoordinates(itm *item.Item, s *schema.Schema) (string, string) {
	for _, schemaField := range s.Fields() {
		if schemaField == nil || !schemaField.Type().IsGeometryFieldType() {
			continue
		}

		itemField := itm.Field(schemaField.ID())
		if itemField == nil || itemField.Value() == nil {
			continue
		}

		if vv := itemField.Value().First(); vv != nil {
			if geoStr, ok := vv.ValueString(); ok && geoStr != "" {
				// Parse the GeoJSON string
				var geoJSON map[string]any
				if err := json.Unmarshal([]byte(geoStr), &geoJSON); err == nil {
					if geoType, ok := geoJSON["type"].(string); ok && geoType == "Point" {
						if coords, ok := geoJSON["coordinates"].([]any); ok && len(coords) >= 2 {
							if lng, ok := coords[0].(float64); ok {
								if lat, ok := coords[1].(float64); ok {
									return fmt.Sprintf("%.10f", lat), fmt.Sprintf("%.10f", lng)
								}
							}
						}
					}
				}
			}
		}
	}
	return "", "" // Return empty if no Point geometry found
}

// extractFieldValueAsString extracts field value and converts it to string
func (i *Asset) extractFieldValueAsString(itm *item.Item, schemaField *schema.Field) string {
	if schemaField == nil {
		return ""
	}

	itemField := itm.Field(schemaField.ID())
	if itemField == nil || itemField.Value() == nil {
		return ""
	}

	if vv := itemField.Value().First(); vv != nil {
		fieldValue := vv.Interface()
		if fieldValue == nil {
			return ""
		}

		// Convert to string based on type
		switch v := fieldValue.(type) {
		case string:
			return v
		case int, int32, int64:
			return fmt.Sprintf("%d", v)
		case float32, float64:
			return fmt.Sprintf("%.10f", v)
		case bool:
			return fmt.Sprintf("%t", v)
		default:
			return fmt.Sprintf("%v", v)
		}
	}

	return ""
}

// fetchItemsInBatches fetches items in batches using configurable batch size (default 200) with goroutines for better performance
func (i *Asset) fetchItemsInBatches(ctx context.Context, modelID id.ModelID, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	batchSize := i.config.ExportModelToAssetBatchSize
	if batchSize <= 0 {
		batchSize = 200 // fallback to default
	}

	// If pagination is provided and small, fetch directly
	if pagination != nil && pagination.Cursor != nil && pagination.Cursor.First != nil && *pagination.Cursor.First <= int64(batchSize) {
		return i.repos.Item.FindByModel(ctx, modelID, version.Public.Ref(), nil, pagination)
	}

	// For large requests or no pagination, use sequential batching with goroutines
	var allItems item.VersionedList
	var finalPageInfo *usecasex.PageInfo
	var cursor *string

	// Calculate total items to fetch
	totalLimit := int64(2000) // Default max
	if pagination != nil && pagination.Cursor != nil && pagination.Cursor.First != nil {
		totalLimit = *pagination.Cursor.First
	}

	// Handle initial cursor if provided
	if pagination != nil && pagination.Cursor != nil && pagination.Cursor.After != nil {
		cursor = (*string)(pagination.Cursor.After)
	}

	// Channel for batch results
	type batchResult struct {
		items    item.VersionedList
		pageInfo *usecasex.PageInfo
		err      error
	}

	// Process batches sequentially but with goroutine for each batch
	remaining := totalLimit
	for remaining > 0 {
		currentBatchSize := int64(batchSize)
		if remaining < currentBatchSize {
			currentBatchSize = remaining
		}

		// Create pagination for this batch
		batchPagination := &usecasex.Pagination{
			Cursor: &usecasex.CursorPagination{
				First: &currentBatchSize,
			},
		}
		if cursor != nil {
			batchPagination.Cursor.After = (*usecasex.Cursor)(cursor)
		}

		// Execute batch directly
		items, pi, err := i.repos.Item.FindByModel(ctx, modelID, version.Public.Ref(), nil, batchPagination)
		result := batchResult{
			items:    items,
			pageInfo: pi,
			err:      err,
		}

		if result.err != nil {
			return nil, nil, result.err
		}

		// Append results
		allItems = append(allItems, result.items...)
		finalPageInfo = result.pageInfo

		// Update cursor for next batch
		if result.pageInfo != nil && result.pageInfo.EndCursor != nil {
			cursor = (*string)(result.pageInfo.EndCursor)
		}

		// If this batch returned fewer items than requested, we've reached the end
		if len(result.items) < int(currentBatchSize) || (result.pageInfo != nil && !result.pageInfo.HasNextPage) {
			break
		}

		remaining -= int64(len(result.items))
	}

	return allItems, finalPageInfo, nil
}
