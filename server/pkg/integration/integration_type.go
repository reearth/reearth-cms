package integration

type Type string

const (
	TypePublic Type = "public"

	TypePrivate Type = "private"
)

func TypeFrom(s string) Type {
	switch s {
	case "public":
		return TypePublic
	case "private":
		return TypePrivate
	default:
		return ""
	}
}
