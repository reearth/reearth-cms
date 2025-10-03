package interactor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
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
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/types"
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
	ignoreEvent bool
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
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

func (i *Asset) Export(ctx context.Context, params interfaces.ExportAssetsParams, w io.Writer, _ *usecase.Operator) error {

	_, err := w.Write([]byte(`{"results":[`))
	if err != nil {
		return err
	}

	j := json.NewEncoder(w)

	batchConfig := defaultBatchConfig()

	pagination := usecasex.CursorPagination{First: &batchConfig.BatchSize}.Wrap()
	if params.Filter.Pagination != nil {
		pagination = params.Filter.Pagination
	}

	totalProcessed := 0
	pageInfo := &usecasex.PageInfo{}
	for {
		assets, pi, err := i.repos.Asset.Search(ctx, params.ProjectID, repo.AssetFilter{
			Pagination:   pagination,
			Sort:         params.Filter.Sort,
			Keyword:      params.Filter.Keyword,
			ContentTypes: params.Filter.ContentTypes,
		})
		if err != nil {
			return rerror.ErrInternalBy(err)
		}
		pageInfo = pi

		assets.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
		if len(assets) == 0 {
			break
		}

		var fileMap map[id.AssetID]*asset.File
		if params.IncludeFiles {
			fileMap, err = i.FindFilesByIDs(ctx, assets.IDs(), nil)
			if err != nil {
				return err
			}
		}

		res := lo.Map(assets, func(a *asset.Asset, _ int) types.Asset {
			var files []string
			f := fileMap[a.ID()]

			if params.IncludeFiles {
				ai := a.AccessInfo()
				if ai.Url != "" {
					base, _ := url.Parse(ai.Url)
					base.Path = path.Dir(base.Path)

					files = lo.Map(f.FilePaths(), func(p string, _ int) string {
						b := *base
						b.Path = path.Join(b.Path, p)
						return b.String()
					})
				}
			}

			return types.Asset{
				Type:        "asset",
				ID:          a.ID().String(),
				URL:         a.AccessInfo().Url,
				ContentType: f.ContentType(),
				Files:       files,
			}
		})

		// Write assets as JSON
		for _, a := range res {
			if err := j.Encode(a); err != nil {
				return err
			}
		}

		totalProcessed += len(assets)

		// Check if we have more pages
		if pageInfo == nil || !pageInfo.HasNextPage {
			break
		}

		// Update pagination for next batch
		pagination.Cursor.After = pageInfo.EndCursor

		// if an exact page is requested, stop after one batch
		if params.Filter.Pagination != nil {
			break
		}
	}

	_, err = w.Write([]byte("],"))
	if err != nil {
		return err
	}

	props := map[string]any{
		"totalCount": pageInfo.TotalCount,
	}

	if params.Filter.Pagination != nil {
		props["hasMore"] = pageInfo.HasNextPage
		if params.Filter.Pagination.Cursor != nil {
			props["nextCursor"] = pageInfo.EndCursor
			// props["limit"] = req.Options.Pagination
		}
		if params.Filter.Pagination.Offset != nil {
			props["page"] = (params.Filter.Pagination.Offset.Offset / params.Filter.Pagination.Offset.Limit) + 1
			props["offset"] = params.Filter.Pagination.Offset.Offset
			props["limit"] = params.Filter.Pagination.Offset.Limit
		}
	}

	ii := 0
	for key, value := range props {
		// Marshal the value
		valueBytes, err := json.Marshal(value)
		if err != nil {
			return err
		}

		// Write key-value pair
		if ii > 0 {
			if _, err := w.Write([]byte(",")); err != nil {
				return err
			}
		}

		entry := fmt.Sprintf(`"%s":%s`, key, valueBytes)
		if _, err := w.Write([]byte(entry)); err != nil {
			return err
		}
		ii++
	}

	_, err = w.Write([]byte(`}`))
	return err
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

		visibility := project.VisibilityPublic
		if prj.Accessibility() != nil && prj.Accessibility().Visibility() != "" {
			visibility = prj.Accessibility().Visibility()
		}

		var checkType gateway.PolicyCheckType
		if visibility == project.VisibilityPublic {
			checkType = gateway.PolicyCheckPublicDataTransferUpload
		} else {
			checkType = gateway.PolicyCheckPrivateDataTransferUpload
		}

		if i.gateways != nil && i.gateways.PolicyChecker != nil {
			policyReq := gateway.PolicyCheckRequest{
				WorkspaceID: prj.Workspace(),
				CheckType:   checkType,
				Value:       file.Size,
			}
			policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
			if err != nil {
				return nil, nil, rerror.NewE(i18n.T("policy check failed"))
			}
			if !policyResp.Allowed {
				return nil, nil, interfaces.ErrDataTransferUploadSizeLimitExceeded
			}

			policyReq.CheckType = gateway.PolicyCheckUploadAssetsSize

			policyResp, err = i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
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

	visibility := project.VisibilityPublic
	if prj.Accessibility() != nil && prj.Accessibility().Visibility() != "" {
		visibility = prj.Accessibility().Visibility()
	}

	var checkType gateway.PolicyCheckType
	if visibility == project.VisibilityPublic {
		checkType = gateway.PolicyCheckPublicDataTransferUpload
	} else {
		checkType = gateway.PolicyCheckPrivateDataTransferUpload
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: prj.Workspace(),
			CheckType:   checkType,
			Value:       param.ContentLength,
		}
		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, rerror.NewE(i18n.T("policy check failed"))
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrDataTransferUploadSizeLimitExceeded
		}

		policyReq.CheckType = gateway.PolicyCheckUploadAssetsSize

		policyResp, err = i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
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
