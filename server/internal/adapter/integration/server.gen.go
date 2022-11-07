// Package integration provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/deepmap/oapi-codegen version v1.11.1-0.20221025065958-57a4b26d477f DO NOT EDIT.
package integration

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/deepmap/oapi-codegen/pkg/runtime"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/id"
	. "github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

// ServerInterface represents all server handlers.
type ServerInterface interface {

	// (DELETE /items/{itemId})
	ItemDelete(ctx echo.Context, itemId ItemIdParam) error
	// Returns an items.
	// (GET /items/{itemId})
	ItemGet(ctx echo.Context, itemId ItemIdParam, params ItemGetParams) error
	// Returns a list of items.
	// (GET /models/{modelId}/items)
	ItemFilter(ctx echo.Context, modelId ModelIdParam, params ItemFilterParams) error

	// (POST /models/{modelId}/items)
	ItemCreate(ctx echo.Context, modelId ModelIdParam) error
	// Set ref and version.
	// (POST /models/{modelId}/items/{itemId}/refs)
	ItemPublish(ctx echo.Context, modelId ModelIdParam, itemId ItemIdParam) error
	// Returns a list of assets.
	// (GET /projects/{projectId}/assets)
	AssetFilter(ctx echo.Context, projectId ProjectIdParam, params AssetFilterParams) error
	// Returns a list of assets.
	// (POST /projects/{projectId}/assets)
	AssetCreate(ctx echo.Context, projectId ProjectIdParam) error

	// (DELETE /projects/{projectId}/assets/{assetId})
	AssetDelete(ctx echo.Context, projectId ProjectIdParam, assetId AssetIdParam) error

	// (GET /projects/{projectId}/assets/{assetId})
	AssetGet(ctx echo.Context, projectId ProjectIdParam, assetId AssetIdParam) error
}

// ServerInterfaceWrapper converts echo contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler ServerInterface
}

// ItemDelete converts echo context to params.
func (w *ServerInterfaceWrapper) ItemDelete(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "itemId" -------------
	var itemId ItemIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "itemId", runtime.ParamLocationPath, ctx.Param("itemId"), &itemId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter itemId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ItemDelete(ctx, itemId)
	return err
}

// ItemGet converts echo context to params.
func (w *ServerInterfaceWrapper) ItemGet(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "itemId" -------------
	var itemId ItemIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "itemId", runtime.ParamLocationPath, ctx.Param("itemId"), &itemId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter itemId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Parameter object where we will unmarshal all parameters from the context
	var params ItemGetParams
	// ------------- Optional query parameter "ref" -------------

	err = runtime.BindQueryParameter("form", true, false, "ref", ctx.QueryParams(), &params.Ref)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter ref: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ItemGet(ctx, itemId, params)
	return err
}

// ItemFilter converts echo context to params.
func (w *ServerInterfaceWrapper) ItemFilter(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "modelId" -------------
	var modelId ModelIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "modelId", runtime.ParamLocationPath, ctx.Param("modelId"), &modelId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter modelId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Parameter object where we will unmarshal all parameters from the context
	var params ItemFilterParams
	// ------------- Optional query parameter "sort" -------------

	err = runtime.BindQueryParameter("form", true, false, "sort", ctx.QueryParams(), &params.Sort)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter sort: %s", err))
	}

	// ------------- Optional query parameter "dir" -------------

	err = runtime.BindQueryParameter("form", true, false, "dir", ctx.QueryParams(), &params.Dir)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter dir: %s", err))
	}

	// ------------- Optional query parameter "page" -------------

	err = runtime.BindQueryParameter("form", true, false, "page", ctx.QueryParams(), &params.Page)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter page: %s", err))
	}

	// ------------- Optional query parameter "perPage" -------------

	err = runtime.BindQueryParameter("form", true, false, "perPage", ctx.QueryParams(), &params.PerPage)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter perPage: %s", err))
	}

	// ------------- Optional query parameter "ref" -------------

	err = runtime.BindQueryParameter("form", true, false, "ref", ctx.QueryParams(), &params.Ref)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter ref: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ItemFilter(ctx, modelId, params)
	return err
}

// ItemCreate converts echo context to params.
func (w *ServerInterfaceWrapper) ItemCreate(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "modelId" -------------
	var modelId ModelIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "modelId", runtime.ParamLocationPath, ctx.Param("modelId"), &modelId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter modelId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ItemCreate(ctx, modelId)
	return err
}

// ItemPublish converts echo context to params.
func (w *ServerInterfaceWrapper) ItemPublish(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "modelId" -------------
	var modelId ModelIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "modelId", runtime.ParamLocationPath, ctx.Param("modelId"), &modelId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter modelId: %s", err))
	}

	// ------------- Path parameter "itemId" -------------
	var itemId ItemIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "itemId", runtime.ParamLocationPath, ctx.Param("itemId"), &itemId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter itemId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ItemPublish(ctx, modelId, itemId)
	return err
}

// AssetFilter converts echo context to params.
func (w *ServerInterfaceWrapper) AssetFilter(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "projectId" -------------
	var projectId ProjectIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "projectId", runtime.ParamLocationPath, ctx.Param("projectId"), &projectId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter projectId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Parameter object where we will unmarshal all parameters from the context
	var params AssetFilterParams
	// ------------- Optional query parameter "sort" -------------

	err = runtime.BindQueryParameter("form", true, false, "sort", ctx.QueryParams(), &params.Sort)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter sort: %s", err))
	}

	// ------------- Optional query parameter "dir" -------------

	err = runtime.BindQueryParameter("form", true, false, "dir", ctx.QueryParams(), &params.Dir)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter dir: %s", err))
	}

	// ------------- Optional query parameter "page" -------------

	err = runtime.BindQueryParameter("form", true, false, "page", ctx.QueryParams(), &params.Page)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter page: %s", err))
	}

	// ------------- Optional query parameter "perPage" -------------

	err = runtime.BindQueryParameter("form", true, false, "perPage", ctx.QueryParams(), &params.PerPage)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter perPage: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.AssetFilter(ctx, projectId, params)
	return err
}

// AssetCreate converts echo context to params.
func (w *ServerInterfaceWrapper) AssetCreate(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "projectId" -------------
	var projectId ProjectIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "projectId", runtime.ParamLocationPath, ctx.Param("projectId"), &projectId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter projectId: %s", err))
	}

	ctx.Set(BearerAuthScopes, []string{""})

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.AssetCreate(ctx, projectId)
	return err
}

// AssetDelete converts echo context to params.
func (w *ServerInterfaceWrapper) AssetDelete(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "projectId" -------------
	var projectId ProjectIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "projectId", runtime.ParamLocationPath, ctx.Param("projectId"), &projectId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter projectId: %s", err))
	}

	// ------------- Path parameter "assetId" -------------
	var assetId AssetIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "assetId", runtime.ParamLocationPath, ctx.Param("assetId"), &assetId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter assetId: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.AssetDelete(ctx, projectId, assetId)
	return err
}

// AssetGet converts echo context to params.
func (w *ServerInterfaceWrapper) AssetGet(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "projectId" -------------
	var projectId ProjectIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "projectId", runtime.ParamLocationPath, ctx.Param("projectId"), &projectId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter projectId: %s", err))
	}

	// ------------- Path parameter "assetId" -------------
	var assetId AssetIdParam

	err = runtime.BindStyledParameterWithLocation("simple", false, "assetId", runtime.ParamLocationPath, ctx.Param("assetId"), &assetId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter assetId: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.AssetGet(ctx, projectId, assetId)
	return err
}

// This is a simple interface which specifies echo.Route addition functions which
// are present on both echo.Echo and echo.Group, since we want to allow using
// either of them for path registration
type EchoRouter interface {
	CONNECT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	DELETE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	GET(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	HEAD(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	OPTIONS(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PATCH(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	POST(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PUT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	TRACE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
}

// RegisterHandlers adds each server route to the EchoRouter.
func RegisterHandlers(router EchoRouter, si ServerInterface) {
	RegisterHandlersWithBaseURL(router, si, "")
}

// Registers handlers, and prepends BaseURL to the paths, so that the paths
// can be served under a prefix.
func RegisterHandlersWithBaseURL(router EchoRouter, si ServerInterface, baseURL string) {

	wrapper := ServerInterfaceWrapper{
		Handler: si,
	}

	router.DELETE(baseURL+"/items/:itemId", wrapper.ItemDelete)
	router.GET(baseURL+"/items/:itemId", wrapper.ItemGet)
	router.GET(baseURL+"/models/:modelId/items", wrapper.ItemFilter)
	router.POST(baseURL+"/models/:modelId/items", wrapper.ItemCreate)
	router.POST(baseURL+"/models/:modelId/items/:itemId/refs", wrapper.ItemPublish)
	router.GET(baseURL+"/projects/:projectId/assets", wrapper.AssetFilter)
	router.POST(baseURL+"/projects/:projectId/assets", wrapper.AssetCreate)
	router.DELETE(baseURL+"/projects/:projectId/assets/:assetId", wrapper.AssetDelete)
	router.GET(baseURL+"/projects/:projectId/assets/:assetId", wrapper.AssetGet)

}

type UnauthorizedErrorResponse struct {
}

type ItemDeleteRequestObject struct {
	ItemId ItemIdParam `json:"itemId"`
}

type ItemDeleteResponseObject interface {
	VisitItemDeleteResponse(w http.ResponseWriter) error
}

type ItemDelete200JSONResponse struct {
	Id *id.ItemID `json:"id,omitempty"`
}

func (response ItemDelete200JSONResponse) VisitItemDeleteResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type ItemDelete400Response struct {
}

func (response ItemDelete400Response) VisitItemDeleteResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type ItemDelete401Response = UnauthorizedErrorResponse

func (response ItemDelete401Response) VisitItemDeleteResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type ItemDelete404Response struct {
}

func (response ItemDelete404Response) VisitItemDeleteResponse(w http.ResponseWriter) error {
	w.WriteHeader(404)
	return nil
}

type ItemGetRequestObject struct {
	ItemId ItemIdParam `json:"itemId"`
	Params ItemGetParams
}

type ItemGetResponseObject interface {
	VisitItemGetResponse(w http.ResponseWriter) error
}

type ItemGet200JSONResponse Item

func (response ItemGet200JSONResponse) VisitItemGetResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type ItemGet400Response struct {
}

func (response ItemGet400Response) VisitItemGetResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type ItemGet401Response = UnauthorizedErrorResponse

func (response ItemGet401Response) VisitItemGetResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type ItemFilterRequestObject struct {
	ModelId ModelIdParam `json:"modelId"`
	Params  ItemFilterParams
}

type ItemFilterResponseObject interface {
	VisitItemFilterResponse(w http.ResponseWriter) error
}

type ItemFilter200JSONResponse struct {
	Items      *[]Item `json:"items,omitempty"`
	Page       *int    `json:"page,omitempty"`
	PerPage    *int    `json:"perPage,omitempty"`
	TotalCount *int    `json:"totalCount,omitempty"`
}

func (response ItemFilter200JSONResponse) VisitItemFilterResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type ItemFilter400Response struct {
}

func (response ItemFilter400Response) VisitItemFilterResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type ItemFilter401Response = UnauthorizedErrorResponse

func (response ItemFilter401Response) VisitItemFilterResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type ItemCreateRequestObject struct {
	ModelId ModelIdParam `json:"modelId"`
	Body    *ItemCreateJSONRequestBody
}

type ItemCreateResponseObject interface {
	VisitItemCreateResponse(w http.ResponseWriter) error
}

type ItemCreate200JSONResponse Item

func (response ItemCreate200JSONResponse) VisitItemCreateResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type ItemCreate400Response struct {
}

func (response ItemCreate400Response) VisitItemCreateResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type ItemCreate401Response = UnauthorizedErrorResponse

func (response ItemCreate401Response) VisitItemCreateResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type ItemPublishRequestObject struct {
	ModelId ModelIdParam `json:"modelId"`
	ItemId  ItemIdParam  `json:"itemId"`
	Body    *ItemPublishJSONRequestBody
}

type ItemPublishResponseObject interface {
	VisitItemPublishResponse(w http.ResponseWriter) error
}

type ItemPublish200JSONResponse Item

func (response ItemPublish200JSONResponse) VisitItemPublishResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type ItemPublish400Response struct {
}

func (response ItemPublish400Response) VisitItemPublishResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type ItemPublish401Response = UnauthorizedErrorResponse

func (response ItemPublish401Response) VisitItemPublishResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type AssetFilterRequestObject struct {
	ProjectId ProjectIdParam `json:"projectId"`
	Params    AssetFilterParams
}

type AssetFilterResponseObject interface {
	VisitAssetFilterResponse(w http.ResponseWriter) error
}

type AssetFilter200JSONResponse struct {
	Items      *[]Asset `json:"items,omitempty"`
	Page       *int     `json:"page,omitempty"`
	PerPage    *int     `json:"perPage,omitempty"`
	TotalCount *int     `json:"totalCount,omitempty"`
}

func (response AssetFilter200JSONResponse) VisitAssetFilterResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type AssetFilter400Response struct {
}

func (response AssetFilter400Response) VisitAssetFilterResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type AssetFilter401Response = UnauthorizedErrorResponse

func (response AssetFilter401Response) VisitAssetFilterResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type AssetCreateRequestObject struct {
	ProjectId ProjectIdParam `json:"projectId"`
	Body      *multipart.Reader
}

type AssetCreateResponseObject interface {
	VisitAssetCreateResponse(w http.ResponseWriter) error
}

type AssetCreate200JSONResponse Asset

func (response AssetCreate200JSONResponse) VisitAssetCreateResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type AssetCreate400Response struct {
}

func (response AssetCreate400Response) VisitAssetCreateResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type AssetCreate401Response = UnauthorizedErrorResponse

func (response AssetCreate401Response) VisitAssetCreateResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type AssetDeleteRequestObject struct {
	ProjectId ProjectIdParam `json:"projectId"`
	AssetId   AssetIdParam   `json:"assetId"`
}

type AssetDeleteResponseObject interface {
	VisitAssetDeleteResponse(w http.ResponseWriter) error
}

type AssetDelete200JSONResponse struct {
	Id *id.AssetID `json:"id,omitempty"`
}

func (response AssetDelete200JSONResponse) VisitAssetDeleteResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type AssetDelete400Response struct {
}

func (response AssetDelete400Response) VisitAssetDeleteResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type AssetDelete401Response = UnauthorizedErrorResponse

func (response AssetDelete401Response) VisitAssetDeleteResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

type AssetGetRequestObject struct {
	ProjectId ProjectIdParam `json:"projectId"`
	AssetId   AssetIdParam   `json:"assetId"`
}

type AssetGetResponseObject interface {
	VisitAssetGetResponse(w http.ResponseWriter) error
}

type AssetGet200JSONResponse Asset

func (response AssetGet200JSONResponse) VisitAssetGetResponse(w http.ResponseWriter) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	return json.NewEncoder(w).Encode(response)
}

type AssetGet400Response struct {
}

func (response AssetGet400Response) VisitAssetGetResponse(w http.ResponseWriter) error {
	w.WriteHeader(400)
	return nil
}

type AssetGet401Response = UnauthorizedErrorResponse

func (response AssetGet401Response) VisitAssetGetResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	return nil
}

// StrictServerInterface represents all server handlers.
type StrictServerInterface interface {

	// (DELETE /items/{itemId})
	ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error)
	// Returns an items.
	// (GET /items/{itemId})
	ItemGet(ctx context.Context, request ItemGetRequestObject) (ItemGetResponseObject, error)
	// Returns a list of items.
	// (GET /models/{modelId}/items)
	ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error)

	// (POST /models/{modelId}/items)
	ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error)
	// Set ref and version.
	// (POST /models/{modelId}/items/{itemId}/refs)
	ItemPublish(ctx context.Context, request ItemPublishRequestObject) (ItemPublishResponseObject, error)
	// Returns a list of assets.
	// (GET /projects/{projectId}/assets)
	AssetFilter(ctx context.Context, request AssetFilterRequestObject) (AssetFilterResponseObject, error)
	// Returns a list of assets.
	// (POST /projects/{projectId}/assets)
	AssetCreate(ctx context.Context, request AssetCreateRequestObject) (AssetCreateResponseObject, error)

	// (DELETE /projects/{projectId}/assets/{assetId})
	AssetDelete(ctx context.Context, request AssetDeleteRequestObject) (AssetDeleteResponseObject, error)

	// (GET /projects/{projectId}/assets/{assetId})
	AssetGet(ctx context.Context, request AssetGetRequestObject) (AssetGetResponseObject, error)
}

type StrictHandlerFunc func(ctx echo.Context, args interface{}) (interface{}, error)

type StrictMiddlewareFunc func(f StrictHandlerFunc, operationID string) StrictHandlerFunc

func NewStrictHandler(ssi StrictServerInterface, middlewares []StrictMiddlewareFunc) ServerInterface {
	return &strictHandler{ssi: ssi, middlewares: middlewares}
}

type strictHandler struct {
	ssi         StrictServerInterface
	middlewares []StrictMiddlewareFunc
}

// ItemDelete operation middleware
func (sh *strictHandler) ItemDelete(ctx echo.Context, itemId ItemIdParam) error {
	var request ItemDeleteRequestObject

	request.ItemId = itemId

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.ItemDelete(ctx.Request().Context(), request.(ItemDeleteRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "ItemDelete")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(ItemDeleteResponseObject); ok {
		return validResponse.VisitItemDeleteResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// ItemGet operation middleware
func (sh *strictHandler) ItemGet(ctx echo.Context, itemId ItemIdParam, params ItemGetParams) error {
	var request ItemGetRequestObject

	request.ItemId = itemId
	request.Params = params

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.ItemGet(ctx.Request().Context(), request.(ItemGetRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "ItemGet")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(ItemGetResponseObject); ok {
		return validResponse.VisitItemGetResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// ItemFilter operation middleware
func (sh *strictHandler) ItemFilter(ctx echo.Context, modelId ModelIdParam, params ItemFilterParams) error {
	var request ItemFilterRequestObject

	request.ModelId = modelId
	request.Params = params

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.ItemFilter(ctx.Request().Context(), request.(ItemFilterRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "ItemFilter")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(ItemFilterResponseObject); ok {
		return validResponse.VisitItemFilterResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// ItemCreate operation middleware
func (sh *strictHandler) ItemCreate(ctx echo.Context, modelId ModelIdParam) error {
	var request ItemCreateRequestObject

	request.ModelId = modelId

	var body ItemCreateJSONRequestBody
	if err := ctx.Bind(&body); err != nil {
		return err
	}
	request.Body = &body

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.ItemCreate(ctx.Request().Context(), request.(ItemCreateRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "ItemCreate")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(ItemCreateResponseObject); ok {
		return validResponse.VisitItemCreateResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// ItemPublish operation middleware
func (sh *strictHandler) ItemPublish(ctx echo.Context, modelId ModelIdParam, itemId ItemIdParam) error {
	var request ItemPublishRequestObject

	request.ModelId = modelId
	request.ItemId = itemId

	var body ItemPublishJSONRequestBody
	if err := ctx.Bind(&body); err != nil {
		return err
	}
	request.Body = &body

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.ItemPublish(ctx.Request().Context(), request.(ItemPublishRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "ItemPublish")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(ItemPublishResponseObject); ok {
		return validResponse.VisitItemPublishResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// AssetFilter operation middleware
func (sh *strictHandler) AssetFilter(ctx echo.Context, projectId ProjectIdParam, params AssetFilterParams) error {
	var request AssetFilterRequestObject

	request.ProjectId = projectId
	request.Params = params

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.AssetFilter(ctx.Request().Context(), request.(AssetFilterRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AssetFilter")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(AssetFilterResponseObject); ok {
		return validResponse.VisitAssetFilterResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// AssetCreate operation middleware
func (sh *strictHandler) AssetCreate(ctx echo.Context, projectId ProjectIdParam) error {
	var request AssetCreateRequestObject

	request.ProjectId = projectId

	if reader, err := ctx.Request().MultipartReader(); err != nil {
		return err
	} else {
		request.Body = reader
	}

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.AssetCreate(ctx.Request().Context(), request.(AssetCreateRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AssetCreate")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(AssetCreateResponseObject); ok {
		return validResponse.VisitAssetCreateResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// AssetDelete operation middleware
func (sh *strictHandler) AssetDelete(ctx echo.Context, projectId ProjectIdParam, assetId AssetIdParam) error {
	var request AssetDeleteRequestObject

	request.ProjectId = projectId
	request.AssetId = assetId

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.AssetDelete(ctx.Request().Context(), request.(AssetDeleteRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AssetDelete")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(AssetDeleteResponseObject); ok {
		return validResponse.VisitAssetDeleteResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// AssetGet operation middleware
func (sh *strictHandler) AssetGet(ctx echo.Context, projectId ProjectIdParam, assetId AssetIdParam) error {
	var request AssetGetRequestObject

	request.ProjectId = projectId
	request.AssetId = assetId

	handler := func(ctx echo.Context, request interface{}) (interface{}, error) {
		return sh.ssi.AssetGet(ctx.Request().Context(), request.(AssetGetRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AssetGet")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return err
	} else if validResponse, ok := response.(AssetGetResponseObject); ok {
		return validResponse.VisitAssetGetResponse(ctx.Response())
	} else if response != nil {
		return fmt.Errorf("Unexpected response type: %T", response)
	}
	return nil
}

// Base64 encoded, gzipped, json marshaled Swagger object
var swaggerSpec = []string{

	"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",
}

// GetSwagger returns the content of the embedded swagger specification file
// or error if failed to decode
func decodeSpec() ([]byte, error) {
	zipped, err := base64.StdEncoding.DecodeString(strings.Join(swaggerSpec, ""))
	if err != nil {
		return nil, fmt.Errorf("error base64 decoding spec: %s", err)
	}
	zr, err := gzip.NewReader(bytes.NewReader(zipped))
	if err != nil {
		return nil, fmt.Errorf("error decompressing spec: %s", err)
	}
	var buf bytes.Buffer
	_, err = buf.ReadFrom(zr)
	if err != nil {
		return nil, fmt.Errorf("error decompressing spec: %s", err)
	}

	return buf.Bytes(), nil
}

var rawSpec = decodeSpecCached()

// a naive cached of a decoded swagger spec
func decodeSpecCached() func() ([]byte, error) {
	data, err := decodeSpec()
	return func() ([]byte, error) {
		return data, err
	}
}

// Constructs a synthetic filesystem for resolving external references when loading openapi specifications.
func PathToRawSpec(pathToFile string) map[string]func() ([]byte, error) {
	var res = make(map[string]func() ([]byte, error))
	if len(pathToFile) > 0 {
		res[pathToFile] = rawSpec
	}

	return res
}

// GetSwagger returns the Swagger specification corresponding to the generated code
// in this file. The external references of Swagger specification are resolved.
// The logic of resolving external references is tightly connected to "import-mapping" feature.
// Externally referenced files must be embedded in the corresponding golang packages.
// Urls can be supported but this task was out of the scope.
func GetSwagger() (swagger *openapi3.T, err error) {
	var resolvePath = PathToRawSpec("")

	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true
	loader.ReadFromURIFunc = func(loader *openapi3.Loader, url *url.URL) ([]byte, error) {
		var pathToFile = url.String()
		pathToFile = path.Clean(pathToFile)
		getSpec, ok := resolvePath[pathToFile]
		if !ok {
			err1 := fmt.Errorf("path not found: %s", pathToFile)
			return nil, err1
		}
		return getSpec()
	}
	var specData []byte
	specData, err = rawSpec()
	if err != nil {
		return
	}
	swagger, err = loader.LoadFromData(specData)
	if err != nil {
		return
	}
	return
}
