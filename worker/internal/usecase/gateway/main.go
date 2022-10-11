package gateway

type Container struct {
	File File
	CMS  CMS
}

func NewGateway(f File) *Container {
	return &Container{
		File: f,
	}
}
