package memory

import (
	"cmp"
	"context"
	"slices"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Request struct {
	data *util.SyncMap[request.ID, *request.Request]
	err  error
	f    repo.ProjectFilter
}

func NewRequest() repo.Request {
	return &Request{
		data: &util.SyncMap[id.RequestID, *request.Request]{},
	}
}

func (r *Request) Filtered(f repo.ProjectFilter) repo.Request {
	return &Request{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *Request) FindByID(_ context.Context, rid id.RequestID) (*request.Request, error) {
	if r.err != nil {
		return nil, r.err
	}

	if req, ok := r.data.Load(rid); ok && r.canRead(req) {
		return req.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Request) FindByIDs(_ context.Context, ids id.RequestIDList) (request.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if len(ids) == 0 {
		return nil, nil
	}

	// requests are returned in the order of the given IDs
	res := make(request.List, 0, len(ids))
	for _, rid := range ids {
		if req, ok := r.data.Load(rid); ok && r.canRead(req) {
			res = append(res, req.Clone())
		}
	}
	return res, nil
}

func (r *Request) FindByProject(_ context.Context, pid id.ProjectID, filter repo.RequestFilter, sort *usecasex.Sort, page *usecasex.Pagination) (request.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	result := r.data.FindAll(func(_ request.ID, v *request.Request) bool {
		return v.Project() == pid && matchRequest(v, filter, matchRequestKeyword)
	})

	res, pi, err := r.pager().paginate(result, sort, page)
	if err != nil {
		return nil, nil, err
	}
	return request.List(res).Clone(), pi, nil
}

func (r *Request) FindByItems(_ context.Context, list id.ItemIDList, filter *repo.RequestFilter) (request.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	f := lo.FromPtr(filter)
	res := r.data.FindAll(func(_ request.ID, v *request.Request) bool {
		return r.canRead(v) &&
			slices.ContainsFunc(v.Items(), func(i *request.Item) bool { return list.Has(i.Item()) }) &&
			// unlike FindByProject, the keyword matches the title alone
			matchRequest(v, f, func(v *request.Request, keyword string) bool {
				return requestContainsFold(v.Title(), keyword)
			})
	})
	if len(res) == 0 {
		return nil, nil
	}

	// mongo returns the requests in no particular order
	slices.SortFunc(res, func(a, b *request.Request) int { return a.ID().Compare(b.ID()) })
	return request.List(res).Clone(), nil
}

func (r *Request) Save(_ context.Context, a *request.Request) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(a.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(a.ID(), a.Clone())
	return nil
}

func (r *Request) SaveAll(_ context.Context, pid id.ProjectID, requests request.List) error {
	if r.err != nil {
		return r.err
	}

	if len(requests) == 0 {
		return nil
	}

	if !r.f.CanWrite(pid) {
		return repo.ErrOperationDenied
	}
	if lo.ContainsBy(requests, func(req *request.Request) bool { return req != nil && req.Project() != pid }) {
		return rerror.ErrInvalidParams
	}

	entries := map[id.RequestID]*request.Request{}
	for _, req := range requests {
		if req != nil {
			entries[req.ID()] = req.Clone()
		}
	}
	r.data.StoreAll(entries)
	return nil
}

func (r *Request) canRead(req *request.Request) bool {
	return r.f.Readable == nil || r.f.Readable.Has(req.Project())
}

func (r *Request) pager() pager[*request.Request] {
	text := func(f func(*request.Request) string) compareFunc[*request.Request] {
		return func(a, b *request.Request) int { return strings.Compare(f(a), f(b)) }
	}
	// mongo stores times in milliseconds, so finer differences tie, and a
	// missing time sorts first
	timeRef := func(f func(*request.Request) *time.Time) compareFunc[*request.Request] {
		return func(a, b *request.Request) int {
			ta, tb := f(a), f(b)
			if ta == nil || tb == nil {
				return cmp.Compare(lo.Ternary(ta == nil, 0, 1), lo.Ternary(tb == nil, 0, 1))
			}
			return cmp.Compare(ta.UnixMilli(), tb.UnixMilli())
		}
	}
	// the sort key is the name of a mongo document field; any other key
	// sorts by ID alone, as mongo does for a missing field
	return pager[*request.Request]{
		id: func(v *request.Request) string { return v.ID().String() },
		keys: map[string]compareFunc[*request.Request]{
			"workspace":   text(func(v *request.Request) string { return v.Workspace().String() }),
			"project":     text(func(v *request.Request) string { return v.Project().String() }),
			"title":       text((*request.Request).Title),
			"description": text((*request.Request).Description),
			"createdby":   text(func(v *request.Request) string { return v.CreatedBy().String() }),
			"state":       text(func(v *request.Request) string { return v.State().String() }),
			"updatedat": timeRef(func(v *request.Request) *time.Time {
				return new(v.UpdatedAt())
			}),
			"approvedat": timeRef((*request.Request).ApprovedAt),
			"closedat":   timeRef((*request.Request).ClosedAt),
		},
		find: func(c usecasex.Cursor) (*request.Request, bool) {
			rid, err := id.RequestIDFrom(string(c))
			if err != nil {
				return nil, false
			}
			return r.data.Load(rid)
		},
	}
}

func matchRequest(v *request.Request, f repo.RequestFilter, matchKeyword func(*request.Request, string) bool) bool {
	if f.State != nil && !slices.Contains(f.State, v.State()) {
		return false
	}
	if f.CreatedBy != nil && v.CreatedBy() != *f.CreatedBy {
		return false
	}
	if f.Reviewer != nil && !v.Reviewers().Has(*f.Reviewer) {
		return false
	}
	return f.Keyword == nil || matchKeyword(v, *f.Keyword)
}

func matchRequestKeyword(v *request.Request, keyword string) bool {
	return requestContainsFold(v.Title(), keyword) ||
		requestContainsFold(v.Description(), keyword) ||
		v.ID().String() == keyword ||
		slices.ContainsFunc(v.Items(), func(i *request.Item) bool { return i.Item().String() == keyword })
}

func requestContainsFold(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

func SetRequestError(r repo.Request, err error) {
	r.(*Request).err = err
}
