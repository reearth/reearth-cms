package gcp

import "fmt"

type TasksConfig struct {
	GCPProject    string
	GCPRegion     string
	QueueName     string
	SubscriberURL string
	Topic         string
	GCSHost       string
}

func (c *TasksConfig) buildQueueUrl() (string, error) {
	if c.GCPProject == "" || c.GCPRegion == "" || c.QueueName == "" {
		return "", ErrMissignConfig
	}
	return fmt.Sprintf("projects/%s/locations/%s/queues/%s", c.GCPProject, c.GCPRegion, c.QueueName), nil
}
