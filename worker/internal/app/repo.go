package app

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/infrastructure/gcp"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
)

func initReposAndGateways(ctx context.Context, conf *Config, debug bool) *gateway.Container {
	gateways := &gateway.Container{}

	// File
	// datafs := afero.NewBasePathFs(afero.NewOsFs(), "data")
	// var fileRepo gateway.File
	// if conf.GCS.BucketName == "" {
	// 	log.Infoln("file: local storage is used")
	// 	fileRepo, err = fs.NewFile(datafs, conf.AssetBaseURL)
	// } else {
	if conf.GCS.BucketName != "" {
		log.Infof("file: GCS storage is used: %s\n", conf.GCS.BucketName)
		fileRepo, err := gcp.NewFile(conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			if debug {
				log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
				err = nil
			}
		}
		gateways.File = fileRepo
	}
	// if err != nil {
	// 	log.Fatalln(fmt.Sprintf("file: init error: %+v", err))
	// }

	return gateways
}
