package event

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestOperator(t *testing.T) {
	uID := user.NewID()
	iID := NewIntegrationIDForTest()

	uOp := OperatorFromUser(uID)
	iOp := OperatorFromIntegration(iID)

	assert.NotNil(t, uOp)
	assert.NotNil(t, iOp)

	assert.Equal(t, uID, *uOp.User())
	assert.Nil(t, uOp.Integration())

	assert.Equal(t, iID, *iOp.Integration())
	assert.Nil(t, iOp.User())

	assert.True(t, uOp.validate())
	assert.True(t, iOp.validate())

}
