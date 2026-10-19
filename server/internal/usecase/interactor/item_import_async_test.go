package interactor

import (
	"context"
	"io"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func jsonRecords(n int) string {
	return "[" + strings.TrimSuffix(strings.Repeat(`{"name":"x"},`, n), ",") + "]"
}

func TestItem_RunImportJob_JSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		format     interfaces.ImportFormatType
		reader     func() io.Reader
		wantStatus job.Status
		wantTotal  int
	}{
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

			itemUC.runImportJob(j.ID(), interfaces.ImportItemsAsyncParam{
				ModelID:  m.ID(),
				SP:       sp,
				Strategy: interfaces.ImportStrategyTypeInsert,
				Format:   tt.format,
				Reader:   tt.reader(),
			}, op)

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
