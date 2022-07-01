package util

import (
	"sync"
	"time"
)

var (
	globalNow = &TimeNow{}
)

type TimeNow struct {
	now   func() time.Time
	mutex sync.Mutex
}

func (t *TimeNow) Now() time.Time {
	if t == nil || t.now == nil {
		if t == globalNow {
			return time.Now()
		}
		return globalNow.Now()
	}

	return t.now()
}

func (t *TimeNow) Mock(now time.Time) func() {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	t.now = func() time.Time {
		return now
	}

	return func() {
		t.mutex.Lock()
		defer t.mutex.Unlock()

		t.now = nil
	}
}

func Now() time.Time {
	return globalNow.Now()
}

func MockNow(t time.Time) func() {
	return globalNow.Mock(t)
}
