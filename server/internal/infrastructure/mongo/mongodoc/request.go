package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type RequestDocument struct {
	ID          string
	Workspace   string
	Project     string
	Items       []RequestItem
	Title       string
	Description string
	CreatedBy   string
	Reviewers   []string
	State       string
	UpdatedAt   time.Time
	ApprovedAt  *time.Time
	ClosedAt    *time.Time
	Thread      string
}

type RequestItem struct {
	Item    string
	Version version.Version
}

type RequestConsumer = mongox.SliceFuncConsumer[*RequestDocument, *request.Request]

func NewRequestConsumer() *RequestConsumer {
	return NewComsumer[*RequestDocument, *request.Request]()
}

func NewRequest(r *request.Request) (*RequestDocument, string) {
	rid := r.ID().String()
	doc, id := &RequestDocument{
		ID:        rid,
		Workspace: r.Workspace().String(),
		Project:   r.Project().String(),
		Items: lo.Map(r.Items(), func(i *request.Item, _ int) RequestItem {
			return RequestItem{
				Item:    i.Item().String(),
				Version: i.Version(),
			}
		}),
		Title:       r.Title(),
		Description: r.Description(),
		CreatedBy:   r.CreatedBy().String(),
		Reviewers: lo.Map(r.Reviewers(), func(u id.UserID, i int) string {
			return u.String()
		}),
		State:      r.State().String(),
		UpdatedAt:  r.UpdatedAt(),
		ApprovedAt: r.ApprovedAt(),
		ClosedAt:   r.ClosedAt(),
		Thread:     r.Thread().String(),
	}, rid

	return doc, id
}

func (d *RequestDocument) Model() (*request.Request, error) {
	rid, err := id.RequestIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	wid, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}
	uid, err := id.UserIDFrom(d.CreatedBy)
	if err != nil {
		return nil, err
	}
	reviewers, err := id.UserIDListFrom(d.Reviewers)
	if err != nil {
		return nil, err
	}
	items, err := util.TryMap(d.Items, func(ri RequestItem) (*request.Item, error) {
		iid, err := id.ItemIDFrom(ri.Item)
		if err != nil {
			return nil, err
		}
		return request.NewItem(iid, ri.Version)
	})
	if err != nil {
		return nil, err
	}

	tid, err := id.ThreadIDFrom(d.Thread)
	if err != nil {
		return nil, err
	}

	builder := request.New().
		ID(rid).
		Project(pid).
		Workspace(wid).
		CreatedBy(uid).
		Items(items).
		Title(d.Title).
		Description(d.Description).
		State(request.StateFrom(d.State)).
		UpdatedAt(d.UpdatedAt).
		ClosedAt(d.ClosedAt).
		ApprovedAt(d.ApprovedAt).
		Reviewers(reviewers).
		Thread(tid)

	return builder.Build()
}
