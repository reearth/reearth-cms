package gcp

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/task"
)

func TestTaskRunner_Run(t *testing.T) {
	queuePath := fmt.Sprintf("projects/%s/locations/%s/queues/%s", "reearth-oss", "asia-northeast1", "test")
	// credFilePath := "./gcp-credential.json"
	subscriberURL := "https://example.com/task_handler"
	payload := task.Payload{
		DecompressAsset: task.NewDecompressAssetPayloadForTest("test"),
	}
	type fields struct {
		queuePath     string
		subscriberURL string
		credFilePath  string
	}
	type args struct {
		ctx context.Context
		p   task.Payload
	}
	tests := []struct {
		name    string
		setup   func()
		fields  fields
		args    args
		wantErr bool
	}{
		{
			name: "success",
			// setup: func(){
			// 	gock.New()
			// },
			fields: fields{
				queuePath:     queuePath,
				subscriberURL: subscriberURL,
			},
			args: args{
				ctx: context.Background(),
				p:   payload,
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tr := &TaskRunner{
				queuePath:     tt.fields.queuePath,
				subscriberURL: tt.fields.subscriberURL,
			}
			_, err := tr.Run(tt.args.ctx, tt.args.p)
			if (err != nil) != tt.wantErr {
				t.Errorf("TaskRunner.Run() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			// if !reflect.DeepEqual(got, tt.want) {
			// 	t.Errorf("TaskRunner.Run() = %v, want %v", got, tt.want)
			// }
		})
	}
}
