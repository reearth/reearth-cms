package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

const defaultCacheSize = 10

type JobPubSub struct {
	mu          sync.RWMutex
	subscribers map[id.JobID][]chan job.State
	cache       map[id.JobID][]job.State
	cacheSize   int
}

func NewJobPubSub() gateway.JobPubSub {
	return NewJobPubSubWithCacheSize(defaultCacheSize)
}

func NewJobPubSubWithCacheSize(cacheSize int) gateway.JobPubSub {
	if cacheSize < 0 {
		cacheSize = 0
	}
	return &JobPubSub{
		subscribers: make(map[id.JobID][]chan job.State),
		cache:       make(map[id.JobID][]job.State),
		cacheSize:   cacheSize,
	}
}

func (p *JobPubSub) Publish(_ context.Context, jobID id.JobID, state job.State) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	// Cache the message
	if p.cacheSize > 0 {
		cached := p.cache[jobID]
		cached = append(cached, state)
		// Keep only the last cacheSize messages
		if len(cached) > p.cacheSize {
			cached = cached[len(cached)-p.cacheSize:]
		}
		p.cache[jobID] = cached
	}

	// Publish to subscribers
	subs, ok := p.subscribers[jobID]
	if !ok {
		return nil
	}

	for _, ch := range subs {
		select {
		case ch <- state:
		default:
			// Channel is full, skip this subscriber
		}
	}

	return nil
}

func (p *JobPubSub) Subscribe(_ context.Context, jobID id.JobID) (<-chan job.State, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	ch := make(chan job.State, 10)
	p.subscribers[jobID] = append(p.subscribers[jobID], ch)

	// Send cached messages to the new subscriber
	if cached, ok := p.cache[jobID]; ok {
	cacheLoop:
		for _, state := range cached {
			select {
			case ch <- state:
			default:
				// Channel is full, stop sending cached messages
				break cacheLoop
			}
		}
	}

	return ch, nil
}

func (p *JobPubSub) Unsubscribe(jobID id.JobID) {
	p.mu.Lock()
	defer p.mu.Unlock()

	subs, ok := p.subscribers[jobID]
	if ok {
		// Close all channels for this job
		for _, ch := range subs {
			close(ch)
		}
		delete(p.subscribers, jobID)
	}

	// Clean up the cache
	delete(p.cache, jobID)
}

func (p *JobPubSub) HasPublisher(jobID id.JobID) bool {
	p.mu.RLock()
	defer p.mu.RUnlock()

	_, ok := p.cache[jobID]
	return ok
}
