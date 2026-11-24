package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox/mongotest"
)

func TestLock(t *testing.T) {
	init := mongotest.Connect(t)

	t.Run("lock and unlock", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		l, err := NewLock(init(t).Collection("locks"))
		require.NoError(t, err)

		require.NoError(t, l.Lock(ctx, "a"))
		assert.ErrorIs(t, l.Lock(ctx, "a"), repo.ErrAlreadyLocked)
		require.NoError(t, l.Lock(ctx, "b"))

		require.NoError(t, l.Unlock(ctx, "a"))
		require.NoError(t, l.Unlock(ctx, "b"))
		assert.ErrorIs(t, l.Unlock(ctx, "a"), repo.ErrNotLocked)

		// the name can be locked again after unlocking
		require.NoError(t, l.Lock(ctx, "a"))
		require.NoError(t, l.Unlock(ctx, "a"))
	})

	t.Run("unlock without lock", func(t *testing.T) {
		t.Parallel()
		l, err := NewLock(init(t).Collection("locks"))
		require.NoError(t, err)

		assert.ErrorIs(t, l.Unlock(context.Background(), "a"), repo.ErrNotLocked)
	})

	t.Run("waits until another host releases the lock", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		c := init(t).Collection("locks")
		l1, err := NewLock(c)
		require.NoError(t, err)
		l2, err := NewLock(c)
		require.NoError(t, err)

		require.NoError(t, l1.Lock(ctx, "a"))

		unlocked := make(chan error, 1)
		go func() {
			time.Sleep(200 * time.Millisecond)
			unlocked <- l1.Unlock(ctx, "a")
		}()

		require.NoError(t, l2.Lock(ctx, "a"))
		require.NoError(t, <-unlocked)
		require.NoError(t, l2.Unlock(ctx, "a"))
	})

	t.Run("gives up when the context is done while another host holds the lock", func(t *testing.T) {
		t.Parallel()
		c := init(t).Collection("locks")
		l1, err := NewLock(c)
		require.NoError(t, err)
		l2, err := NewLock(c)
		require.NoError(t, err)

		require.NoError(t, l1.Lock(context.Background(), "a"))

		ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
		defer cancel()

		start := time.Now()
		assert.ErrorIs(t, l2.Lock(ctx, "a"), repo.ErrFailedToLock)
		assert.Less(t, time.Since(start), 2*time.Second)

		// a failed attempt must not be recorded as held
		assert.ErrorIs(t, l2.Unlock(context.Background(), "a"), repo.ErrNotLocked)
		require.NoError(t, l1.Unlock(context.Background(), "a"))
	})
}
