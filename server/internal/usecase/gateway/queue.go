package gateway

import "context"

//TODO: after asset has been implemented move this under asset gateway and embed Queue to Asset struct
type CompressFileExtention string

const (
	Zip = CompressFileExtention("zip")
)

type Queue interface {
	AddTask(ctx context.Context) error
}
