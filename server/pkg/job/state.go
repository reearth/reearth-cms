package job

// State represents the current state of a job, combining status, optional progress, and error message.
// Progress is only present when status is IN_PROGRESS.
type State struct {
	status   Status
	progress *Progress
	errorMsg string
}

// NewState creates a new State. Progress is only included when status is StatusInProgress.
func NewState(status Status, progress *Progress, errorMsg string) State {
	var p *Progress
	if status == StatusInProgress && progress != nil {
		cloned := progress.Clone()
		p = &cloned
	}
	return State{
		status:   status,
		progress: p,
		errorMsg: errorMsg,
	}
}

// Status returns the job status.
func (s State) Status() Status {
	return s.status
}

// Progress returns the job progress. Only present when status is IN_PROGRESS.
func (s State) Progress() *Progress {
	return s.progress
}

// Error returns the error message. Only present when status is FAILED.
func (s State) Error() string {
	return s.errorMsg
}

// Clone returns a deep copy of the State.
func (s State) Clone() State {
	var p *Progress
	if s.progress != nil {
		cloned := s.progress.Clone()
		p = &cloned
	}
	return State{
		status:   s.status,
		progress: p,
		errorMsg: s.errorMsg,
	}
}
