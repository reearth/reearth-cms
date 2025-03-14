package memory

import (
	"context"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type AssetFile struct {
	data  *util.SyncMap[asset.ID, *asset.File]
	files *util.SyncMap[asset.ID, []*asset.File]
	err   error
}

func NewAssetFile() *AssetFile {
	return &AssetFile{
		data:  &util.SyncMap[id.AssetID, *asset.File]{},
		files: &util.SyncMap[id.AssetID, []*asset.File]{},
	}
}

func (r *AssetFile) FindByID(ctx context.Context, id id.AssetID) (*asset.File, error) {
	if r.err != nil {
		return nil, r.err
	}

	f := r.data.Find(func(key asset.ID, value *asset.File) bool {
		return key == id
	}).Clone()
	fs := r.files.Find(func(key asset.ID, value []*asset.File) bool {
		return key == id
	})
	if len(fs) > 0 {
		// f = asset.FoldFiles(fs, f)
		f.SetFiles(fs)
	}
	return rerror.ErrIfNil(f, rerror.ErrNotFound)
}

func (r *AssetFile) FindByIDs(ctx context.Context, ids id.AssetIDList, assetFileFilter repo.AssetFileFilter) (map[id.AssetID]*asset.File, error) {
	if r.err != nil {
		return nil, r.err
	}

	filesMap := make(map[id.AssetID]*asset.File)

	var contentTypes []string
	if assetFileFilter.ContentTypes != nil {
		contentTypes = strings.Split(*assetFileFilter.ContentTypes, ",")
		for i, ct := range contentTypes {
			contentTypes[i] = strings.TrimSpace(ct)
		}
	}

	for _, id := range ids {
		f := r.data.Find(func(key asset.ID, value *asset.File) bool {
			return key == id
		}).Clone()

		if f == nil {
			continue
		}

		if len(contentTypes) > 0 && !lo.Contains(contentTypes, f.ContentType()) {
			continue
		}

		fs := r.files.Find(func(key asset.ID, value []*asset.File) bool {
			return key == id
		})

		if len(fs) > 0 {
			// Filter the list of files based on ContentTypes
			var filteredFiles []*asset.File
			for _, file := range fs {
				if lo.Contains(contentTypes, file.ContentType()) {
					filteredFiles = append(filteredFiles, file)
				}
			}
			f.SetFiles(filteredFiles)
		}

		filesMap[id] = f
	}

	return filesMap, nil
}

func (r *AssetFile) Save(ctx context.Context, id id.AssetID, file *asset.File) error {
	if r.err != nil {
		return r.err
	}

	r.data.Store(id, file.Clone())
	return nil
}

func (r *AssetFile) SaveFlat(ctx context.Context, id id.AssetID, parent *asset.File, files []*asset.File) error {
	if r.err != nil {
		return r.err
	}
	r.data.Store(id, parent.Clone())
	r.files.Store(id, slices.Clone(files))
	return nil
}
