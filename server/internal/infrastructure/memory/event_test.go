package memory

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestEventRepo_Save(t *testing.T) {
	now := time.Now()
	u := user.New().NewID().Email("hoge@example.com").Name("John").MustBuild()
	a := asset.New().NewID().Project(project.NewID()).Size(100).CreatedBy(u.ID()).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).MustBuild()
	eID1 := event.NewID()
	ev := event.New[*asset.Asset]().ID(eID1).Timestamp(now).Type("asset.create").Operator(event.OperatorFromUser(u.ID())).Object(a).MustBuild()

	tests := []struct {
		name    string
		seeds   []*event.Event[*asset.Asset]
		arg     event.ID
		want    []*event.Event[*asset.Asset]
		wantErr error
		mockErr bool
	}{
		{
			name:    "Saved",
			seeds:   []*event.Event[*asset.Asset]{},
			arg:     eID1,
			want:    []*event.Event[*asset.Asset]{},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Saved same data",
			seeds:   []*event.Event[*asset.Asset]{ev},
			arg:     eID1,
			want:    nil,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewEvent()
			if tc.mockErr {
				SetEventError(r, tc.wantErr)
			}
			for _, e := range tc.seeds {
				//TODO: this fail
				ev := any(e.Clone()).(*event.Event[any])
				err := r.Save(context.Background(), ev)
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			// err := r.Remove(ctx, tc.arg)
			// if tc.wantErr != nil {
			// 	assert.ErrorIs(t, err, tc.wantErr)
			// 	return
			// }

			assert.Equal(t, []*event.Event[*asset.Asset](tc.want), r.(*Event).data.Values())
		})
	}
}
