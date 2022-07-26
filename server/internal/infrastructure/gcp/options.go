package gcp

type taskRunnerOptions struct {
	subscriberURL string
}

type TaskRunnerOption interface {
	Apply(*taskRunnerOptions)
}

type withSubscriberURL string

func (w withSubscriberURL) Apply(o *taskRunnerOptions) {
	o.subscriberURL = string(w)
}

func defaultTaskRunnerOptions() *taskRunnerOptions {
	return &taskRunnerOptions{
		subscriberURL: "",
	}
}
