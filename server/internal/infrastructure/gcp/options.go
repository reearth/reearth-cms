package gcp

import (
	"context"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
)

type taskRunnerOptions struct {
	clientFn      func(context.Context) (*cloudtasks.Client, func(), error)
	subscriberURL string
	credFilePath  string
}

type TaskRunnerOption interface {
	Apply(*taskRunnerOptions)
}

type withClientFn func(context.Context) (*cloudtasks.Client, func(), error)

func (w withClientFn) Apply(o *taskRunnerOptions) {
	o.clientFn = w
}

type withSubscriberURL string

func (w withSubscriberURL) Apply(o *taskRunnerOptions) {
	o.subscriberURL = string(w)
}

type withCredFilePath string

func (w withCredFilePath) Apply(o *taskRunnerOptions) {
	o.credFilePath = string(w)
}

func defaultTaskRunnerOptions() *taskRunnerOptions {
	return &taskRunnerOptions{
		clientFn:      GetClient,
		subscriberURL: "",
		credFilePath:  "",
	}
}
