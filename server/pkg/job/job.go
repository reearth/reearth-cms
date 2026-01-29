package job

import (
	"encoding/json"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

type Job struct {
	id          ID
	jobType     Type
	status      Status
	projectID   ProjectID
	user        *accountdomain.UserID
	integration *IntegrationID
	progress    Progress
	payload     json.RawMessage
	result      json.RawMessage
	errorMsg    string
	updatedAt   time.Time
	startedAt   *time.Time
	completedAt *time.Time
}

func (j *Job) ID() ID {
	return j.id
}

func (j *Job) Type() Type {
	return j.jobType
}

func (j *Job) Status() Status {
	return j.status
}

func (j *Job) ProjectID() ProjectID {
	return j.projectID
}

func (j *Job) User() *accountdomain.UserID {
	return j.user
}

func (j *Job) Integration() *IntegrationID {
	return j.integration
}

func (j *Job) Progress() Progress {
	return j.progress
}

func (j *Job) Payload() json.RawMessage {
	return j.payload
}

func (j *Job) Result() json.RawMessage {
	return j.result
}

func (j *Job) Error() string {
	return j.errorMsg
}

func (j *Job) CreatedAt() time.Time {
	return j.id.Timestamp()
}

func (j *Job) UpdatedAt() time.Time {
	return j.updatedAt
}

func (j *Job) StartedAt() *time.Time {
	return j.startedAt
}

func (j *Job) CompletedAt() *time.Time {
	return j.completedAt
}

func (j *Job) SetStatus(s Status) {
	j.status = s
	j.updatedAt = util.Now()
}

func (j *Job) SetProgress(p Progress) {
	j.progress = p
	j.updatedAt = util.Now()
}

func (j *Job) SetResult(r json.RawMessage) {
	j.result = r
	j.updatedAt = util.Now()
}

func (j *Job) SetError(err string) {
	j.errorMsg = err
	j.updatedAt = util.Now()
}

func (j *Job) Start() {
	now := util.Now()
	j.status = StatusInProgress
	j.startedAt = &now
	j.updatedAt = now
}

func (j *Job) Complete(result json.RawMessage) {
	now := util.Now()
	j.status = StatusCompleted
	j.result = result
	j.completedAt = &now
	j.updatedAt = now
}

func (j *Job) Fail(errMsg string) {
	now := util.Now()
	j.status = StatusFailed
	j.errorMsg = errMsg
	j.completedAt = &now
	j.updatedAt = now
}

func (j *Job) Cancel() {
	now := util.Now()
	j.status = StatusCancelled
	j.completedAt = &now
	j.updatedAt = now
}

func (j *Job) IsCancelled() bool {
	return j.status == StatusCancelled
}

func (j *Job) IsFinished() bool {
	return j.status.IsFinished()
}

func (j *Job) Clone() *Job {
	if j == nil {
		return nil
	}
	return &Job{
		id:          j.id.Clone(),
		jobType:     j.jobType,
		status:      j.status,
		projectID:   j.projectID.Clone(),
		user:        j.user.CloneRef(),
		integration: j.integration.CloneRef(),
		progress:    j.progress.Clone(),
		payload:     append(json.RawMessage(nil), j.payload...),
		result:      append(json.RawMessage(nil), j.result...),
		errorMsg:    j.errorMsg,
		updatedAt:   j.updatedAt,
		startedAt:   util.CloneRef(j.startedAt),
		completedAt: util.CloneRef(j.completedAt),
	}
}
