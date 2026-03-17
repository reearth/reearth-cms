package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/log"
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

	log.Debugf("pubsub: publishing state for job %s: status=%s progress=%v", jobID, state.Status, state.Progress)

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
		log.Debugf("pubsub: no subscribers for job %s", jobID)
		return nil
	}

	sentCount := 0
	skippedCount := 0
	for _, ch := range subs {
		select {
		case ch <- state:
			sentCount++
		default:
			// Channel is full, skip this subscriber
			skippedCount++
		}
	}

	log.Debugf("pubsub: published to %d subscribers for job %s (skipped %d full channels)", sentCount, jobID, skippedCount)
	return nil
}

func (p *JobPubSub) Subscribe(_ context.Context, jobID id.JobID) (<-chan job.State, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	log.Infof("pubsub: new subscriber for job %s", jobID)

	ch := make(chan job.State, defaultCacheSize)
	p.subscribers[jobID] = append(p.subscribers[jobID], ch)

	subscriberCount := len(p.subscribers[jobID])
	log.Debugf("pubsub: job %s now has %d subscriber(s)", jobID, subscriberCount)

	// Send cached messages to the new subscriber
	cachedSent := 0
	if cached, ok := p.cache[jobID]; ok {
	cacheLoop:
		for _, state := range cached {
			select {
			case ch <- state:
				cachedSent++
			default:
				// Channel is full, stop sending cached messages
				break cacheLoop
			}
		}
	}

	if cachedSent > 0 {
		log.Debugf("pubsub: sent %d cached messages to new subscriber for job %s", cachedSent, jobID)
	}

	return ch, nil
}

func (p *JobPubSub) Unsubscribe(jobID id.JobID) {
	p.mu.Lock()
	defer p.mu.Unlock()

	log.Infof("pubsub: unsubscribing all subscribers for job %s", jobID)

	subs, ok := p.subscribers[jobID]
	if ok {
		log.Debugf("pubsub: closing %d channel(s) for job %s", len(subs), jobID)
		// Close all channels for this job
		for _, ch := range subs {
			close(ch)
		}
		delete(p.subscribers, jobID)
	}

	// Clean up the cache
	delete(p.cache, jobID)
	log.Debugf("pubsub: cleaned up cache for job %s", jobID)
}

func (p *JobPubSub) HasPublisher(jobID id.JobID) bool {
	p.mu.RLock()
	defer p.mu.RUnlock()

	if _, ok := p.cache[jobID]; ok {
		return true
	}

	if subs, ok := p.subscribers[jobID]; ok && len(subs) > 0 {
		return true
	}

	return false
}
