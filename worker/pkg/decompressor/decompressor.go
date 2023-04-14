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

func (uz *Decompressor) Decompress() error {
	if uz == nil {
		return nil
	}
	archiveFiles := lo.Filter(uz.ar.files(), func(f file, _ int) bool {
		return !f.skip()
	})
	log.Infof("archive total entries=%d", len(archiveFiles))
	uz.readConcurrent(archiveFiles)
	return nil
}

func (uz *Decompressor) readConcurrent(zfs []file) {
	var wg sync.WaitGroup
	workQueue := make(chan file, workerQueueDepth)
	for i := 0; i < workersNumber; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			for f := range workQueue {
				func(f file) {
					fn := f.name()
					log.Infof("worker %3d: extracting file Size=%5d File=%s", i, f.size(), fn)
					x, err := f.open()
					if err != nil {
						log.Errorf("failed to open read file File=%s, Err=%s", fn, err.Error())
						log.Fatal(err)
						return
					}
					w, err := uz.wFn(fn)
					if err != nil {
						log.Errorf("failed to invoke walk func", fn, err.Error())
						log.Fatal(err)
						return
					}
					if _, err := io.Copy(w, x); err != nil {
						log.Errorf("failed to copy file to Storage File=%s, Err=%s", fn, err.Error())
					}
					// NOTE: do not use deffer to close the reader, writer!
					if err := x.Close(); err != nil {
						log.Errorf("failed to close read file File=%s, Err=%s", fn, err.Error())
						log.Fatal(err)
					}
					if err := w.Close(); err != nil {
						log.Errorf("failed to close write file File=%s, Err=%s", fn, err.Error())
						log.Fatal(err)
					}
				}(f)
			}
		}(i)
	}

	for _, f := range zfs {
		workQueue <- f
	}
	close(workQueue)
	wg.Wait()
}
