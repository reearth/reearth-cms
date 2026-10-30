package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Integration struct {
	data *util.SyncMap[id.IntegrationID, *integration.Integration]
	err  error
}

func NewIntegration() repo.Integration {
	return &Integration{
		data: &util.SyncMap[id.IntegrationID, *integration.Integration]{},
	}
}

func (r *Integration) FindByID(_ context.Context, iId id.IntegrationID) (*integration.Integration, error) {
	if r.err != nil {
		return nil, r.err
	}

	if i, ok := r.data.Load(iId); ok {
		return i.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Integration) FindByToken(_ context.Context, token string) (*integration.Integration, error) {
	if r.err != nil {
		return nil, r.err
	}

	i := r.data.Find(func(_ id.IntegrationID, i *integration.Integration) bool {
		return i.Token() == token
	})

	if i != nil {
		return i.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Integration) FindByIDs(_ context.Context, iIds id.IntegrationIDList) (integration.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if len(iIds) == 0 {
		return nil, nil
	}

	// the result keeps the order of the given IDs, as mongo does
	res := make(integration.List, 0, len(iIds))
	for _, iId := range iIds {
		if i, ok := r.data.Load(iId); ok {
			res = append(res, i.Clone())
		}
	}
	return res, nil
}

func (r *Integration) FindByUser(_ context.Context, uID accountdomain.UserID) (integration.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k id.IntegrationID, i *integration.Integration) bool {
		return i.Developer() == uID
	})

	return integration.List(result).SortByID().Clone(), nil
}

func (r *Integration) Save(_ context.Context, i *integration.Integration) error {
	if r.err != nil {
		return r.err
	}

	if err := i.Validate(); err != nil {
		return err
	}
	r.data.Store(i.ID(), i.Clone())
	return nil
}

func (r *Integration) Remove(_ context.Context, iId id.IntegrationID) error {
	if r.err != nil {
		return r.err
	}

	if _, ok := r.data.Load(iId); ok {
		r.data.Delete(iId)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *Integration) RemoveMany(_ context.Context, iIDs id.IntegrationIDList) error {
	if r.err != nil {
		return r.err
	}

	r.data.DeleteAll(iIDs...)
	return nil
}

func SetIntegrationError(r repo.Integration, err error) {
	r.(*Integration).err = err
}
