package thread

type ResourceType string

func (p ResourceType) Ref() *ResourceType {
	return &p
}

const (
	ResourceTypeItem    ResourceType = "item"
	ResourceTypeAsset   ResourceType = "asset"
	ResourceTypeRequest ResourceType = "request"
)

func (p ResourceType) String() string {
	return string(p)
}

func (p *ResourceType) StringRef() *string {
	if p == nil {
		return nil
	}
	p2 := string(*p)
	return &p2
}
