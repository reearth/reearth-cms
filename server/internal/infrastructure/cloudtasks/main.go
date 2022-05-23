package cloudtasks

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

type publisher struct {
	config interface{}
}

func NewPublisher(config interface{}) gateway.Publisher {
	return &publisher{
		config: config,
	}
}

func (p *publisher) Publish(ctx context.Context, topic gateway.Topic, payload gateway.Payload) (eventId string, err error) {

	//MEMO: ここでCloudTasksなどの実装詳細を呼び出す
	cTasks := NewCloudTasks()
	err := cTasks.publish()

	if err != nil {
		return "", err
	}

	return "hogeId", nil
}
