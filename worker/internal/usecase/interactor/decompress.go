package interactor

import (
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearth-cms/worker/pkg/decompressor"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

// ErrTooManyAttempts is returned when the same archive was attempted
// maxDecompressAttempts times without progress (for example because the
// worker was killed while extracting it). The message is then acknowledged
// and the asset marked as failed, so Pub/Sub stops redelivering it.
var ErrTooManyAttempts = errors.New("too many decompress attempts without progress")

func (u *Usecase) Decompress(ctx context.Context, assetID, assetPath string) error {
	err := u.decompress(ctx, assetID, assetPath)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(err, context.Canceled) {
		// Returning the error makes Pub/Sub redeliver the message. The attempt
		// counter is kept, so a stuck archive is given up after a few tries.
		log.Errorf("timeout decompress asset, Asset=%s, Path=%s", assetID, assetPath)
		return err
	}

	status := asset.ArchiveExtractionStatusDone
	if err != nil {
		log.Errorf("failed to decompress asset, Asset=%s, Path=%s, Error=%s", assetID, assetPath, err)
		status = asset.ArchiveExtractionStatusFailed
	}
	// Extraction has finished (either way), so a later run starts from zero.
	if rerr := u.gateways.File.ResetAttempts(ctx, assetPath); rerr != nil {
		log.Warnf("failed to reset decompress attempts, Asset=%s, Path=%s, Error=%s", assetID, assetPath, rerr)
	}
	return u.gateways.CMS.NotifyAssetDecompressed(ctx, assetID, lo.ToPtr(status))
}

func (u *Usecase) decompress(ctx context.Context, assetID, assetPath string) error {
	ext := strings.TrimPrefix(path.Ext(assetPath), ".")
	base := strings.TrimPrefix(strings.TrimSuffix(assetPath, "."+ext), "/")

	attempt, err := u.gateways.File.StartAttempt(ctx, assetPath)
	if err != nil {
		log.Errorf("failed to record decompress attempt, Asset=%s, Path=%s, Err=%s", assetID, assetPath, err.Error())
		return err
	}
	if attempt > u.maxDecompressAttempts {
		return fmt.Errorf("%w: attempt=%d max=%d", ErrTooManyAttempts, attempt, u.maxDecompressAttempts)
	}

	compressedFile, size, proceeded, err := u.gateways.File.Read(ctx, assetPath)
	if err != nil {
		log.Errorf("failed to load archive file from storage, Asset=%s, Path=%s, Err=%s", assetID, assetPath, err.Error())
		return err
	}
	defer func() {
		if cerr := compressedFile.Close(); cerr != nil {
			log.Warnf("failed to close archive file, Asset=%s, Path=%s, Err=%s", assetID, assetPath, cerr)
		}
	}()
	log.Infof("archive file opened from storage, Size=%d, Attempt=%d", size, attempt)

	uploadFunc := func(name string) (io.WriteCloser, error) {
		w, err := u.gateways.File.Upload(ctx, smartJoinPath(base, name))
		if err != nil {
			return nil, err
		}
		return w, nil
	}

	de, err := decompressor.New(compressedFile, size, ext, uploadFunc)
	if err != nil {
		if errors.Is(err, decompressor.ErrUnsupportedExtension) {
			log.Warnf("unsupported extension: decompression skipped assetID=%s ext=%s", assetID, ext)
			return nil
		}
		return err
	}

	progressFunc := func(ctx context.Context, proceeded int64) error {
		if proceeded%1000 != 0 {
			return nil
		}
		return u.gateways.File.WriteProceeded(ctx, assetPath, proceeded)
	}

	if err := de.Decompress(ctx, proceeded, progressFunc); err != nil {
		return err
	}

	return nil
}

func smartJoinPath(firstPath, secondPath string) string {
	lastElementOfFirstPath := path.Base(firstPath)
	tempArray := strings.Split(secondPath, "/")
	firstElementOfSecondPath := tempArray[0]

	if lastElementOfFirstPath == firstElementOfSecondPath {
		return path.Join(path.Dir(firstPath), secondPath)
	}

	return path.Join(firstPath, secondPath)
}
