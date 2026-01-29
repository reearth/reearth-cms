package memory

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/stretchr/testify/assert"
)

func TestNewJobPubSub(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	assert.NotNil(t, pubsub)
}

func TestJobPubSub_PublishSubscribe(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Subscribe first
	ch, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)
	assert.NotNil(t, ch)

	// Publish a state
	progress := job.NewProgress(50, 100)
	state := job.NewState(job.StatusInProgress, &progress, "")
	err = pubsub.Publish(ctx, jobID, state)
	assert.NoError(t, err)

	// Receive the state
	select {
	case receivedState := <-ch:
		assert.Equal(t, job.StatusInProgress, receivedState.Status())
		assert.NotNil(t, receivedState.Progress())
		assert.Equal(t, 50, receivedState.Progress().Processed())
		assert.Equal(t, 100, receivedState.Progress().Total())
	case <-time.After(time.Second):
		t.Fatal("timeout waiting for state")
	}
}

func TestJobPubSub_PublishToNoSubscribers(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Publish without any subscribers should not error
	progress := job.NewProgress(50, 100)
	state := job.NewState(job.StatusInProgress, &progress, "")
	err := pubsub.Publish(ctx, jobID, state)
	assert.NoError(t, err)
}

func TestJobPubSub_MultipleSubscribers(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Subscribe multiple times
	ch1, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)
	ch2, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)

	// Publish a state
	progress := job.NewProgress(75, 100)
	state := job.NewState(job.StatusInProgress, &progress, "")
	err = pubsub.Publish(ctx, jobID, state)
	assert.NoError(t, err)

	// Both subscribers should receive the state
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		select {
		case receivedState := <-ch1:
			assert.Equal(t, job.StatusInProgress, receivedState.Status())
		case <-time.After(time.Second):
			t.Error("timeout waiting for state on ch1")
		}
	}()

	go func() {
		defer wg.Done()
		select {
		case receivedState := <-ch2:
			assert.Equal(t, job.StatusInProgress, receivedState.Status())
		case <-time.After(time.Second):
			t.Error("timeout waiting for state on ch2")
		}
	}()

	wg.Wait()
}

func TestJobPubSub_Unsubscribe(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Subscribe
	ch, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)

	// Unsubscribe
	pubsub.Unsubscribe(jobID)

	// Channel should be closed
	select {
	case _, ok := <-ch:
		assert.False(t, ok, "channel should be closed")
	case <-time.After(time.Second):
		t.Fatal("timeout waiting for channel close")
	}
}

func TestJobPubSub_UnsubscribeNonExistent(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	jobID := id.NewJobID()

	// Unsubscribe from non-existent job should not panic
	pubsub.Unsubscribe(jobID)
}

func TestJobPubSub_ChannelBuffer(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Subscribe
	_, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)

	// Publish more than buffer size (10) without reading
	for i := 0; i < 15; i++ {
		progress := job.NewProgress(i, 100)
		state := job.NewState(job.StatusInProgress, &progress, "")
		err = pubsub.Publish(ctx, jobID, state)
		assert.NoError(t, err) // Should not block or error
	}
}

func TestJobPubSub_DifferentJobs(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID1 := id.NewJobID()
	jobID2 := id.NewJobID()

	// Subscribe to both jobs
	ch1, err := pubsub.Subscribe(ctx, jobID1)
	assert.NoError(t, err)
	ch2, err := pubsub.Subscribe(ctx, jobID2)
	assert.NoError(t, err)

	// Publish to job1 only
	progress := job.NewProgress(50, 100)
	state := job.NewState(job.StatusInProgress, &progress, "")
	err = pubsub.Publish(ctx, jobID1, state)
	assert.NoError(t, err)

	// Only ch1 should receive the state
	select {
	case receivedState := <-ch1:
		assert.Equal(t, job.StatusInProgress, receivedState.Status())
	case <-time.After(time.Second):
		t.Fatal("timeout waiting for state on ch1")
	}

	// ch2 should not receive anything
	select {
	case <-ch2:
		t.Fatal("ch2 should not receive state from job1")
	case <-time.After(100 * time.Millisecond):
		// Expected - no state received
	}
}

func TestJobPubSub_StateTypes(t *testing.T) {
	t.Parallel()

	pubsub := NewJobPubSub()
	ctx := context.Background()
	jobID := id.NewJobID()

	// Subscribe
	ch, err := pubsub.Subscribe(ctx, jobID)
	assert.NoError(t, err)

	tests := []struct {
		name   string
		state  job.State
		status job.Status
	}{
		{
			name:   "pending state",
			state:  job.NewState(job.StatusPending, nil, ""),
			status: job.StatusPending,
		},
		{
			name: "in_progress state",
			state: func() job.State {
				p := job.NewProgress(50, 100)
				return job.NewState(job.StatusInProgress, &p, "")
			}(),
			status: job.StatusInProgress,
		},
		{
			name:   "completed state",
			state:  job.NewState(job.StatusCompleted, nil, ""),
			status: job.StatusCompleted,
		},
		{
			name:   "failed state",
			state:  job.NewState(job.StatusFailed, nil, "error message"),
			status: job.StatusFailed,
		},
		{
			name:   "cancelled state",
			state:  job.NewState(job.StatusCancelled, nil, ""),
			status: job.StatusCancelled,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := pubsub.Publish(ctx, jobID, tt.state)
			assert.NoError(t, err)

			select {
			case receivedState := <-ch:
				assert.Equal(t, tt.status, receivedState.Status())
			case <-time.After(time.Second):
				t.Fatal("timeout waiting for state")
			}
		})
	}
}
