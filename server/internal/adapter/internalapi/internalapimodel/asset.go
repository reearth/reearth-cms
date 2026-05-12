package internalapimodel

import (
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToAsset(a *asset.Asset) *pb.Asset {
	if a == nil {
		return nil
	}
	return &pb.Asset{
		Id:                      a.ID().String(),
		Uuid:                    a.UUID(),
		ProjectId:               a.Project().String(),
		Size:                    a.Size(),
		Filename:                a.FileName(),
		PreviewType:             a.PreviewType().StringRef(),
		Url:                     a.AccessInfo().Url,
		ArchiveExtractionStatus: a.ArchiveExtractionStatus().StringRef(),
		Public:                  a.AccessInfo().Public,
		CreatedAt:               timestamppb.New(a.CreatedAt()),
	}
}
