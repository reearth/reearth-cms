package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"golang.org/x/exp/slices"
)

type ItemStatusLoader struct {
	requestUsecase interfaces.Request
}

func NewItemStatusLoader(requestUsecase interfaces.Request) *ItemStatusLoader {
	return &ItemStatusLoader{requestUsecase: requestUsecase}
}

type ItemStatusDataLoader interface {
	Load(gqlmodel.ID) ([]gqlmodel.ItemStatus, error)
	LoadAll([]gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error)
}

func (c *ItemStatusLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error) {
	op := getOperator(ctx)
	iIds, err := gqlmodel.ToIDs[id.Item](ids)
	if err != nil {
		return nil, []error{err}
	}
	var res [][]gqlmodel.ItemStatus
	for _, iId := range iIds {

		requests, err := c.requestUsecase.FindByItem(ctx, iId, op)
		if err != nil {
			return nil, []error{err}
		}

		var statuses []gqlmodel.ItemStatus
		for _, req := range requests {
			switch req.State() {
			case request.StateWaiting:
				if !slices.Contains(statuses, gqlmodel.ItemStatusReview) {
					statuses = append(statuses, gqlmodel.ItemStatusReview)
				}
			case request.StateApproved:
				if !slices.Contains(statuses, gqlmodel.ItemStatusPublic) {
					statuses = append(statuses, gqlmodel.ItemStatusPublic)
				}
			}
		}
		if len(statuses) == 0 {
			statuses = append(statuses, gqlmodel.ItemStatusDraft)
		}
		res = append(res, statuses)
	}

	return res, nil
}

func (c *ItemStatusLoader) DataLoader(ctx context.Context) ItemStatusDataLoader {
	return gqldataloader.NewItemStatusLoader(gqldataloader.ItemStatusLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ItemStatusLoader) OrdinaryDataLoader(ctx context.Context) ItemStatusDataLoader {
	return &ordinaryItemStatusLoader{
		fetch: func(keys []gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryItemStatusLoader struct {
	fetch func(keys []gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error)
}

func (l *ordinaryItemStatusLoader) Load(key gqlmodel.ID) ([]gqlmodel.ItemStatus, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryItemStatusLoader) LoadAll(keys []gqlmodel.ID) ([][]gqlmodel.ItemStatus, []error) {
	return l.fetch(keys)
}
