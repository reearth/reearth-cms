package interactor

import (
	"context"
	"io"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func jsonRecords(n int) string {
	return "[" + strings.TrimSuffix(strings.Repeat(`{"name":"x"},`, n), ",") + "]"
}

func geoJSONFeatures(n int) string {
	feature := `{"type":"Feature","geometry":{"type":"Point","coordinates":[139.7,35.6]},"properties":{"name":"x"}},`
	return `{"type":"FeatureCollection","features":[` + strings.TrimSuffix(strings.Repeat(feature, n), ",") + `]}`
}

func TestItem_RunImportJob_JSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		format       interfaces.ImportFormatType
		mutateSchema bool
		reader       func() io.Reader
		wantStatus   job.Status
		wantTotal    int
	}{
		{
			name:       "geojson",
			format:     interfaces.ImportFormatTypeGeoJSON,
			reader:     func() io.Reader { return strings.NewReader(geoJSONFeatures(2)) },
			wantStatus: job.StatusCompleted,
			wantTotal:  2,
		},
		{
			name:         "json with mutate schema",
			format:       interfaces.ImportFormatTypeJSON,
			mutateSchema: true,
			reader:       func() io.Reader { return strings.NewReader(`[{"title":"a"},{"title":"b"},{"title":"c"}]`) },
			wantStatus:   job.StatusCompleted,
			wantTotal:    3,
		},
		{
			name:   "non-object record fails before saving",
			format: interfaces.ImportFormatTypeJSON,
			reader: func() io.Reader {
				return strings.NewReader("[" + strings.Repeat(`{"name":"x"},`, chunkSize+1) + "1]")
			},
			wantStatus: job.StatusFailed,
		},
		{
			name:       "json",
			format:     interfaces.ImportFormatTypeJSON,
			reader:     func() io.Reader { return strings.NewReader(jsonRecords(3)) },
			wantStatus: job.StatusCompleted,
			wantTotal:  3,
		},
		{
			name:       "too many records fails before saving",
			format:     interfaces.ImportFormatTypeJSON,
			reader:     func() io.Reader { return strings.NewReader(jsonRecords(interfaces.MaxImportRecordCount + 1)) },
			wantStatus: job.StatusFailed,
		},
		{
			name:       "non-rewindable reader fails",
			format:     interfaces.ImportFormatTypeJSON,
			reader:     func() io.Reader { return io.MultiReader(strings.NewReader(jsonRecords(3))) },
			wantStatus: job.StatusFailed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			itemUC, db, sp, op := csvImportTestEnv(t, "name")
			m := lo.Must(db.Model.FindBySchema(ctx, sp.Schema().ID()))

			j := job.New().
				NewID().
				Type(job.TypeImport).
				Project(sp.Schema().Project()).
				User(*op.AcOperator.User).
				MustBuild()
			lo.Must0(db.Job.Save(ctx, j))

			param := interfaces.ImportItemsAsyncParam{
				ModelID:      m.ID(),
				SP:           sp,
				Strategy:     interfaces.ImportStrategyTypeInsert,
				Format:       tt.format,
				MutateSchema: tt.mutateSchema,
				Reader:       tt.reader(),
			}
			if tt.format == interfaces.ImportFormatTypeGeoJSON {
				geo := schema.NewField(schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}).TypeProperty()).
					NewID().Key(id.NewKey("location")).MustBuild()
				s := sp.Schema()
				s.AddField(geo)
				lo.Must0(db.Schema.Save(ctx, s))
				param.SP = *schema.NewPackage(s, nil, nil, nil)
				param.GeoField = new("location")
			}

			itemUC.runImportJob(j.ID(), param, op)

			got, err := db.Job.FindByID(ctx, j.ID())
			assert.NoError(t, err)
			assert.Equal(t, tt.wantStatus, got.Status())

			if tt.wantStatus != job.StatusCompleted {
				items, _, err := db.Item.FindBySchema(ctx, sp.Schema().ID(), nil, nil, nil)
				assert.NoError(t, err)
				assert.Empty(t, items)
				return
			}
			result, err := got.ImportResult()
			assert.NoError(t, err)
			assert.Equal(t, tt.wantTotal, result.Total)
			assert.Equal(t, tt.wantTotal, result.Inserted)
		})
	}
}
