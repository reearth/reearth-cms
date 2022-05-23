package asset

import "time"

type Asset struct {
	// id          ID
	createdAt time.Time
	// team        TeamID
	name        string // file name
	size        int64  // file size
	url         string
	contentType string
}
