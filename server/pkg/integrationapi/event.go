package integrationapi

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/operator"
)

type Event struct {
	ID        string          `json:"eventId"`
	Type      string          `json:"type"`
	Timestamp time.Time       `json:"timestamp"`
	Data      any             `json:"data"`
	Project   *ProjectIdAlias `json:"project"`
	Operator  Operator        `json:"operator"`
}

type Operator struct {
	User        *OperatorUser        `json:"user,omitempty"`
	Integration *OperatorIntegration `json:"integration,omitempty"`
	Machine     *OperatorMachine     `json:"machine,omitempty"`
}

type OperatorUser struct {
	ID string `json:"id"`
}

type OperatorIntegration struct {
	ID string `json:"id"`
}

type OperatorMachine struct{}

type ProjectIdAlias struct {
	ID    string `json:"id"`
	Alias string `json:"alias"`
}

func NewEvent(e *event.Event[any], v string) (Event, error) {
	return NewEventWith(e, nil, v)
}

func NewEventWith(e *event.Event[any], override any, v string) (Event, error) {
	if override == nil {
		override = e.Object()
	}

	d, err := New(override, v)
	if err != nil {
		return Event{}, err
	}

	var prj *ProjectIdAlias
	if p := e.Project(); p != nil {
		prj = &ProjectIdAlias{
			ID:    p.ID,
			Alias: p.Alias,
		}
	}

	return Event{
		ID:        e.ID().String(),
		Type:      string(e.Type()),
		Timestamp: e.Timestamp(),
		Data:      d,
		Project:   prj,
		Operator:  NewOperator(e.Operator()),
	}, nil
}

func NewOperator(o operator.Operator) Operator {
	if i := o.Integration(); i != nil {
		return Operator{
			Integration: &OperatorIntegration{
				ID: i.String(),
			},
		}
	}

	if u := o.User(); u != nil {
		return Operator{
			User: &OperatorUser{
				ID: u.String(),
			},
		}
	}

	if o.Machine() {
		return Operator{
			Machine: &OperatorMachine{},
		}
	}

	return Operator{}
}
