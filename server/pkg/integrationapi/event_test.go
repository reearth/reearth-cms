package integrationapi

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
)

func Test_NewOperator(t *testing.T) {

	uid := accountdomain.NewUserID()
	integrationID := id.NewIntegrationID()
	opUser := operator.OperatorFromUser(uid)
	opIntegration := operator.OperatorFromIntegration(integrationID)
	opMachine := operator.OperatorFromMachine()
	tests := []struct {
		name  string
		input operator.Operator
		want  Operator
	}{
		{
			name:  "success user operator",
			input: opUser,
			want: Operator{
				User: &OperatorUser{
					ID: uid.String(),
				},
			},
		},
		{
			name:  "success integration operator",
			input: opIntegration,
			want: Operator{
				Integration: &OperatorIntegration{
					ID: integrationID.String(),
				},
			},
		},
		{
			name:  "success machine operator",
			input: opMachine,
			want: Operator{
				Machine: &OperatorMachine{},
			},
		},
		{
			name:  "success unknown operator",
			input: operator.Operator{},
			want:  Operator{},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			result := NewOperator(test.input)
			assert.Equal(t, result, test.want)
		})

	}
}

func TestNewEventWith(t *testing.T) {
	mockTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	u := user.New().NewID().Email("hoge@example.com").Name("John").MustBuild()
	a := asset.New().NewID().Project(project.NewID()).Size(100).NewUUID().
		CreatedByUser(u.ID()).Thread(id.NewThreadID().Ref()).MustBuild()
	eID1 := event.NewID()
	prj := event.Project{
		ID:    "testID",
		Alias: "testAlias",
	}

	ev := event.New[any]().ID(eID1).Timestamp(mockTime).Type(event.AssetCreate).Operator(operator.OperatorFromUser(u.ID())).Object(a).Project(&prj).MustBuild()
	ev1 := event.New[any]().ID(eID1).Timestamp(mockTime).Type(event.Type("test")).Operator(operator.OperatorFromUser(u.ID())).Object("test").Project(&prj).MustBuild()
	d1, _ := New(ev, "test")
	d2, _ := New(ev.Object(), "test")
	type args struct {
		event    *event.Event[any]
		override any
		v        string
	}
	tests := []struct {
		name    string
		args    args
		want    Event
		wantErr error
	}{
		{
			name: "success",
			args: args{
				event:    ev,
				override: ev,
				v:        "test",
			},
			want: Event{
				ID:        ev.ID().String(),
				Type:      string(ev.Type()),
				Timestamp: ev.Timestamp(),
				Data:      d1,
				Project: &ProjectIdAlias{
					ID:    ev.Project().ID,
					Alias: ev.Project().Alias,
				},
				Operator: NewOperator(ev.Operator()),
			},
			wantErr: nil,
		},
		{
			name: "success when override is nil",
			args: args{
				event:    ev,
				override: nil,
				v:        "test",
			},
			want: Event{
				ID:        ev.ID().String(),
				Type:      string(ev.Type()),
				Timestamp: ev.Timestamp(),
				Data:      d2,
				Project: &ProjectIdAlias{
					ID:    ev.Project().ID,
					Alias: ev.Project().Alias,
				},
				Operator: NewOperator(ev.Operator()),
			},
			wantErr: nil,
		},
		{
			name: "error new returns error",
			args: args{
				event:    ev,
				override: ev1,
				v:        "",
			},
			want:    Event{},
			wantErr: ErrUnsupportedEntity,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			result, err := NewEventWith(test.args.event, test.args.override, test.args.v)
			assert.Equal(t, result, test.want)
			assert.Equal(t, err, test.wantErr)
		})
	}
}
