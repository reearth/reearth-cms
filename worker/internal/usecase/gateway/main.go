package gateway

type Container struct {
	File File
}

func NewGateway(f File) *Container {
	return &Container{
		File: f,
	}
}
