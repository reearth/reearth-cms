package internalapi

import (
	"bytes"
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/internalapi/internalapimodel"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type server struct {
	pb.UnimplementedReEarthCMSServer
	webBaseUrl  *url.URL
	pApiBaseUrl *url.URL
}

func NewServer(webHost, serverHost string) pb.ReEarthCMSServer {
	return &server{
		webBaseUrl:  lo.Must(url.Parse(webHost)),
		pApiBaseUrl: lo.Must(url.Parse(serverHost)).JoinPath("api", "p"),
	}
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.ProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}

	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:   wId,
		Name:          &req.Name,
		Description:   req.Description,
		License:       req.License,
		Readme:        req.Readme,
		Alias:         &req.Alias,
		RequestRoles:  []workspace.Role{},
		Accessibility: internalapimodel.ProjectAccessibilityFromPB(&req.Visibility),
	}, op)
	if err != nil {
		return nil, err
	}
	return &pb.ProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) UpdateProject(ctx context.Context, req *pb.UpdateProjectRequest) (*pb.ProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	// todo accessibility
	p, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:            pId,
		Name:          req.Name,
		Description:   req.Description,
		License:       req.License,
		Readme:        req.Readme,
		Alias:         req.Alias,
		RequestRoles:  []workspace.Role{},
		Accessibility: internalapimodel.ProjectAccessibilityFromPB(req.Visibility),
	}, op)
	if err != nil {
		return nil, err
	}
	return &pb.ProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) DeleteProject(ctx context.Context, req *pb.DeleteProjectRequest) (*pb.DeleteProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	err = uc.Project.Delete(ctx, pId, op)
	if err != nil {
		return nil, err
	}

	return &pb.DeleteProjectResponse{
		ProjectId: req.ProjectId,
	}, nil
}

func (s server) CheckAliasAvailability(ctx context.Context, req *pb.AliasAvailabilityRequest) (*pb.AliasAvailabilityResponse, error) {
	uc := adapter.Usecases(ctx)

	if req.Alias == "" {
		return nil, status.Error(codes.InvalidArgument, "alias is required")
	}

	ok, err := uc.Project.CheckAlias(ctx, req.Alias)
	if err != nil {
		return nil, err
	}

	return &pb.AliasAvailabilityResponse{
		Available: ok,
	}, nil
}

func (s server) GetProject(ctx context.Context, req *pb.ProjectRequest) (*pb.ProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, project.IDOrAlias(req.ProjectIdOrAlias), nil)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, rerror.ErrNotFound
	}

	if p.Accessibility().Visibility() == project.VisibilityPrivate && (op == nil || !op.IsReadableProject(p.ID())) {
		return nil, rerror.ErrNotFound
	}

	return &pb.ProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) ListProjects(ctx context.Context, req *pb.ListProjectsRequest) (*pb.ListProjectsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	f := interfaces.ProjectFilter{
		Keyword:    req.Keyword,
		Topics:     req.Topics,
		Sort:       internalapimodel.SortFromPB(req.SortInfo),
		Pagination: internalapimodel.PaginationFromPB(req.PageInfo),
	}
	if req.PublicOnly {
		f.Visibility = lo.ToPtr(project.VisibilityPublic)
	}

	wIds := lo.FilterMap(req.WorkspaceIds, func(wid string, _ int) (accountdomain.WorkspaceID, bool) {
		wId, err := accountdomain.WorkspaceIDFrom(wid)
		if err != nil {
			return accountdomain.WorkspaceID{}, false
		}
		return wId, true
	})

	f.WorkspaceIds = lo.ToPtr(accountdomain.WorkspaceIDList(wIds))

	p, pi, err := uc.Project.Search(ctx, f, op)
	if err != nil {
		return nil, err
	}

	res := lo.Map(p, func(p *project.Project, _ int) *pb.Project {
		return internalapimodel.ToProject(p)
	})
	return &pb.ListProjectsResponse{
		Projects:   res,
		TotalCount: pi.TotalCount,

		PageInfo: internalapimodel.ToPageInfo(req.PageInfo),
	}, nil
}

func (s server) GetAsset(ctx context.Context, req *pb.AssetRequest) (*pb.AssetResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	aId, err := asset.IDFrom(req.AssetId)
	if err != nil {
		return nil, err
	}

	a, err := uc.Asset.FindByID(ctx, aId, op)
	if err != nil {
		return nil, err
	}

	if a == nil {
		return nil, rerror.ErrNotFound
	}

	return &pb.AssetResponse{
		Asset: internalapimodel.ToAsset(a),
	}, nil
}

func (s server) ListAssets(ctx context.Context, req *pb.ListAssetsRequest) (*pb.ListAssetsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	if req.ProjectId == "" {
		return nil, status.Error(codes.InvalidArgument, "project_id is required")
	}

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	p, err := uc.Project.FindByIDOrAlias(ctx, project.IDOrAlias(pId.String()), op)
	if err != nil {
		return nil, err
	}

	if p == nil {
		return nil, rerror.ErrNotFound
	}

	f := interfaces.AssetFilter{
		Sort:       internalapimodel.SortFromPB(req.SortInfo),
		Pagination: internalapimodel.PaginationFromPB(req.PageInfo),
	}
	assets, pi, err := uc.Asset.Search(ctx, pId, f, op)
	if err != nil {
		return nil, err
	}

	res := lo.Map(assets, func(a *asset.Asset, _ int) *pb.Asset {
		return internalapimodel.ToAsset(a)
	})

	return &pb.ListAssetsResponse{
		Assets:     res,
		TotalCount: pi.TotalCount,

		PageInfo: internalapimodel.ToPageInfo(req.PageInfo),
	}, nil
}

func (s server) GetModel(ctx context.Context, req *pb.ModelRequest) (*pb.ModelResponse, error) {
	op, uc, ar := adapter.Operator(ctx), adapter.Usecases(ctx), adapter.AcRepos(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, project.IDOrAlias(req.ProjectIdOrAlias), nil)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, rerror.ErrNotFound
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), model.IDOrKey(req.ModelIdOrAlias), op)
	if err != nil {
		return nil, err
	}
	if m == nil {
		return nil, rerror.ErrNotFound
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	w, err := ar.Workspace.FindByIDOrAlias(ctx, accountdomain.WorkspaceIDOrAlias(p.Workspace().String()))
	if err != nil {
		return nil, err
	}
	if w == nil {
		return nil, rerror.ErrNotFound
	}

	webProjectUrl := s.webBaseUrl.JoinPath("workspace", p.Workspace().String(), "project", p.ID().String())
	pApiProjectUrl := s.pApiBaseUrl.JoinPath(w.Alias(), p.Alias())

	return &pb.ModelResponse{
		Model: internalapimodel.ToModel(m, sp, webProjectUrl, pApiProjectUrl),
	}, nil
}

func (s server) ListModels(ctx context.Context, req *pb.ListModelsRequest) (*pb.ListModelsResponse, error) {
	op, uc, ar := adapter.Operator(ctx), adapter.Usecases(ctx), adapter.AcRepos(ctx)
	// Validate required fields
	if req.ProjectId == "" {
		return nil, status.Error(codes.InvalidArgument, "project_id is required")
	}

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}
	p, err := uc.Project.FindByIDOrAlias(ctx, project.IDOrAlias(pId.String()), op)
	if err != nil {
		return nil, err
	}

	ml, pi, err := uc.Model.FindByProject(ctx, pId, internalapimodel.PaginationFromPB(req.PageInfo), op)
	if err != nil {
		return nil, err
	}

	w, err := ar.Workspace.FindByIDOrAlias(ctx, accountdomain.WorkspaceIDOrAlias(p.Workspace().String()))
	if err != nil {
		return nil, err
	}
	if w == nil {
		return nil, rerror.ErrNotFound
	}

	webProjectUrl := s.webBaseUrl.JoinPath("workspace", p.Workspace().String(), "project", pId.String())
	pApiProjectUrl := s.pApiBaseUrl.JoinPath(w.Alias(), p.Alias())

	res := lo.FilterMap(ml, func(m *model.Model, _ int) (*pb.Model, bool) {
		sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
		if err != nil {
			return nil, false // If schema not found, skip this model
		}
		return internalapimodel.ToModel(m, sp, webProjectUrl, pApiProjectUrl), true
	})
	return &pb.ListModelsResponse{
		Models:     res,
		TotalCount: pi.TotalCount,

		PageInfo: internalapimodel.ToPageInfo(req.PageInfo),
	}, nil
}

func (s server) ListItems(ctx context.Context, req *pb.ListItemsRequest) (*pb.ListItemsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	if req.ModelId == "" {
		return nil, status.Error(codes.InvalidArgument, "model_id is required")
	}

	mId, err := model.IDFrom(req.ModelId)
	if err != nil {
		return nil, err
	}

	sp, err := uc.Schema.FindByModel(ctx, mId, op)
	if err != nil {
		return nil, err
	}

	q := item.NewQuery(sp.Schema().Project(), mId, sp.Schema().ID().Ref(), req.GetKeyword(), version.Public.Ref())
	if req.SortInfo != nil {
		q = q.WithSort(internalapimodel.SortToViewSort(req.SortInfo))
	}

	items, pi, err := uc.Item.Search(ctx, *sp, q, internalapimodel.PaginationFromPB(req.PageInfo), op)
	if err != nil {
		return nil, err
	}

	res := lo.Map(items, func(i item.Versioned, _ int) *pb.Item {
		return internalapimodel.ToItem(i.Value(), sp)
	})

	return &pb.ListItemsResponse{
		Items:      res,
		TotalCount: pi.TotalCount,

		PageInfo: internalapimodel.ToPageInfo(req.PageInfo),
	}, nil
}

//nolint:staticcheck // to be removed after a confirmation from dashboard team
func (s server) GetModelGeoJSONExportURL(ctx context.Context, req *pb.ExportRequest) (*pb.ExportURLResponse, error) {
	op, uc, g := adapter.Operator(ctx), adapter.Usecases(ctx), adapter.Gateways(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}
	mId, err := model.IDFrom(req.ModelId)
	if err != nil {
		return nil, err
	}

	m, err := uc.Model.FindByID(ctx, mId, op)
	if err != nil {
		return nil, err
	}
	if m.Project() != pId {
		return nil, rerror.ErrNotFound
	}

	sp, err := uc.Schema.FindByModel(ctx, mId, op)
	if err != nil {
		return nil, err
	}

	w := bytes.NewBuffer(nil)

	err = uc.Item.Export(ctx, interfaces.ExportItemParams{
		Format:        exporters.FormatGeoJSON,
		ModelID:       mId,
		SchemaPackage: *sp,
		Options: exporters.ExportOptions{
			PublicOnly: true,
		},
	}, w, op)
	if err != nil {
		return nil, err
	}

	// upload result as file
	_, err = g.File.Upload(ctx, &file.File{
		Content:         io.NopCloser(w),
		Name:            m.ID().String() + ".geojson",
		Size:            0,
		ContentType:     "application/geo+json",
		ContentEncoding: "",
	}, m.ID().String()+".geojson")
	if err != nil {
		return nil, err
	}

	return &pb.ExportURLResponse{
		Url: lo.Must(url.JoinPath(g.File.GetBaseURL(), m.ID().String()+".geojson")),
	}, nil
}

func (s server) GetModelExportURL(ctx context.Context, req *pb.ModelExportRequest) (*pb.ExportURLResponse, error) {
	op, uc, g := adapter.Operator(ctx), adapter.Usecases(ctx), adapter.Gateways(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}
	mId, err := model.IDFrom(req.ModelId)
	if err != nil {
		return nil, err
	}

	m, err := uc.Model.FindByID(ctx, mId, op)
	if err != nil {
		return nil, err
	}
	if m.Project() != pId {
		return nil, rerror.ErrNotFound
	}

	sp, err := uc.Schema.FindByModel(ctx, mId, op)
	if err != nil {
		return nil, err
	}

	w := bytes.NewBuffer(nil)

	format := exporters.FormatJSON
	if req.ExportType == pb.ModelExportRequest_GEOJSON {
		format = exporters.FormatGeoJSON
	}

	err = uc.Item.Export(ctx, interfaces.ExportItemParams{
		Format:        format,
		ModelID:       mId,
		SchemaPackage: *sp,
		Options: exporters.ExportOptions{
			PublicOnly: true,
		},
	}, w, op)
	if err != nil {
		return nil, err
	}

	ext := ".json"
	ct := "application/json"
	if format == exporters.FormatGeoJSON {
		ext = ".geojson"
		ct = "application/geo+json"
	}

	// upload result as file
	_, err = g.File.Upload(ctx, &file.File{
		Content:         io.NopCloser(w),
		Name:            m.ID().String() + ext,
		Size:            int64(w.Len()),
		ContentType:     ct,
		ContentEncoding: "",
	}, m.ID().String()+ext)
	if err != nil {
		return nil, err
	}

	return &pb.ExportURLResponse{
		Url: lo.Must(url.JoinPath(g.File.GetBaseURL(), m.ID().String()+ext)),
	}, nil
}
