package project

const (
	VisibilityPrivate Visibility = "private"
	VisibilityPublic  Visibility = "public"
)

type Visibility string

func (s Visibility) String() string {
	switch s {
	case VisibilityPrivate, VisibilityPublic:
		return string(s)
	default:
		return string(VisibilityPublic)
	}
}
