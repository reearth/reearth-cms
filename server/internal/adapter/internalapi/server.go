package internalapi

import (
	"context"
	"encoding/json"
	"io"
	"path"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/internalapi/internalapimodel"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type server struct {
	pb.UnimplementedReEarthCMSServer
}

func NewServer() pb.ReEarthCMSServer {
	return &server{}
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.CreateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}
	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  wId,
		Name:         &req.Name,
		Description:  &req.Description,
		Alias:        &req.Alias,
		RequestRoles: []workspace.Role{},
	}, op)
	if err != nil {
		return nil, err
	}
	return &pb.CreateProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) ListProjects(ctx context.Context, req *pb.ListProjectsRequest) (*pb.ListProjectsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}
	p, _, err := uc.Project.FindByWorkspace(ctx, wId, usecasex.CursorPagination{
		After: nil,
		First: lo.ToPtr(int64(100)),
	}.Wrap(), op)
	if err != nil {
		return nil, err
	}
	res := lo.Map(p, func(p *project.Project, _ int) *pb.Project {
		return internalapimodel.ToProject(p)
	})
	return &pb.ListProjectsResponse{
		Projects:   res,
		TotalCount: int32(len(res)),
	}, nil
}

func (s server) ListModels(ctx context.Context, req *pb.ListModelsRequest) (*pb.ListModelsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	p, _, err := uc.Model.FindByProject(ctx, pId, usecasex.CursorPagination{
		After: nil,
		First: lo.ToPtr(int64(100)),
	}.Wrap(), op)
	if err != nil {
		return nil, err
	}

	res := lo.Map(p, func(p *model.Model, _ int) *pb.Model {
		return internalapimodel.ToModel(p)
	})
	return &pb.ListModelsResponse{
		Models:     res,
		TotalCount: int32(len(res)),
	}, nil
}

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

	var rc io.ReadWriteCloser

	// Write the beginning of the FeatureCollection
	if _, err := rc.Write([]byte(`{"type":"FeatureCollection","features":[`)); err != nil {
		return nil, err
	}

	isFirstFeature := true
	page := 0
	encoder := json.NewEncoder(rc)
	encoder.SetEscapeHTML(false)

	for {
		// Get the next page of features
		page++
		res, err := uc.Item.ItemsAsGeoJSON(ctx, sp, &page, lo.ToPtr(100), op)
		if err != nil {
			return nil, err
		}

		// Process each feature in the page
		for _, feature := range *res.FeatureCollections.Features {
			// Add comma between features (except before the first one)
			if !isFirstFeature {
				if _, err := rc.Write([]byte(",")); err != nil {
					return nil, err
				}
			} else {
				isFirstFeature = false
			}

			// Write the feature without the enclosing bracket
			if err := encoder.Encode(feature); err != nil {
				return nil, err
			}

			// The encoder adds a newline character, so we need to backtrack
			// by seeking -1 or using a different approach for certain writers
			if seeker, ok := rc.(io.Seeker); ok {
				_, err = seeker.Seek(-1, io.SeekCurrent)
				if err != nil {
					return nil, err
				}
			}
		}

		// Check if there are more pages
		if !res.PageInfo.HasNextPage {
			break
		}
	}

	// Close the FeatureCollection
	_, err = rc.Write([]byte("]}\n"))
	if err != nil {
		return nil, err
	}

	// upload result as file
	_, err = g.File.Upload(ctx, &file.File{
		Content:         rc,
		Name:            m.ID().String() + ".geojson",
		Size:            0,
		ContentType:     "",
		ContentEncoding: "",
	}, m.ID().String()+".geojson")
	if err != nil {
		return nil, err
	}

	return &pb.ExportURLResponse{
		Url: path.Join(g.File.GetBaseURL(), m.ID().String()+".geojson"),
	}, nil
}
