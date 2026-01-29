package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

type JobPubSub struct {
	mu          sync.RWMutex
	subscribers map[id.JobID][]chan job.Progress
}

func NewJobPubSub() gateway.JobPubSub {
	return &JobPubSub{
		subscribers: make(map[id.JobID][]chan job.Progress),
	}
}

func (p *JobPubSub) Publish(_ context.Context, jobID id.JobID, progress job.Progress) error {
	p.mu.RLock()
	defer p.mu.RUnlock()

	subs, ok := p.subscribers[jobID]
	if !ok {
		return nil
	}

	for _, ch := range subs {
		select {
		case ch <- progress:
		default:
			// Channel is full, skip this subscriber
		}
	}

	return nil
}

func (p *JobPubSub) Subscribe(_ context.Context, jobID id.JobID) (<-chan job.Progress, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	ch := make(chan job.Progress, 10) // Buffer for 10 progress updates
	p.subscribers[jobID] = append(p.subscribers[jobID], ch)

	return ch, nil
}

func (p *JobPubSub) Unsubscribe(jobID id.JobID) {
	p.mu.Lock()
	defer p.mu.Unlock()

	subs, ok := p.subscribers[jobID]
	if !ok {
		return
	}

	// Close all channels for this job
	for _, ch := range subs {
		close(ch)
	}

	delete(p.subscribers, jobID)
}
