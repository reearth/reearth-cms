package gcp

import "fmt"

type Config struct {
	cloudTasks *CloudTasksConfig
}

type CloudTasksConfig struct {
	GCPProject string
	GCPRegion  string
	QueueName  string
}

func (c *CloudTasksConfig) buildQueueUrl() (string, error) {
	if c.GCPProject == "" || c.GCPRegion == "" || c.QueueName == "" {
		return "", ErrMissignConfig
	}
	return fmt.Sprintf("projects/%s/locations/%s/queues/%s", c.GCPProject, c.GCPRegion, c.QueueName), nil
}
