package asset

import (
	"path"
	"strings"

	"github.com/samber/lo"
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

func (f *File) IsDir() bool {
	return path.Ext(f.Path()) == ""
}

func (f *File) AppendChild(c *File) {
	f.children = append(f.children, c)
}

func FoldFiles(files []*File, parent *File) *File {
	files = slices.Clone(files)
	slices.SortFunc(files, func(a, b *File) bool {
		return strings.Compare(a.Path(), b.Path()) < 0
	})

	var skipIndexes []int
	for i := range files {
		if slices.Contains(skipIndexes, i) {
			continue
		}

		parentDir := strings.TrimPrefix(parent.Path(), "/")
		fileDir := strings.TrimPrefix(path.Dir(files[i].Path()), "/")
		diff := strings.TrimPrefix(strings.TrimPrefix(fileDir, parentDir), "/")

		var parents []string
		if diff != "" {
			parents = strings.Split(diff, "/")
		}

		if len(parents) == 0 {
			parent.AppendChild(files[i])
			continue
		} else {
			var pd string
			if parent.IsDir() {
				pd = parent.Path()
			} else {
				pd = path.Dir(parent.Path())
			}
			dir := NewFile().Name(parents[0]).Path(path.Join(pd, parents[0])).Build()
			var targetFiles []*File
			lo.ForEach(files, func(file *File, j int) {
				if strings.HasPrefix(file.Path(), dir.Path()) {
					targetFiles = append(targetFiles, file)
					_, index, _ := lo.FindIndexOf(files, func(f *File) bool {
						return f == file
					})
					skipIndexes = append(skipIndexes, index)
				}
			})

			foldedDir := FoldFiles(targetFiles, dir)
			parent.AppendChild(foldedDir)
		}
	}

	return parent
}
