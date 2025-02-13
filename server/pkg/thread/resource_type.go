package thread

import (
	"strings"
)

type ResourceType string

func (p ResourceType) Ref() *ResourceType {
	return &p
}

const (
	ResourceTypeItem    ResourceType = "item"
	ResourceTypeAsset   ResourceType = "asset"
	ResourceTypeRequest ResourceType = "request"
)

func ResourceTypeFrom(p string) (ResourceType, bool) {
	pp := strings.ToLower(p)
	switch ResourceType(pp) {
	case ResourceTypeItem:
		return ResourceTypeItem, true
	case ResourceTypeAsset:
		return ResourceTypeAsset, true
	case ResourceTypeRequest:
		return ResourceTypeRequest, true
	default:
		return ResourceType(""), false
	}
}

func ResourceTypeFromRef(p *string) *ResourceType {
	if p == nil {
		return nil
	}

	pp, ok := ResourceTypeFrom(*p)
	if !ok {
		return nil
	}
	return &pp
}

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
