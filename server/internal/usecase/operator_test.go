package usecase

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
)

func TestOperator_EventOperator(t *testing.T) {
	uId := accountdomain.NewUserID()
	op := Operator{
		Integration: nil,
		AcOperator: &accountusecase.Operator{
			User: &uId,
		},
	}

	eOp := op.Operator()

	assert.NotNil(t, eOp.User())
	assert.Nil(t, eOp.Integration())
	assert.Equal(t, &uId, eOp.User())

	iId := id.NewIntegrationID()

	op = Operator{
		Integration: &iId,
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
	}

	eOp = op.Operator()

	assert.Nil(t, eOp.User())
	assert.NotNil(t, eOp.Integration())
	assert.Equal(t, &iId, eOp.Integration())
}
