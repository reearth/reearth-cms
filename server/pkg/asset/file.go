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

// func FoldFiles(files []*File, root *File) *File {
// 	files = slices.Clone(files)
// 	slices.SortFunc(files, func(a, b *File) bool {
// 		return strings.Compare(a.Path(), b.Path()) < 0 //TODO: check later
// 	})

// 	//a/b/c.txt -> c
// 	base := strings.TrimSuffix(path.Base(root.Path()), path.Ext(root.Path()))
// 	stack := []*File{root}

// 	for _, f := range files {
// 		latest := stack[len(stack)-1]
// 		//a/b/c.txt -> [a,b,c]
// 		latestPath := strings.Split(latest.Path(), "/")
// 		if f == root {
// 			latestPath = latestPath[:len(latestPath)-1]
// 		}
// 		currentPath := strings.Split(path.Dir(f.Path()), "/")
// 		if currentPath[0] == base {
// 			currentPath = currentPath[1:]
// 		}
// 		backward, forward := removeSlicePrefix(removeSlicePrefix(latestPath, currentPath))

// 		// a/b, a/b/c -> [], [c]
// 		// a/b, a/c/c -> [b,c], [c]

// 		// if the file is on the same directory
// 		if len(backward) == 0 && len(forward) == 0 {
// 			latest.AppendChild(f)
// 		}

// 		// Back to the parent directory
// 		if len(backward) > 0 {
// 			// pop
// 			stack = stack[:len(stack)-len(backward)]
// 		}

// 		// Dive into the directory below
// 		for _, p := range forward {
// 			// push
// 			latest := stack[len(stack)-1]
// 			dir := NewFile().Name(p).Path(path.Join(latest.Path(), p)).Build()
// 			latest.AppendChild(dir)
// 			stack = append(stack, dir)
// 		}
// 	}

// 	return root
// }

// この関数は、親を受け取ってその親に渡されたfileの配列を整形してchildrenとして設定する関数
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
		fileDir := path.Dir(files[i].Path())
		diff := strings.TrimPrefix(fileDir, parentDir)

		var parents []string
		if diff != "" {
			parents = strings.Split(diff, "/")
		}

		if len(parents) == 0 {
			parent.AppendChild(files[i])
			continue
		} else {
			dir := NewFile().Name("").Path("/" + path.Join(path.Dir(parent.Path()), parents[0])).Build()
			var targetFiles []*File
			lo.ForEach(files, func(file *File, j int) {
				if strings.HasPrefix(file.Path(), parents[0]) {
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
