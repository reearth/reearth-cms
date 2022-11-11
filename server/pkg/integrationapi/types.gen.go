// Package integrationapi provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/deepmap/oapi-codegen version v1.12.2 DO NOT EDIT.
package integrationapi

import (
	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

const (
	BearerAuthScopes = "bearerAuth.Scopes"
)

// Defines values for AssetPreviewType.
const (
	Geo     AssetPreviewType = "geo"
	Geo3d   AssetPreviewType = "geo3d"
	Image   AssetPreviewType = "image"
	Model3d AssetPreviewType = "model3d"
	Unknown AssetPreviewType = "unknown"
)

// Defines values for FieldType.
const (
	FieldTypeAsset     FieldType = "asset"
	FieldTypeBool      FieldType = "bool"
	FieldTypeDate      FieldType = "date"
	FieldTypeInteger   FieldType = "integer"
	FieldTypeMarkdown  FieldType = "markdown"
	FieldTypeReference FieldType = "reference"
	FieldTypeRichText  FieldType = "richText"
	FieldTypeSelect    FieldType = "select"
	FieldTypeTag       FieldType = "tag"
	FieldTypeText      FieldType = "text"
	FieldTypeTextArea  FieldType = "textArea"
	FieldTypeUrl       FieldType = "url"
)

// Defines values for RefOrVerRef.
const (
	RefOrVerRefLatest RefOrVerRef = "latest"
	RefOrVerRefPublic RefOrVerRef = "public"
)

// Defines values for RefParam.
const (
	RefParamLatest RefParam = "latest"
	RefParamPublic RefParam = "public"
)

// Defines values for SortDirParam.
const (
	SortDirParamAsc  SortDirParam = "asc"
	SortDirParamDesc SortDirParam = "desc"
)

// Defines values for SortParam.
const (
	SortParamCreatedAt SortParam = "createdAt"
	SortParamUpdatedAt SortParam = "updatedAt"
)

// Defines values for ItemGetParamsRef.
const (
	ItemGetParamsRefLatest ItemGetParamsRef = "latest"
	ItemGetParamsRefPublic ItemGetParamsRef = "public"
)

// Defines values for ItemUpdateParamsRef.
const (
	ItemUpdateParamsRefLatest ItemUpdateParamsRef = "latest"
	ItemUpdateParamsRefPublic ItemUpdateParamsRef = "public"
)

// Defines values for ItemFilterParamsSort.
const (
	ItemFilterParamsSortCreatedAt ItemFilterParamsSort = "createdAt"
	ItemFilterParamsSortUpdatedAt ItemFilterParamsSort = "updatedAt"
)

// Defines values for ItemFilterParamsDir.
const (
	ItemFilterParamsDirAsc  ItemFilterParamsDir = "asc"
	ItemFilterParamsDirDesc ItemFilterParamsDir = "desc"
)

// Defines values for ItemFilterParamsRef.
const (
	Latest ItemFilterParamsRef = "latest"
	Public ItemFilterParamsRef = "public"
)

// Defines values for AssetFilterParamsSort.
const (
	CreatedAt AssetFilterParamsSort = "createdAt"
	UpdatedAt AssetFilterParamsSort = "updatedAt"
)

// Defines values for AssetFilterParamsDir.
const (
	Asc  AssetFilterParamsDir = "asc"
	Desc AssetFilterParamsDir = "desc"
)

// Asset defines model for asset.
type Asset struct {
	ContentType *string             `json:"contentType,omitempty"`
	CreatedAt   *openapi_types.Date `json:"createdAt,omitempty"`
	File        *File               `json:"file,omitempty"`
	Id          *id.AssetID         `json:"id,omitempty"`
	Name        *string             `json:"name,omitempty"`
	PreviewType *AssetPreviewType   `json:"previewType,omitempty"`
	ProjectId   *id.ProjectID       `json:"projectId,omitempty"`
	TotalSize   *float32            `json:"totalSize,omitempty"`
	UpdatedAt   *openapi_types.Date `json:"updatedAt,omitempty"`
	Url         *string             `json:"url,omitempty"`
}

// AssetPreviewType defines model for Asset.PreviewType.
type AssetPreviewType string

// Comment defines model for comment.
type Comment struct {
	AuthorId  *id.UserID          `json:"authorId,omitempty"`
	Content   *string             `json:"content,omitempty"`
	CreatedAt *openapi_types.Date `json:"createdAt,omitempty"`
	Id        *id.CommentID       `json:"id,omitempty"`
}

// Field defines model for field.
type Field struct {
	Id    *id.FieldID  `json:"id,omitempty"`
	Type  *FieldType   `json:"type,omitempty"`
	Value *interface{} `json:"value,omitempty"`
}

// FieldType defines model for Field.Type.
type FieldType string

// File defines model for file.
type File struct {
	Children    *[]File  `json:"children,omitempty"`
	ContentType *string  `json:"contentType,omitempty"`
	Name        *string  `json:"name,omitempty"`
	Path        *string  `json:"path,omitempty"`
	Size        *float32 `json:"size,omitempty"`
}

// Item defines model for item.
type Item struct {
	Archived  *bool                 `json:"archived,omitempty"`
	CreatedAt *openapi_types.Date   `json:"createdAt,omitempty"`
	Fields    *[]Field              `json:"fields,omitempty"`
	Id        *id.ItemID            `json:"id,omitempty"`
	ModelId   *id.ModelID           `json:"modelId,omitempty"`
	Parents   *[]openapi_types.UUID `json:"parents,omitempty"`
	Refs      *[]string             `json:"refs,omitempty"`
	UpdatedAt *openapi_types.Date   `json:"updatedAt,omitempty"`
	Version   *openapi_types.UUID   `json:"version,omitempty"`
}

// RefOrVer defines model for refOrVer.
type RefOrVer struct {
	Ref *RefOrVerRef        `json:"ref,omitempty"`
	Ver *openapi_types.UUID `json:"ver,omitempty"`
}

// RefOrVerRef defines model for RefOrVer.Ref.
type RefOrVerRef string

// AssetIdParam defines model for assetIdParam.
type AssetIdParam = id.AssetID

// CommentIdParam defines model for commentIdParam.
type CommentIdParam = id.CommentID

// ItemIdParam defines model for itemIdParam.
type ItemIdParam = id.ItemID

// ModelIdParam defines model for modelIdParam.
type ModelIdParam = id.ModelID

// PageParam defines model for pageParam.
type PageParam = int

// PerPageParam defines model for perPageParam.
type PerPageParam = int

// ProjectIdParam defines model for projectIdParam.
type ProjectIdParam = id.ProjectID

// RefParam defines model for refParam.
type RefParam string

// SortDirParam defines model for sortDirParam.
type SortDirParam string

// SortParam defines model for sortParam.
type SortParam string

// ItemGetParams defines parameters for ItemGet.
type ItemGetParams struct {
	// Ref Used to select a ref or ver
	Ref *ItemGetParamsRef `form:"ref,omitempty" json:"ref,omitempty"`
}

// ItemGetParamsRef defines parameters for ItemGet.
type ItemGetParamsRef string

// ItemUpdateJSONBody defines parameters for ItemUpdate.
type ItemUpdateJSONBody struct {
	Fields *[]Field `json:"fields,omitempty"`
}

// ItemUpdateParams defines parameters for ItemUpdate.
type ItemUpdateParams struct {
	// Ref Used to select a ref or ver
	Ref *ItemUpdateParamsRef `form:"ref,omitempty" json:"ref,omitempty"`
}

// ItemUpdateParamsRef defines parameters for ItemUpdate.
type ItemUpdateParamsRef string

// ItemFilterParams defines parameters for ItemFilter.
type ItemFilterParams struct {
	// Sort Used to define the order of the response list
	Sort *ItemFilterParamsSort `form:"sort,omitempty" json:"sort,omitempty"`

	// Dir Used to define the order direction of the response list, will be ignored if the order is not presented
	Dir *ItemFilterParamsDir `form:"dir,omitempty" json:"dir,omitempty"`

	// Page Used to select the page
	Page *PageParam `form:"page,omitempty" json:"page,omitempty"`

	// PerPage Used to select the page
	PerPage *PerPageParam `form:"perPage,omitempty" json:"perPage,omitempty"`

	// Ref Used to select a ref or ver
	Ref *ItemFilterParamsRef `form:"ref,omitempty" json:"ref,omitempty"`
}

// ItemFilterParamsSort defines parameters for ItemFilter.
type ItemFilterParamsSort string

// ItemFilterParamsDir defines parameters for ItemFilter.
type ItemFilterParamsDir string

// ItemFilterParamsRef defines parameters for ItemFilter.
type ItemFilterParamsRef string

// ItemCreateJSONBody defines parameters for ItemCreate.
type ItemCreateJSONBody struct {
	Fields *[]Field `json:"fields,omitempty"`
}

// AssetFilterParams defines parameters for AssetFilter.
type AssetFilterParams struct {
	// Sort Used to define the order of the response list
	Sort *AssetFilterParamsSort `form:"sort,omitempty" json:"sort,omitempty"`

	// Dir Used to define the order direction of the response list, will be ignored if the order is not presented
	Dir *AssetFilterParamsDir `form:"dir,omitempty" json:"dir,omitempty"`

	// Page Used to select the page
	Page *PageParam `form:"page,omitempty" json:"page,omitempty"`

	// PerPage Used to select the page
	PerPage *PerPageParam `form:"perPage,omitempty" json:"perPage,omitempty"`
}

// AssetFilterParamsSort defines parameters for AssetFilter.
type AssetFilterParamsSort string

// AssetFilterParamsDir defines parameters for AssetFilter.
type AssetFilterParamsDir string

// AssetCreateMultipartBody defines parameters for AssetCreate.
type AssetCreateMultipartBody struct {
	File *openapi_types.File `json:"file,omitempty"`
}

// AssetCommentCreateJSONBody defines parameters for AssetCommentCreate.
type AssetCommentCreateJSONBody struct {
	Content *string `json:"content,omitempty"`
}

// AssetCommentUpdateJSONBody defines parameters for AssetCommentUpdate.
type AssetCommentUpdateJSONBody struct {
	Content *string `json:"content,omitempty"`
}

// ItemUpdateJSONRequestBody defines body for ItemUpdate for application/json ContentType.
type ItemUpdateJSONRequestBody ItemUpdateJSONBody

// ItemCreateJSONRequestBody defines body for ItemCreate for application/json ContentType.
type ItemCreateJSONRequestBody ItemCreateJSONBody

// ItemPublishJSONRequestBody defines body for ItemPublish for application/json ContentType.
type ItemPublishJSONRequestBody = RefOrVer

// AssetCreateMultipartRequestBody defines body for AssetCreate for multipart/form-data ContentType.
type AssetCreateMultipartRequestBody AssetCreateMultipartBody

// AssetCommentCreateJSONRequestBody defines body for AssetCommentCreate for application/json ContentType.
type AssetCommentCreateJSONRequestBody AssetCommentCreateJSONBody

// AssetCommentUpdateJSONRequestBody defines body for AssetCommentUpdate for application/json ContentType.
type AssetCommentUpdateJSONRequestBody AssetCommentUpdateJSONBody
