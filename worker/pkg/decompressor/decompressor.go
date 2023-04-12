package decompressor

import (
	"errors"
	"io"
	"sync"

	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

var (
	ErrUnsupportedExtension = errors.New("unsupported extension type")
)

const (
	// configPrefix            = "REEARTH_CMS_WORKER"
	// gcsAssetBasePath string = "assets"

	workersNumber    = 500
	workerQueueDepth = 20000
)

type WalkFunc func(name string) (io.WriteCloser, error)

type Decompressor struct {
	ar  archive
	wFn WalkFunc
}

func New(r io.ReaderAt, size int64, ext string, wFn WalkFunc) (*Decompressor, error) {
	var a archive
	switch ext {
	case "zip":
		var err error
		a, err = newZipReader(r, size)
		if err != nil {
			return nil, err
		}
	case "7z":
		var err error
		a, err = new7ZipReader(r, size)
		if err != nil {
			return nil, err
		}
	default:
		return nil, ErrUnsupportedExtension
	}
	return &Decompressor{
		ar:  a,
		wFn: wFn,
	}, nil
}

func (uz *Decompressor) Decompress(assetBasePath string) error {
	if uz == nil {
		return nil
	}
	archiveFiles := lo.Filter(uz.ar.files(), func(f file, _ int) bool {
		return !f.skip()
	})

	// base := filepath.Join(gcsAssetBasePath, assetBasePath)
	uz.readConcurrent(archiveFiles /*, base*/)
	return nil
}

func (uz *Decompressor) readConcurrent(zfs []file /*, assetBasePath string*/) {
	// conf, err := ReadDecompressorConfig()
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// ctx := context.Background()
	// client, _ := storage.NewClient(ctx)
	// db := client.Bucket(conf.BucketName)
	var wg sync.WaitGroup
	workQueue := make(chan file, workerQueueDepth)
	for i := 0; i < workersNumber; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			for f := range workQueue {
				func(f file) {
					fn := f.name()
					log.Infof("extracting file File=%s", fn)
					x, err := f.open()
					if err != nil {
						log.Errorf("failed to open read file File=%s, Err=%s", fn, err.Error())
						log.Fatal(err)
					}
					defer func(x io.ReadCloser) {
						if err := x.Close(); err != nil {
							log.Errorf("failed to close read file File=%s, Err=%s", fn, err.Error())
							log.Fatal(err)
						}
					}(x)
					// w := db.Object(getFileDestinationPath(assetBasePath, fn)).NewWriter(ctx)
					w, err := uz.wFn(fn)
					if err != nil {
						log.Errorf("failed to invoke walk func", fn, err.Error())
						log.Fatal(err)
						return
					}
					defer func(w io.WriteCloser) {
						if err := w.Close(); err != nil {
							log.Errorf("failed to close write file File=%s, Err=%s", fn, err.Error())
							log.Fatal(err)
						}
					}(w)

					if _, err := io.Copy(w, x); err != nil {
						log.Errorf("failed to copy file to Storage File=%s, Err=%s", fn, err.Error())
						return
					}
					log.Infof(" worker %d wrote %s!", i, fn)
				}(f)
			}
		}(i)
	}

	for _, f := range zfs {
		log.Infof("sending file to worker File=%s", f.name())
		workQueue <- f
	}
	close(workQueue)
	wg.Wait()
}

// func getFileDestinationPath(firstPath, secondPath string) string {
// 	lastElementOfFirstPath := filepath.Base(firstPath)
// 	tempArray := strings.Split(secondPath, "/")
// 	firstElementOfSecondPath := tempArray[0]
//
// 	if lastElementOfFirstPath == firstElementOfSecondPath {
// 		return filepath.Join(filepath.Dir(firstPath), secondPath)
// 	}
//
// 	return filepath.Join(firstPath, secondPath)
// }
