package asset

import (
	"path"
	"strings"

	"golang.org/x/exp/slices"
)

type File struct {
	name        string
	size        uint64
	contentType string
	path        string
	children    []*File
}

func (f *File) Name() string {
	return f.name
}

func (f *File) SetName(n string) {
	f.name = n
}

func (f *File) Size() uint64 {
	return f.size
}

func (f *File) ContentType() string {
	return f.contentType
}

func (f *File) Path() string {
	return f.path
}

func (f *File) Children() []*File {
	if f == nil {
		return nil
	}
	return slices.Clone(f.children)
}

func (f *File) AppendChild(c *File) {
	f.children = append(f.children, f)
}

func FoldFiles(files []*File, root *File) *File {
	files = slices.Clone(files)
	slices.SortFunc(files, func(a, b *File) bool {
		return strings.Compare(a.Path(), b.Path()) < 0 //TODO: check later
	})

	base := strings.TrimSuffix(path.Base(root.Path()), path.Ext(root.Path()))
	stack := []*File{root}

	for _, f := range files {
		latest := stack[len(stack)-1]
		latestPath := strings.Split(latest.Path(), "/")
		if f == root {
			latestPath = latestPath[:len(latestPath)-1]
		}
		currentPath := strings.Split(path.Dir(f.Path()), "/")
		if currentPath[0] == base {
			currentPath = currentPath[1:]
		}
		backward, forward := removeSlicePrefix(removeSlicePrefix(latestPath, currentPath))

		// a/b, a/b/c -> [], [c]
		// a/b, a/c/c -> [b,c], [c]

		// if the file is on the same directory
		if len(backward) == 0 && len(forward) == 0 {
			latest.AppendChild(f)
		}

		// Back to the parent directory
		if len(backward) > 0 {
			// pop
			stack = stack[:len(stack)-len(backward)]
		}

		// Dive into the directory below
		for _, p := range forward {
			// push
			latest := stack[len(stack)-1]
			dir := NewFile().Name(p).Path(path.Join(latest.Path(), p)).Build()
			latest.AppendChild(dir)
			stack = append(stack, dir)
		}
	}

	return root
}

func removeSlicePrefix[T comparable](a, b []T) (c []T, d []T) {
	c, d = slices.Clone(a), slices.Clone(b)

	for i, e := range a {
		if i >= len(b) || e != b[i] {
			break
		}

		c = c[1:]
		d = d[1:]
	}

	return
}
