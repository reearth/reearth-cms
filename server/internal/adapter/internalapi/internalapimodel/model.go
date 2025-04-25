package internalapimodel

import (
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToModel(p *model.Model) *pb.Model {
	if p == nil {
		return nil
	}

	return &pb.Model{
		Id:          p.ID().String(),
		Name:        p.Name(),
		Description: p.Description(),
		ProjectId:   p.Project().String(),
		CreatedAt:   timestamppb.New(p.ID().Timestamp()),
		UpdatedAt:   timestamppb.New(p.UpdatedAt()),
	}
}
