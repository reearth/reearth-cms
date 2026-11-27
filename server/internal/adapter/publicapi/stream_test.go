package publicapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// --- stream() unit tests ---

func newStreamContext(ctx context.Context) (*echo.Context, *httptest.ResponseRecorder) {
	req := httptest.NewRequest(http.MethodGet, "/", nil).WithContext(ctx)
	rec := httptest.NewRecorder()
	return echo.New().NewContext(req, rec), rec
}

func isCommitted(t *testing.T, c *echo.Context) bool {
	t.Helper()
	r, err := echo.UnwrapResponse(c.Response())
	require.NoError(t, err)
	return r.Committed
}

func TestStream(t *testing.T) {
	t.Parallel()

	chunk := bytes.Repeat([]byte("a"), 20*1024)

	t.Run("output reaches the client before the export finishes", func(t *testing.T) {
		t.Parallel()
		c, rec := newStreamContext(context.Background())

		err := stream(c, "text/csv", func(w io.Writer) error {
			_, err := w.Write(chunk)
			require.NoError(t, err)
			// the first write starts the response
			assert.True(t, isCommitted(t, c))
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Positive(t, rec.Body.Len())

			_, err = w.Write(chunk)
			return err
		})

		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "text/csv", rec.Header().Get(echo.HeaderContentType))
		assert.Equal(t, bytes.Repeat(chunk, 2), rec.Body.Bytes())
	})

	t.Run("error before any output is returned without the content type", func(t *testing.T) {
		t.Parallel()
		c, rec := newStreamContext(context.Background())

		err := stream(c, "text/csv", func(io.Writer) error {
			return rerror.ErrNotFound
		})

		assert.ErrorIs(t, err, rerror.ErrNotFound)
		assert.False(t, isCommitted(t, c))
		assert.Empty(t, rec.Header().Get(echo.HeaderContentType), "the caller's error response sets its own content type")
		assert.Zero(t, rec.Body.Len())
	})

	t.Run("error after the response started ends the response", func(t *testing.T) {
		t.Parallel()
		c, rec := newStreamContext(context.Background())

		err := stream(c, echo.MIMEApplicationJSON, func(w io.Writer) error {
			_, _ = w.Write(chunk)
			return errors.New("db failed")
		})

		assert.NoError(t, err, "the status can no longer change, so there is nothing for the caller to do")
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, chunk, rec.Body.Bytes())
	})

	t.Run("client disconnect after the response started", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())
		c, _ := newStreamContext(ctx)

		err := stream(c, echo.MIMEApplicationJSON, func(w io.Writer) error {
			_, _ = w.Write(chunk)
			cancel()
			return ctx.Err()
		})

		assert.NoError(t, err)
	})

	t.Run("empty body still sends status and content type", func(t *testing.T) {
		t.Parallel()
		c, rec := newStreamContext(context.Background())

		err := stream(c, "application/geo+json", func(io.Writer) error { return nil })

		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "application/geo+json", rec.Header().Get(echo.HeaderContentType))
		assert.Zero(t, rec.Body.Len())
	})
}

// TestStream_OverHTTP runs stream() behind a real HTTP server with the same
// Recover and Gzip middleware the app uses, to check what a client sees.
func TestStream_OverHTTP(t *testing.T) {
	t.Parallel()

	chunk := make([]byte, 64*1024)
	_, _ = rand.New(rand.NewSource(1)).Read(chunk)

	e := echo.New()
	e.Use(middleware.Recover(), middleware.Gzip())
	e.GET("/ok", func(c *echo.Context) error {
		return stream(c, "text/csv", func(w io.Writer) error {
			for range 4 {
				if _, err := w.Write(chunk); err != nil {
					return err
				}
			}
			return nil
		})
	})
	srv := httptest.NewServer(e)
	t.Cleanup(srv.Close)

	for _, gzip := range []bool{false, true} {
		t.Run(fmt.Sprintf("gzip=%v", gzip), func(t *testing.T) {
			t.Parallel()

			req, err := http.NewRequest(http.MethodGet, srv.URL+"/ok", nil)
			require.NoError(t, err)
			if !gzip {
				// setting the header turns off the transport's transparent gzip
				req.Header.Set("Accept-Encoding", "identity")
			}
			res, err := srv.Client().Do(req)
			require.NoError(t, err)
			t.Cleanup(func() { _ = res.Body.Close() })

			assert.Equal(t, http.StatusOK, res.StatusCode)
			assert.Equal(t, "text/csv", res.Header.Get(echo.HeaderContentType))
			assert.Equal(t, gzip, res.Uncompressed, "response compressed by the gzip middleware")
			assert.EqualValues(t, -1, res.ContentLength, "length unknown up front: the body is streamed")

			body, err := io.ReadAll(res.Body)
			require.NoError(t, err)
			assert.Equal(t, bytes.Repeat(chunk, 4), body)
		})
	}
}

// --- handler tests on a large model ---

// more than two export batches (1000 items each)
const largeModelSize = 2500

type exportFixture struct {
	ctx                  context.Context
	ctrl                 *Controller
	wAlias, pAlias, mKey string
}

func setupExportTest(t testing.TB, items int) exportFixture {
	t.Helper()
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	ws := workspace.New().ID(wid).Name("ws").Members(map[accountdomain.UserID]workspace.Member{}).MustBuild()

	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mk := id.RandomKey()
	m := model.New().NewID().Schema(sid).Key(mk).Project(pid).MustBuild()

	a11y := project.NewAccessibility(project.VisibilityPrivate, project.NewPublicationSettings(project.ModelIDList{m.ID()}, false), nil, nil)
	p := project.New().ID(pid).Workspace(wid).Alias(pid.String()).Name("p").Accessibility(a11y).MustBuild()

	textField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("title")).MustBuild()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}
	geoField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Key(id.NewKey("location")).MustBuild()
	s := schema.New().ID(sid).Workspace(wid).Project(pid).Fields(schema.FieldList{textField, geoField}).MustBuild()

	db := memory.New()
	wsRepo := accountmemory.NewWorkspace()
	require.NoError(t, wsRepo.Save(ctx, ws))
	require.NoError(t, db.Project.Save(ctx, p))
	require.NoError(t, db.Schema.Save(ctx, s))
	require.NoError(t, db.Model.Save(ctx, m))

	uid := accountdomain.NewUserID()
	for i := range items {
		it := item.New().NewID().Model(m.ID()).Schema(sid).Project(pid).Thread(id.NewThreadID().Ref()).User(uid).
			Fields([]*item.Field{
				item.NewField(textField.ID(), value.TypeText.Value(fmt.Sprintf("item, \"%d\"", i)).AsMultiple(), nil),
				item.NewField(geoField.ID(), value.TypeGeometryObject.Value(fmt.Sprintf(`{"type":"Point","coordinates":[%d,%d.5]}`, i%180, i%90)).AsMultiple(), nil),
			}).MustBuild()
		require.NoError(t, db.Item.Save(ctx, it))
		require.NoError(t, db.Item.UpdateRef(ctx, it.ID(), version.Public, version.Latest.OrVersion().Ref()))
	}

	ar := &accountrepo.Container{Workspace: wsRepo}
	uc := interactor.New(db, nil, ar, nil, interactor.ContainerConfig{})

	op := &usecase.Operator{AcOperator: &accountusecase.Operator{}, Anonymous: true}
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUsecases(ctx, &uc)
	ctrl := NewController(wsRepo, db.Project, &uc)
	ctx = AttachController(ctx, ctrl)

	return exportFixture{ctx: ctx, ctrl: ctrl, wAlias: wid.String(), pAlias: pid.String(), mKey: mk.String()}
}

// maxSingleWrite bounds a single write to the response. The exporters write
// item by item, so no write comes close; the old handler wrote the whole
// export at once.
const maxSingleWrite = 64 * 1024

// writeRecorder records every write the handler makes to the response.
type writeRecorder struct {
	*httptest.ResponseRecorder
	writes   int
	maxWrite int
}

func (w *writeRecorder) Write(p []byte) (int, error) {
	w.writes++
	w.maxWrite = max(w.maxWrite, len(p))
	return w.ResponseRecorder.Write(p)
}

func serve(ctx context.Context, target string, h func(c *echo.Context) error) (*writeRecorder, error) {
	req := httptest.NewRequest(http.MethodGet, target, nil).WithContext(ctx)
	rec := &writeRecorder{ResponseRecorder: httptest.NewRecorder()}
	c := echo.New().NewContext(req, rec)
	return rec, h(c)
}

func TestItems_Streaming(t *testing.T) {
	t.Parallel()
	f := setupExportTest(t, largeModelSize)

	tests := []struct {
		ext         string
		query       string
		contentType string
	}{
		{ext: "", contentType: "application/json"},
		{ext: "json", contentType: "application/json"},
		{ext: "csv", contentType: "text/csv"},
		{ext: "geojson", contentType: "application/geo+json"},
		{ext: "json", query: "?limit=10&page=2", contentType: "application/json"},
		{ext: "json", query: "?offset=990&limit=20", contentType: "application/json"},
	}

	for _, tt := range tests {
		t.Run(tt.ext+tt.query, func(t *testing.T) {
			// the output of the old handler: the whole export buffered in memory
			c, _ := newStreamContext(f.ctx)
			c.Request().URL.RawQuery = strings.TrimPrefix(tt.query, "?")
			p := paginationFrom(c)
			var want bytes.Buffer
			require.NoError(t, f.ctrl.GetPublicItems(f.ctx, f.wAlias, f.pAlias, f.mKey, tt.ext, p, &want))

			rec, err := serve(f.ctx, "/"+tt.query, func(c *echo.Context) error {
				return Items(c, f.wAlias, f.pAlias, f.mKey, tt.ext)
			})

			require.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, tt.contentType, rec.Header().Get(echo.HeaderContentType))
			if p != nil && tt.ext != "csv" && tt.ext != "geojson" {
				// with pagination the JSON exporter appends several props from a map
				// (hasMore, page, offset, ...), so their order differs between runs
				assert.JSONEq(t, want.String(), rec.Body.String())
			} else {
				assert.Equal(t, want.String(), rec.Body.String(), "streamed output must be identical to the buffered output")
			}

			if p == nil {
				// the body was sent in pieces, never as one big buffer
				assert.Greater(t, rec.writes, 1)
				assert.LessOrEqual(t, rec.maxWrite, maxSingleWrite)
			}
		})
	}

	t.Run("unpaginated json contains every item", func(t *testing.T) {
		rec, err := serve(f.ctx, "/", func(c *echo.Context) error {
			return Items(c, f.wAlias, f.pAlias, f.mKey, "json")
		})
		require.NoError(t, err)

		var res struct {
			Results    []map[string]any `json:"results"`
			TotalCount int              `json:"totalCount"`
		}
		require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &res))
		assert.Len(t, res.Results, largeModelSize)
		assert.Equal(t, largeModelSize, res.TotalCount)
	})

	t.Run("unknown model still returns 404", func(t *testing.T) {
		rec, err := serve(f.ctx, "/", func(c *echo.Context) error {
			return Items(c, f.wAlias, f.pAlias, "unknown", "json")
		})
		require.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, rec.Code)
		assert.Equal(t, echo.MIMEApplicationJSON, rec.Header().Get(echo.HeaderContentType))
		assert.JSONEq(t, `{"error":"not found"}`, rec.Body.String())
	})
}

// TestItems_BatchBoundaries checks sizes around the export batch size (1000).
func TestItems_BatchBoundaries(t *testing.T) {
	t.Parallel()

	for _, n := range []int{0, 1, 1000, 1001} {
		t.Run(fmt.Sprintf("items=%d", n), func(t *testing.T) {
			t.Parallel()
			f := setupExportTest(t, n)

			for _, ext := range []string{"json", "csv", "geojson"} {
				var want bytes.Buffer
				require.NoError(t, f.ctrl.GetPublicItems(f.ctx, f.wAlias, f.pAlias, f.mKey, ext, nil, &want))

				rec, err := serve(f.ctx, "/", func(c *echo.Context) error {
					return Items(c, f.wAlias, f.pAlias, f.mKey, ext)
				})
				require.NoError(t, err)
				assert.Equal(t, http.StatusOK, rec.Code, ext)
				assert.Equal(t, want.String(), rec.Body.String(), ext)
			}

			rec, err := serve(f.ctx, "/", func(c *echo.Context) error {
				return Items(c, f.wAlias, f.pAlias, f.mKey, "json")
			})
			require.NoError(t, err)
			var res struct {
				Results    []map[string]any `json:"results"`
				TotalCount int              `json:"totalCount"`
			}
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &res))
			assert.Len(t, res.Results, n)
			assert.Equal(t, n, res.TotalCount)
		})
	}
}

// discardResponseWriter drops the body, so the benchmark measures only what
// the handler itself holds in memory.
type discardResponseWriter struct{ h http.Header }

func (w *discardResponseWriter) Header() http.Header         { return w.h }
func (w *discardResponseWriter) Write(p []byte) (int, error) { return len(p), nil }
func (w *discardResponseWriter) WriteHeader(int)             {}

func benchServe(ctx context.Context, h func(c *echo.Context) error) {
	req := httptest.NewRequest(http.MethodGet, "/", nil).WithContext(ctx)
	c := echo.New().NewContext(req, &discardResponseWriter{h: http.Header{}})
	_ = h(c)
}

// BenchmarkItems_Unpaginated compares the old buffered handler with the
// streaming one, to check that streaming does not slow the export down.
// Note that B/op counts all allocations (mostly per-item encoding), not the
// peak memory held; that the body is never held in full is checked by
// TestItems_Streaming (no single write larger than maxSingleWrite).
func BenchmarkItems_Unpaginated(b *testing.B) {
	f := setupExportTest(b, largeModelSize)

	b.Run("buffered", func(b *testing.B) {
		for b.Loop() {
			benchServe(f.ctx, func(c *echo.Context) error {
				var buf bytes.Buffer
				if err := f.ctrl.GetPublicItems(f.ctx, f.wAlias, f.pAlias, f.mKey, "json", nil, &buf); err != nil {
					return err
				}
				return c.Blob(http.StatusOK, echo.MIMEApplicationJSON, buf.Bytes())
			})
		}
	})

	b.Run("streaming", func(b *testing.B) {
		for b.Loop() {
			benchServe(f.ctx, func(c *echo.Context) error {
				return Items(c, f.wAlias, f.pAlias, f.mKey, "json")
			})
		}
	})
}
