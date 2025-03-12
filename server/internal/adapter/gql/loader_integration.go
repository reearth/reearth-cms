package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type IntegrationLoader struct {
	usecase interfaces.Integration
}

func NewIntegrationLoader(usecase interfaces.Integration) *IntegrationLoader {
	return &IntegrationLoader{usecase: usecase}
}

func (c *IntegrationLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Integration, []error) {
	iIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Integration])
	if err != nil {
		return nil, []error{err}
	}

	op := getOperator(ctx)

	res, err := c.usecase.FindByIDs(ctx, iIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(iIDs, func(id integration.ID, _ int) *gqlmodel.Integration {
		i, ok := lo.Find(res, func(i *integration.Integration) bool {
			return i != nil && i.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToIntegration(i, op.AcOperator.User)
	}), nil
}

func (c *IntegrationLoader) FindByMe(ctx context.Context) ([]*gqlmodel.Integration, error) {
	op := getOperator(ctx)

	res, err := c.usecase.FindByMe(ctx, op)
	if err != nil {
		return nil, err
	}
	integrations := make([]*gqlmodel.Integration, 0, len(res))
	for _, i := range res {
		integrations = append(integrations, gqlmodel.ToIntegration(i, op.AcOperator.User))
	}
	return integrations, nil
}
