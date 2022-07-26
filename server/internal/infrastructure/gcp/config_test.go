package gcp

import "testing"

func TestCloudTasksConfig_buildQueueUrl(t *testing.T) {
	type fields struct {
		GCPProject string
		GCPRegion  string
		QueueName  string
	}
	tests := []struct {
		name    string
		fields  fields
		want    string
		wantErr bool
	}{
		{
			name: "should return property queue URL",
			fields: fields{
				GCPProject: "a",
				GCPRegion:  "b",
				QueueName:  "c",
			},
			want: "projects/a/locations/b/queues/c",
		},
		{
			name: "should return error if settings isn't provided",
			fields: fields{
				GCPProject: "a",
				GCPRegion:  "b",
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c := &CloudTasksConfig{
				GCPProject: tt.fields.GCPProject,
				GCPRegion:  tt.fields.GCPRegion,
				QueueName:  tt.fields.QueueName,
			}
			got, err := c.buildQueueUrl()
			if (err != nil) != tt.wantErr {
				t.Errorf("CloudTasksConfig.buildQueueUrl() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("CloudTasksConfig.buildQueueUrl() = %v, want %v", got, tt.want)
			}
		})
	}
}
