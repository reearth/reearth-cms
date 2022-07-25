package gcp

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/id/idx"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"gopkg.in/h2non/gock.v1"
)

func TestTaskRunner_Run(t *testing.T) {
	t.Cleanup(func() {
		gock.EnableNetworking()
		gock.OffAll()
	})
	gock.DisableNetworking()

	queuePath := fmt.Sprintf("projects/%s/locations/%s/queues/%s", "reearth-oss", "asia-northeast1", "test")
	credFilePath := "./gcp-credential.json"
	subscriberURL := "https://example.com/task_handler"
	payload := task.Payload{
		DecompressAsset: task.NewDecompressAssetPayloadForTest("test"),
	}
	type fields struct {
		queuePath string
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
		want    id.TaskID
		wantErr bool
	}{
		{
			name: "success",
			// setup: func(){
			// 	gock.New()
			// },
			fields: fields{
				queuePath: queuePath,
			},
			args: args{
				ctx: context.Background(),
				p:   payload,
			},
			want:    idx.ID[id.Task]{},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tr := &TaskRunner{
				queuePath: tt.fields.queuePath,
			}
			got, err := tr.Run(tt.args.ctx, tt.args.p)
			if (err != nil) != tt.wantErr {
				t.Errorf("TaskRunner.Run() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			fmt.Printf("got-----%v", got)
			// if !reflect.DeepEqual(got, tt.want) {
			// 	t.Errorf("TaskRunner.Run() = %v, want %v", got, tt.want)
			// }
		})
	}
}
