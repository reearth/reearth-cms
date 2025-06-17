package internalapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type server struct {
	pb.UnimplementedReEarthCMSServer
}

func NewServer() pb.ReEarthCMSServer {
	return &server{}
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.ProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}

	// todo accessibility
	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  wId,
		Name:         &req.Name,
		Description:  req.Description,
		License:      req.License,
		Readme:       req.Readme,
		Alias:        &req.Alias,
		RequestRoles: []workspace.Role{},
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
		ID:           pId,
		Name:         &req.Name,
		Description:  req.Description,
		License:      req.License,
		Readme:       req.Readme,
		Alias:        &req.Alias,
		RequestRoles: []workspace.Role{},
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
	// Validate required fields
	if req.ProjectId == "" {
		return nil, status.Error(codes.InvalidArgument, "project_id is required")
	}

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

	//var rc io.ReadWriteCloser

	rc := NewBufferRW(nil)

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
			_, err = rc.Seek(-1, io.SeekCurrent)
			if err != nil {
				return nil, err
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

	_, err = rc.Seek(0, io.SeekStart)
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

// BufferRW implements io.Reader, io.Writer, io.Seeker, io.Closer
type BufferRW struct {
	buffer *bytes.Buffer
	pos    int64
	closed bool
}

// NewBufferRW creates a new BufferRW
func NewBufferRW(data []byte) *BufferRW {
	return &BufferRW{
		buffer: bytes.NewBuffer(data),
		pos:    0,
		closed: false,
	}
}

// Read implements io.Reader
func (brw *BufferRW) Read(p []byte) (n int, err error) {
	if brw.closed {
		return 0, errors.New("read from closed buffer")
	}
	data := brw.buffer.Bytes()
	if brw.pos >= int64(len(data)) {
		return 0, io.EOF
	}
	n = copy(p, data[brw.pos:])
	brw.pos += int64(n)
	return n, nil
}

// Write implements io.Writer
func (brw *BufferRW) Write(p []byte) (n int, err error) {
	if brw.closed {
		return 0, errors.New("write to closed buffer")
	}
	buf := brw.buffer.Bytes()
	if int(brw.pos) > len(buf) {
		padding := make([]byte, int(brw.pos)-len(buf))
		brw.buffer.Write(padding)
		buf = brw.buffer.Bytes()
	}

	if int(brw.pos)+len(p) > len(buf) {
		buf = append(buf[:brw.pos], p...)
	} else {
		copy(buf[brw.pos:], p)
	}
	brw.buffer = bytes.NewBuffer(buf)
	brw.pos += int64(len(p))
	return len(p), nil
}

// Seek implements io.Seeker
func (brw *BufferRW) Seek(offset int64, whence int) (int64, error) {
	var newPos int64

	switch whence {
	case io.SeekStart:
		newPos = offset
	case io.SeekCurrent:
		newPos = brw.pos + offset
	case io.SeekEnd:
		newPos = int64(len(brw.buffer.Bytes())) + offset
	default:
		return 0, errors.New("invalid seek whence")
	}

	if newPos < 0 {
		return 0, errors.New("negative position")
	}

	brw.pos = newPos
	return newPos, nil
}

// Close implements io.Closer
func (brw *BufferRW) Close() error {
	brw.closed = true
	return nil
}
