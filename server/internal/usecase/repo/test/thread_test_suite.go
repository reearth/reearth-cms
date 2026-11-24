package test

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type threadFactory = func(t *testing.T) repo.Thread

func TestThreadRepo(t *testing.T, newRepo threadFactory) {
	t.Run("Filtered", func(t *testing.T) { testThreadFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testThreadFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testThreadFindByIDs(t, newRepo) })
	t.Run("Comments", func(t *testing.T) { testThreadComments(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testThreadIsolation(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testThreadSave(t, newRepo) })
	t.Run("SaveAll", func(t *testing.T) { testThreadSaveAll(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testThreadRemove(t, newRepo) })
	t.Run("RemoveByIDs", func(t *testing.T) { testThreadRemoveByIDs(t, newRepo) })
}

func newThread(wid accountdomain.WorkspaceID, comments ...*thread.Comment) *thread.Thread {
	return thread.New().NewID().Workspace(wid).Comments(comments).MustBuild()
}

func newComment(content string) *thread.Comment {
	return thread.NewComment(thread.NewCommentID(), operator.OperatorFromUser(accountdomain.NewUserID()), content)
}

func storedThreads(t *testing.T, r repo.Thread, ids id.ThreadIDList) thread.List {
	t.Helper()
	var res thread.List
	for _, thid := range ids {
		th, err := r.FindByID(context.Background(), thid)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		require.NoError(t, err)
		res = append(res, th)
	}
	return res
}

func testThreadFiltered(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2, w3 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w2t1 := newThread(w2)
	w3t1 := newThread(w3)
	seeds := thread.List{w1t1, w2t1, w3t1}

	tests := []struct {
		name      string
		filter    func(r repo.Thread) repo.Thread
		wantRead  thread.List
		wantWrite accountdomain.WorkspaceIDList // workspaces Save must accept
		wantDeny  accountdomain.WorkspaceIDList // workspaces Save must reject
	}{
		{
			name: "must merge readable workspaces of chained filters",
			filter: func(r repo.Thread) repo.Thread {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, nil))
			},
			wantRead: thread.List{w1t1, w2t1},
			wantDeny: accountdomain.WorkspaceIDList{w1, w2, w3},
		},
		{
			name: "must merge writable workspaces of chained filters",
			filter: func(r repo.Thread) repo.Thread {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w1})).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2}))
			},
			wantRead:  thread.List{w1t1, w2t1},
			wantWrite: accountdomain.WorkspaceIDList{w1, w2},
			wantDeny:  accountdomain.WorkspaceIDList{w3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.Thread) repo.Thread {
				return r.Filtered(repo.WorkspaceFilter{}).Filtered(repo.WorkspaceFilter{})
			},
			wantRead:  seeds,
			wantWrite: accountdomain.WorkspaceIDList{w1, w2, w3},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, seeds))
			r := tc.filter(base)

			assert.Equal(t, tc.wantRead, storedThreads(t, r, seeds.IDs()))
			for _, w := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newThread(w)))
			}
			for _, w := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newThread(w)))
			}

			// filtering must not change the base repository
			assert.Equal(t, seeds, storedThreads(t, base, seeds.IDs()))
		})
	}
}

func testThreadFindByID(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1, newComment("a"), newComment("b"))
	w1t2 := newThread(w1)
	w2t1 := newThread(w2)
	seeds := thread.List{w1t1, w1t2, w2t1}

	tests := []struct {
		name    string
		seeds   thread.List
		filter  *repo.WorkspaceFilter
		args    id.ThreadID
		want    *thread.Thread
		wantErr error
	}{
		{
			name:  "must find a thread with comments",
			seeds: seeds,
			args:  w1t1.ID(),
			want:  w1t1,
		},
		{
			name:  "must find a thread without comments",
			seeds: seeds,
			args:  w1t2.ID(),
			want:  w1t2,
		},
		{
			name:   "must find a thread of a readable workspace",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w2}, nil)),
			args:   w2t1.ID(),
			want:   w2t1,
		},
		{
			name:   "must find a thread of any workspace when only writable workspaces are scoped",
			seeds:  seeds,
			filter: &repo.WorkspaceFilter{Writable: accountdomain.WorkspaceIDList{w2}},
			args:   w1t1.ID(),
			want:   w1t1,
		},
		{
			name:    "must not find an unknown thread",
			seeds:   seeds,
			args:    id.NewThreadID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any thread in an empty repository",
			args:    w1t1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a thread of an unreadable workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2})),
			args:    w1t1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			// reads are scoped by the readable list alone, even though
			// WorkspaceFilter.CanRead treats writable workspaces as readable
			name:    "must not find a thread of a writable-only workspace",
			seeds:   seeds,
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:    w1t1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testThreadFindByIDs(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w1t2 := newThread(w1)
	w2t1 := newThread(w2)
	seeds := thread.List{w1t1, w1t2, w2t1}

	tests := []struct {
		name    string
		seeds   thread.List
		filter  *repo.WorkspaceFilter
		args    id.ThreadIDList
		want    []*thread.Thread
		wantErr error
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.ThreadIDList{},
		},
		{
			name:  "must find threads across workspaces",
			seeds: seeds,
			args:  id.ThreadIDList{w1t1.ID(), w1t2.ID(), w2t1.ID()},
			want:  []*thread.Thread{w1t1, w1t2, w2t1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.ThreadIDList{w2t1.ID(), w1t2.ID(), w1t1.ID()},
			want:  []*thread.Thread{w2t1, w1t2, w1t1},
		},
		{
			name:   "must find threads of readable workspaces",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w1, w2}, nil)),
			args:   id.ThreadIDList{w2t1.ID(), w1t1.ID()},
			want:   []*thread.Thread{w2t1, w1t1},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.SaveAll(ctx, tc.seeds))
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

// testThreadComments checks that comments and their authors survive a save
// and find round trip.
func testThreadComments(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	cid := thread.NewCommentID

	tests := []struct {
		name     string
		comments []*thread.Comment
	}{
		{
			name: "must keep a thread without comments",
		},
		{
			name:     "must keep a thread with an empty comment list",
			comments: []*thread.Comment{},
		},
		{
			name:     "must keep a comment by a user",
			comments: []*thread.Comment{thread.NewComment(cid(), operator.OperatorFromUser(accountdomain.NewUserID()), "user")},
		},
		{
			name:     "must keep a comment by an integration",
			comments: []*thread.Comment{thread.NewComment(cid(), operator.OperatorFromIntegration(id.NewIntegrationID()), "integration")},
		},
		{
			name:     "must keep a comment without an author",
			comments: []*thread.Comment{thread.NewComment(cid(), operator.Operator{}, "no author")},
		},
		{
			name:     "must keep a comment with empty content",
			comments: []*thread.Comment{newComment("")},
		},
		{
			name:     "must keep a comment with multibyte content",
			comments: []*thread.Comment{newComment("コメント 💬\n2行目")},
		},
		{
			name:     "must keep the order of comments",
			comments: []*thread.Comment{newComment("c"), newComment("a"), newComment("b")},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			th := newThread(accountdomain.NewWorkspaceID(), tc.comments...)
			require.NoError(t, r.Save(ctx, th))

			got, err := r.FindByID(ctx, th.ID())
			assert.NoError(t, err)
			assert.Equal(t, th, got)
		})
	}
}

// testThreadIsolation checks that the stored thread is a copy: changes made
// to a saved or found thread must not leak into the repository without a Save.
func testThreadIsolation(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()

	tests := []struct {
		name   string
		mutate func(saved, found *thread.Thread) error
	}{
		{
			name:   "must not keep changes made to a saved thread",
			mutate: func(saved, _ *thread.Thread) error { return saved.AddComment(newComment("new")) },
		},
		{
			name:   "must not keep changes made to a found thread",
			mutate: func(_, found *thread.Thread) error { return found.AddComment(newComment("new")) },
		},
		{
			name: "must not keep changes made to a comment of a found thread",
			mutate: func(_, found *thread.Thread) error {
				return found.UpdateComment(found.Comments()[0].ID(), "updated")
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saved := newThread(accountdomain.NewWorkspaceID(), newComment("original"))
			want := saved.Clone()
			require.NoError(t, r.Save(ctx, saved))
			found, err := r.FindByID(ctx, saved.ID())
			require.NoError(t, err)
			assert.Equal(t, want, found)
			assert.NotSame(t, saved, found)

			require.NoError(t, tc.mutate(saved, found))

			got, err := r.FindByID(ctx, saved.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}

func testThreadSave(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1 := accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w1t1Updated := thread.New().ID(w1t1.ID()).Workspace(w1).Comments([]*thread.Comment{newComment("a")}).MustBuild()

	tests := []struct {
		name    string
		seeds   thread.List
		filter  *repo.WorkspaceFilter
		args    *thread.Thread
		want    *thread.Thread // the stored thread afterwards
		wantErr error
	}{
		{
			name: "must save a new thread",
			args: w1t1,
			want: w1t1,
		},
		{
			name:  "must overwrite an existing thread",
			seeds: thread.List{w1t1},
			args:  w1t1Updated,
			want:  w1t1Updated,
		},
		{
			name:   "must save a thread in a writable workspace",
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   w1t1,
			want:   w1t1,
		},
		{
			name:    "must not save a thread in a readable-only workspace",
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:    w1t1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite a thread outside writable workspaces",
			seeds:   thread.List{w1t1},
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()})),
			args:    w1t1Updated,
			want:    w1t1, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Save(ctx, tc.args))

			// the stored state is checked unfiltered
			got, err := base.FindByID(ctx, tc.args.ID())
			assert.Equal(t, tc.want, got)
			if tc.want == nil {
				assert.Equal(t, rerror.ErrNotFound, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func testThreadSaveAll(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w1t2 := newThread(w1)
	w2t1 := newThread(w2)
	w1t1Updated := thread.New().ID(w1t1.ID()).Workspace(w1).Comments([]*thread.Comment{newComment("a")}).MustBuild()
	all := id.ThreadIDList{w1t1.ID(), w1t2.ID(), w2t1.ID()}

	tests := []struct {
		name    string
		seeds   thread.List
		filter  *repo.WorkspaceFilter
		args    thread.List
		want    thread.List // the stored threads afterwards
		wantErr error
	}{
		{
			name: "must save nothing for an empty list",
			args: thread.List{},
		},
		{
			name: "must save threads across workspaces",
			args: thread.List{w1t1, w1t2, w2t1},
			want: thread.List{w1t1, w1t2, w2t1},
		},
		{
			name:  "must overwrite existing threads",
			seeds: thread.List{w1t1, w1t2},
			args:  thread.List{w1t1Updated},
			want:  thread.List{w1t1Updated, w1t2},
		},
		{
			name:   "must save threads in a writable workspace",
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   thread.List{w1t1, w1t2},
			want:   thread.List{w1t1, w1t2},
		},
		{
			name:    "must save nothing when any thread is outside writable workspaces",
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:    thread.List{w1t1, w2t1},
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.SaveAll(ctx, tc.args))

			// the stored state is checked unfiltered
			assert.Equal(t, tc.want, storedThreads(t, base, all))
		})
	}
}

func testThreadRemove(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w1t2 := newThread(w1)
	w2t1 := newThread(w2)
	seeds := thread.List{w1t1, w1t2, w2t1}

	tests := []struct {
		name    string
		seeds   thread.List
		filter  *repo.WorkspaceFilter
		args    id.ThreadID
		want    thread.List // threads that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove a thread",
			seeds: seeds,
			args:  w1t1.ID(),
			want:  thread.List{w1t2, w2t1},
		},
		{
			name:    "must not remove an unknown thread",
			seeds:   seeds,
			args:    id.NewThreadID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    w1t1.ID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove a thread in a writable workspace",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w2})),
			args:   w2t1.ID(),
			want:   thread.List{w1t1, w1t2},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Remove(ctx, tc.args))

			// remaining threads are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			assert.Equal(t, tc.want, storedThreads(t, base, seeds.IDs()))
		})
	}
}

func testThreadRemoveByIDs(t *testing.T, newRepo threadFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1t1 := newThread(w1)
	w1t2 := newThread(w1)
	w2t1 := newThread(w2)
	seeds := thread.List{w1t1, w1t2, w2t1}

	tests := []struct {
		name   string
		seeds  thread.List
		filter *repo.WorkspaceFilter
		args   id.ThreadIDList
		want   thread.List // threads that must remain after the call
	}{
		{
			name:  "must remove nothing for an empty list",
			seeds: seeds,
			args:  id.ThreadIDList{},
			want:  seeds,
		},
		{
			name:  "must remove threads across workspaces",
			seeds: seeds,
			args:  id.ThreadIDList{w1t1.ID(), w2t1.ID()},
			want:  thread.List{w1t2},
		},
		{
			name:  "must ignore unknown threads",
			seeds: seeds,
			args:  id.ThreadIDList{id.NewThreadID(), w1t2.ID()},
			want:  thread.List{w1t1, w2t1},
		},
		{
			name: "must remove nothing from an empty repository",
			args: id.ThreadIDList{w1t1.ID()},
		},
		{
			name:   "must remove threads in a writable workspace",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   id.ThreadIDList{w1t1.ID(), w1t2.ID()},
			want:   thread.List{w2t1},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			require.NoError(t, base.SaveAll(ctx, tc.seeds))
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.NoError(t, r.RemoveByIDs(ctx, tc.args))

			// remaining threads are checked unfiltered
			assert.Equal(t, tc.want, storedThreads(t, base, seeds.IDs()))
		})
	}
}
