// Package serve implements gateway.File on top of the reearth-serve API.
//
// Authentication is left to the http.RoundTripper passed in Config.Transport;
// the package itself attaches no credentials (see NewTokenTransport).
//
// The API client in client.gen.go is generated from the reearth-serve OpenAPI
// spec downloaded into schema.json (see the go:generate directives below).
package serve

//go:generate curl -fsSL -o schema.json https://serve.reearth.land/api/v1/doc
//go:generate go tool oapi-codegen --config=client.cfg.yml schema.json

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const defaultTimeout = 30 * time.Second

type Config struct {
	// Endpoint is the reearth-serve base URL, e.g. https://serve.reearth.land
	Endpoint string
	// ProjectID is the reearth-serve project assets are uploaded into.
	// TODO(T06): replace with the CMS project → reearth-serve project mapping.
	ProjectID string
	Timeout   time.Duration
	// Transport sends every reearth-serve request and is responsible for
	// authenticating it. Nil uses http.DefaultTransport.
	Transport http.RoundTripper
}

type fileRepo struct {
	base      *url.URL
	projectID string
	client    *http.Client
	api       *ClientWithResponses
}

var _ gateway.File = (*fileRepo)(nil)

func NewFile(conf Config) (gateway.File, error) {
	if conf.Endpoint == "" {
		return nil, errors.New("serve: endpoint is required")
	}
	base, err := url.Parse(strings.TrimSuffix(conf.Endpoint, "/"))
	if err != nil {
		return nil, fmt.Errorf("serve: invalid endpoint: %w", err)
	}

	timeout := conf.Timeout
	if timeout <= 0 {
		timeout = defaultTimeout
	}

	transport := conf.Transport
	if transport == nil {
		transport = http.DefaultTransport
	}

	client := &http.Client{
		Timeout:   timeout,
		Transport: transport,
	}
	api, err := NewClientWithResponses(base.String(), WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("serve: init api client: %w", err)
	}

	return &fileRepo{
		base:      base,
		projectID: conf.ProjectID,
		client:    client,
		api:       api,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, id, fn string, headers map[string]string) (io.ReadCloser, map[string]string, error) {
	if id == "" || fn == "" {
		return nil, nil, rerror.ErrNotFound
	}

	req, err := f.newRequest(ctx, http.MethodGet, f.fileURL(id, fn), nil)
	if err != nil {
		return nil, nil, err
	}
	for _, h := range []string{"Range", "Accept-Encoding", "If-None-Match", "If-Modified-Since"} {
		if v := headers[h]; v != "" {
			req.Header.Set(h, v)
		}
	}
	if req.Header.Get("Accept-Encoding") == "" {
		// Ask for the stored bytes as-is; otherwise net/http transparently
		// decompresses gzip and drops Content-Encoding.
		req.Header.Set("Accept-Encoding", "identity")
	}

	res, err := f.client.Do(req)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(fmt.Errorf("serve: read asset: %w", err))
	}
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusPartialContent && res.StatusCode != http.StatusNotModified {
		return nil, nil, responseError(res, "read asset")
	}

	resHeaders := map[string]string{}
	for _, h := range []string{"Content-Type", "Content-Length", "Content-Encoding", "Content-Range", "Cache-Control", "Last-Modified", "ETag", "Accept-Ranges"} {
		if v := res.Header.Get(h); v != "" {
			resHeaders[h] = v
		}
	}
	return res.Body, resHeaders, nil
}

func (f *fileRepo) GetAssetFiles(ctx context.Context, id string) ([]gateway.FileEntry, error) {
	if id == "" {
		return nil, rerror.ErrNotFound
	}

	// The listing is an NDJSON stream, which the generated response parser does
	// not decode, so use the raw client and read it line by line.
	res, err := f.api.GetApiV1AssetsByIdFiles(ctx, id, nil)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: list asset files: %w", err))
	}
	defer closeBody(res)
	if res.StatusCode != http.StatusOK {
		return nil, responseError(res, "list asset files")
	}

	var entries []gateway.FileEntry
	sc := bufio.NewScanner(res.Body)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		line := sc.Bytes()
		if len(line) == 0 {
			continue
		}
		var e FileEntry
		if err := json.Unmarshal(line, &e); err != nil {
			return nil, rerror.ErrInternalBy(fmt.Errorf("serve: decode file entry: %w", err))
		}
		entries = append(entries, gateway.FileEntry{
			Name:            strings.TrimPrefix(e.Path, "/"),
			Size:            int64(e.Size),
			ContentType:     e.ContentType,
			ContentEncoding: lo.FromPtr(e.ContentEncoding),
		})
	}
	if err := sc.Err(); err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: read file entries: %w", err))
	}
	return entries, nil
}

func (f *fileRepo) UploadAsset(ctx context.Context, fl *file.File) (string, int64, error) {
	if fl == nil || fl.Name == "" || fl.Content == nil {
		return "", 0, gateway.ErrInvalidFile
	}
	// reearth-serve requires Content-Length, so the size must be known up front.
	if fl.Size <= 0 {
		return "", 0, gateway.ErrInvalidFile
	}
	if f.projectID == "" {
		return "", 0, rerror.ErrInternalBy(errors.New("serve: project id is not configured"))
	}

	params := &PostApiV1AssetsParams{
		XFilename:     fl.Name,
		ContentLength: int(fl.Size),
		XProjectId:    new(f.projectID),
	}
	switch fl.ContentEncoding {
	case "", "identity":
	case "gzip":
		params.ContentEncoding = new(ContentEncodingGzip)
	default:
		return "", 0, gateway.ErrUnsupportedContentEncoding
	}
	if fl.SkipExtraction {
		params.XSkipExtraction = new(XSkipExtractionTrue)
	}

	res, err := f.api.PostApiV1AssetsWithBodyWithResponse(ctx, params, "application/octet-stream", fl.Content,
		func(_ context.Context, req *http.Request) error {
			// net/http ignores a Content-Length header; the field sets it.
			req.ContentLength = fl.Size
			return nil
		},
	)
	if err != nil {
		return "", 0, rerror.ErrInternalBy(fmt.Errorf("serve: upload asset: %w", err))
	}
	if res.StatusCode() == http.StatusRequestEntityTooLarge {
		return "", 0, gateway.ErrFileTooLarge
	}
	if res.JSON201 == nil {
		return "", 0, statusError(res.StatusCode(), res.Body, "upload asset")
	}
	if res.JSON201.Asset.Id == "" {
		return "", 0, rerror.ErrInternalBy(errors.New("serve: upload response has no asset id"))
	}
	return res.JSON201.Asset.Id, assetSize(res.JSON201.Asset), nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, id, _ string) error {
	if id == "" {
		return gateway.ErrInvalidFile
	}

	res, err := f.api.DeleteApiV1AssetsByIdWithResponse(ctx, id)
	if err != nil {
		return rerror.ErrInternalBy(fmt.Errorf("serve: delete asset: %w", err))
	}
	switch res.StatusCode() {
	case http.StatusOK, http.StatusNoContent, http.StatusNotFound:
		// Already gone counts as deleted so retries stay idempotent.
		return nil
	default:
		return statusError(res.StatusCode(), res.Body, "delete asset")
	}
}

func (f *fileRepo) DeleteAssets(ctx context.Context, ids []string) error {
	var errs []error
	for _, id := range ids {
		if err := f.DeleteAsset(ctx, id, ""); err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", id, err))
		}
	}
	return errors.Join(errs...)
}

// PublishAsset is a no-op: reearth-serve files are always publicly readable.
func (f *fileRepo) PublishAsset(context.Context, string, string) error {
	return nil
}

// UnpublishAsset is unsupported until reearth-serve has access policies.
func (f *fileRepo) UnpublishAsset(context.Context, string, string) error {
	return gateway.ErrUnsupportedOperation
}

func (f *fileRepo) GetAccessInfoResolver() asset.AccessInfoResolver {
	return f.GetAccessInfo
}

func (f *fileRepo) GetAccessInfo(a *asset.Asset) *asset.AccessInfo {
	if !a.StoredInServe() {
		return nil
	}
	return &asset.AccessInfo{
		Url:    f.fileURL(*a.ServeID(), a.FileName()),
		Public: true,
	}
}

func (f *fileRepo) GetBaseURL() string {
	return f.base.String() + "/files"
}

// IssueUploadAssetLink opens a reearth-serve upload session with a single
// presigned PUT URL. reearth-serve assigns the upload ID, returned as
// UploadAssetLink.UUID, and decides itself whether the file must be sent
// gzipped (UploadAssetLink.ContentEncoding); the requested encoding is ignored.
func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	if param.Filename == "" || param.ContentLength <= 0 {
		return nil, gateway.ErrInvalidFile
	}
	if param.Cursor != "" {
		// Sessions are single-part, so no cursor is ever issued.
		return nil, gateway.ErrInvalidFile
	}
	if f.projectID == "" {
		return nil, rerror.ErrInternalBy(errors.New("serve: project id is not configured"))
	}

	body := CreateUploadSessionRequest{
		Filename: param.Filename,
		Size:     float64(param.ContentLength),
	}
	if ct := param.GetOrGuessContentType(); ct != "" {
		body.ContentType = new(ct)
	}
	res, err := f.api.PostApiV1AssetsUploadsWithResponse(ctx, &PostApiV1AssetsUploadsParams{XProjectId: new(f.projectID)}, body)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: create upload session: %w", err))
	}
	if res.StatusCode() == http.StatusNotImplemented {
		log.Warnf("serve: presigned uploads are not available: %s", res.Body)
		return nil, gateway.ErrUnsupportedOperation
	}
	if res.JSON201 == nil {
		return nil, statusError(res.StatusCode(), res.Body, "create upload session")
	}
	session, err := res.JSON201.AsPresignedUploadSession()
	if err != nil || session.UploadId == "" || session.Url == "" {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: unexpected upload session: %s", res.Body))
	}
	if session.Method != PUT {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: unsupported upload method %q", session.Method))
	}

	var contentType, contentEncoding string
	for k, v := range session.Headers {
		switch http.CanonicalHeaderKey(k) {
		case "Content-Type":
			contentType = v
		case "Content-Encoding":
			contentEncoding = v
		default:
			// The CMS web client only sends Content-Type and Content-Encoding.
			return nil, rerror.ErrInternalBy(fmt.Errorf("serve: unsupported upload header %q", k))
		}
	}

	return &gateway.UploadAssetLink{
		URL:             session.Url,
		ContentType:     contentType,
		ContentLength:   param.ContentLength,
		ContentEncoding: contentEncoding,
		UUID:            session.UploadId,
		ExpiresAt:       time.UnixMilli(int64(session.ExpiresAt)).UTC(),
	}, nil
}

// UploadedAsset completes the reearth-serve upload session and returns the
// created reearth-serve asset ID as the key.
func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, string, error) {
	if u == nil || u.UUID() == "" {
		return nil, "", gateway.ErrInvalidFile
	}

	res, err := f.api.PostApiV1AssetsUploadsByIdCompleteWithResponse(ctx, u.UUID(), CompleteUploadSessionRequest{})
	if err != nil {
		return nil, "", rerror.ErrInternalBy(fmt.Errorf("serve: complete upload session: %w", err))
	}
	if res.JSON201 == nil {
		return nil, "", statusError(res.StatusCode(), res.Body, "complete upload session")
	}
	a := res.JSON201.Asset
	if a.Id == "" {
		return nil, "", rerror.ErrInternalBy(errors.New("serve: complete response has no asset id"))
	}
	return &file.File{
		Name:        u.FileName(),
		Size:        assetSize(a),
		ContentType: a.ContentType,
	}, a.Id, nil
}

// generic objects
//
// reearth-serve only stores assets. Temporary import/export files stay on the
// legacy storage until their future is decided (T03).

func (f *fileRepo) Read(context.Context, string, map[string]string) (io.ReadCloser, map[string]string, error) {
	return nil, nil, gateway.ErrUnsupportedOperation
}

func (f *fileRepo) Upload(context.Context, *file.File, string) (int64, error) {
	return 0, gateway.ErrUnsupportedOperation
}

func (f *fileRepo) Delete(context.Context, string) error {
	return gateway.ErrUnsupportedOperation
}

func (f *fileRepo) DeleteByPrefix(context.Context, string, gateway.Predicate) error {
	return gateway.ErrUnsupportedOperation
}

func (f *fileRepo) ListByPrefix(context.Context, string) ([]string, error) {
	return nil, gateway.ErrUnsupportedOperation
}

func (f *fileRepo) Check(ctx context.Context) error {
	res, err := f.api.GetApiV1HealthWithResponse(ctx)
	if err != nil {
		return rerror.ErrInternalBy(fmt.Errorf("serve: check: %w", err))
	}
	if res.StatusCode() != http.StatusOK {
		return statusError(res.StatusCode(), res.Body, "check")
	}
	return nil
}

// helpers

// assetSize returns the size of the file as uploaded: reearth-serve reports
// the stored (possibly gzipped) size as Size and the original as OriginalSize.
func assetSize(a Asset) int64 {
	if a.OriginalSize != nil {
		return int64(*a.OriginalSize)
	}
	return int64(a.Size)
}

func (f *fileRepo) fileURL(id, fn string) string {
	if id == "" || fn == "" {
		return ""
	}
	// fn may be a nested path inside an extracted archive; keep its slashes.
	return f.base.JoinPath(append([]string{"files", id}, strings.Split(strings.TrimPrefix(fn, "/"), "/")...)...).String()
}

func (f *fileRepo) newRequest(ctx context.Context, method, u string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, u, body)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("serve: build request: %w", err))
	}
	return req, nil
}

func responseError(res *http.Response, op string) error {
	defer closeBody(res)
	b, _ := io.ReadAll(io.LimitReader(res.Body, 4*1024))
	return statusError(res.StatusCode, b, op)
}

func statusError(status int, b []byte, op string) error {
	if status == http.StatusNotFound {
		return rerror.ErrNotFound
	}

	msg := ""
	var e Error
	if json.Unmarshal(b, &e) == nil && e.Error != "" {
		msg = e.Error
	} else {
		msg = strings.TrimSpace(string(b))
	}
	return rerror.ErrInternalBy(fmt.Errorf("serve: %s: status %s: %s", op, strconv.Itoa(status), msg))
}

func closeBody(res *http.Response) {
	if res == nil || res.Body == nil {
		return
	}
	if err := res.Body.Close(); err != nil {
		log.Warnf("serve: failed to close response body: %v", err)
	}
}
