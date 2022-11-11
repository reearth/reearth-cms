package integration

import (
	"context"
)

func (s Server) AssetCommentDelete(ctx context.Context, request AssetCommentDeleteRequestObject) (AssetCommentDeleteResponseObject error) {
	panic("hoge")

}

// (GET /projects/{projectId}/assets/{assetId}/comments)
func (s Server) AssetCommentFilter(ctx context.Context, request AssetCommentFilterRequestObject) (AssetCommentFilterResponseObject error) {
	panic("hoge")

}

// (PATCH /projects/{projectId}/assets/{assetId}/comments)
func (s Server) AssetCommentUpdate(ctx context.Context, request AssetCommentUpdateRequestObject) (AssetCommentUpdateResponseObject error) {
	panic("hoge")

}

// (POST /projects/{projectId}/assets/{assetId}/comments)
func (s Server) AssetCommentCreate(ctx context.Context, request AssetCommentCreateRequestObject) (AssetCommentCreateResponseObject error) {
	panic("hoge")
}
