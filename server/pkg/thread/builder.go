package thread

import (
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Builder struct {
	th *Thread
}

func New() *Builder {
	return &Builder{th: &Thread{}}
}

func (b *Builder) Build() (*Thread, error) {
	if b.th.id.IsNil() {
		return nil, ErrInvalidID
	}

	return b.th, nil
}

func (b *Builder) MustBuild() *Thread {
	return lo.Must(b.Build())
}

func (b *Builder) ID(id ID) *Builder {
	b.th.id = id
	return b
}

func (b *Builder) Workspace(wid WorkspaceID) *Builder {
	b.th.workspace = wid
	return b
}

func (b *Builder) NewID() *Builder {
	b.th.id = NewID()
	return b
}

func (b *Builder) Comments(c []*Comment) *Builder {
	b.th.comments = slices.Clone(c)
	return b
}
