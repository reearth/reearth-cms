package job

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	b := New()
	assert.NotNil(t, b)
}

func TestBuilder_Build(t *testing.T) {
	jid := NewID()
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()

	t.Run("success with user", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			User(uid).
			Build()

		assert.NoError(t, err)
		assert.NotNil(t, j)
		assert.Equal(t, jid, j.ID())
		assert.Equal(t, TypeImport, j.Type())
		assert.Equal(t, StatusPending, j.Status())
		assert.Equal(t, pid, j.ProjectID())
		assert.Equal(t, &uid, j.User())
		assert.Nil(t, j.Integration())
	})

	t.Run("success with integration", func(t *testing.T) {
		t.Parallel()

		iid := id.NewIntegrationID()
		j, err := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			Integration(iid).
			Build()

		assert.NoError(t, err)
		assert.NotNil(t, j)
		assert.Nil(t, j.User())
		assert.Equal(t, &iid, j.Integration())
	})

	t.Run("error when ID is nil", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			Type(TypeImport).
			Project(pid).
			User(uid).
			Build()

		assert.ErrorIs(t, err, ErrInvalidID)
		assert.Nil(t, j)
	})

	t.Run("error when project ID is nil", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			ID(jid).
			Type(TypeImport).
			User(uid).
			Build()

		assert.ErrorIs(t, err, ErrNoProjectID)
		assert.Nil(t, j)
	})

	t.Run("error when no user or integration", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			Build()

		assert.ErrorIs(t, err, ErrNoUser)
		assert.Nil(t, j)
	})

	t.Run("error when job type is empty", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			ID(jid).
			Project(pid).
			User(uid).
			Build()

		assert.ErrorIs(t, err, ErrInvalidJobType)
		assert.Nil(t, j)
	})

	t.Run("sets updatedAt from ID timestamp when not set", func(t *testing.T) {
		t.Parallel()

		j, err := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			User(uid).
			Build()

		assert.NoError(t, err)
		assert.Equal(t, jid.Timestamp(), j.UpdatedAt())
	})

	t.Run("preserves updatedAt when set", func(t *testing.T) {
		t.Parallel()

		customTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
		j, err := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			User(uid).
			UpdatedAt(customTime).
			Build()

		assert.NoError(t, err)
		assert.Equal(t, customTime, j.UpdatedAt())
	})
}

func TestBuilder_MustBuild(t *testing.T) {
	jid := NewID()
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()

	t.Run("success", func(t *testing.T) {
		t.Parallel()

		j := New().
			ID(jid).
			Type(TypeImport).
			Project(pid).
			User(uid).
			MustBuild()

		assert.NotNil(t, j)
	})

	t.Run("panics on error", func(t *testing.T) {
		t.Parallel()

		assert.Panics(t, func() {
			New().MustBuild()
		})
	})
}

func TestBuilder_NewID(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Build()

	assert.NoError(t, err)
	assert.NotNil(t, j)
	assert.False(t, j.ID().IsEmpty())
}

func TestBuilder_Status(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()

	j, err := New().
		NewID().
		Type(TypeImport).
		Status(StatusInProgress).
		Project(pid).
		User(uid).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, StatusInProgress, j.Status())
}

func TestBuilder_Progress(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	progress := NewProgress(50, 100)

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Progress(progress).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, progress, j.Progress())
}

func TestBuilder_Payload(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	payload := json.RawMessage(`{"key": "value"}`)

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Payload(payload).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, payload, j.Payload())
}

func TestBuilder_Result(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	result := json.RawMessage(`{"result": "success"}`)

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Result(result).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, result, j.Result())
}

func TestBuilder_Error(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Error("something failed").
		Build()

	assert.NoError(t, err)
	assert.Equal(t, "something failed", j.Error())
}

func TestBuilder_StartedAt(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	startedAt := time.Now()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		StartedAt(&startedAt).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, &startedAt, j.StartedAt())
}

func TestBuilder_CompletedAt(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	completedAt := time.Now()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		CompletedAt(&completedAt).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, &completedAt, j.CompletedAt())
}

func TestBuilder_UserClearsIntegration(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		Integration(iid).
		User(uid).
		Build()

	assert.NoError(t, err)
	assert.Equal(t, &uid, j.User())
	assert.Nil(t, j.Integration())
}

func TestBuilder_IntegrationClearsUser(t *testing.T) {
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()

	j, err := New().
		NewID().
		Type(TypeImport).
		Project(pid).
		User(uid).
		Integration(iid).
		Build()

	assert.NoError(t, err)
	assert.Nil(t, j.User())
	assert.Equal(t, &iid, j.Integration())
}
