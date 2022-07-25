package gcp

type taskRunnerOptions struct {
	subscriberURL string
	credFilePath  string
}

type TaskRunnerOption interface {
	Apply(*taskRunnerOptions)
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
		subscriberURL: "",
		credFilePath:  "",
	}
}
