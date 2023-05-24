package aws

type TaskConfig struct {
	AWSRegion string
	QueueName string
	TopicARN  string
	S3Host    string
}
