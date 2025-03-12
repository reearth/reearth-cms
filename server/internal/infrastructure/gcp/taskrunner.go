package gcp

import (
	"context"
	"fmt"
	"net/url"
	"path"

	"cloud.google.com/go/pubsub"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/cloudbuild/v1"
)

var defaultDiskSizeGb int64 = 2000 // 2TB

type TaskRunner struct {
	conf   *TaskConfig
	pubsub *pubsub.Client
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	pubsub, err := pubsub.NewClient(ctx, conf.GCPProject)
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		conf:   conf,
		pubsub: pubsub,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runCloudBuild(ctx, p)
	}
	return t.runPubSub(ctx, p)
}

func (t *TaskRunner) Retry(ctx context.Context, id string) error {
	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := t.conf.GCPProject
	region := t.conf.GCPRegion

	req := &cloudbuild.RetryBuildRequest{
		Id:        id,
		ProjectId: project,
	}

	if region != "" {
		name := path.Join("projects", project, "locations", region, "builds", id)
		call := cb.Projects.Locations.Builds.Retry(name, req)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Retry(project, id, req)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) runCloudBuild(ctx context.Context, p task.Payload) error {
	if p.DecompressAsset != nil {
		return decompressAsset(ctx, p, t.conf)
	}
	if p.Copy != nil {
		return copyItems(ctx, p, t.conf)
	}
	if p.Import != nil {
		return importItems(ctx, p, t.conf)
	}
	return nil
}

func decompressAsset(ctx context.Context, p task.Payload, conf *TaskConfig) error {
	if p.DecompressAsset == nil {
		return nil
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	src, err := url.JoinPath("gs://"+conf.GCSBucket, "assets", p.DecompressAsset.Path)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	dest, err := url.JoinPath("gs://"+conf.GCSBucket, "assets", path.Dir(p.DecompressAsset.Path))
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := conf.GCPProject
	account := conf.BuildServiceAccount
	region := conf.GCPRegion

	machineType := ""
	if v := conf.DecompressorMachineType; v != "" && v != "default" {
		machineType = v
	}

	var diskSizeGb int64
	if v := conf.DecompressorDiskSideGb; v > 0 {
		diskSizeGb = v
	} else {
		diskSizeGb = defaultDiskSizeGb
	}

	build := &cloudbuild.Build{
		Tags:     []string{"cms_decompress-asset"},
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: conf.DecompressorImage,
				Args: []string{"-v", "-n=192", "-gc=5000", "-chunk=1m", "-disk-limit=20g", "-gzip-ext=" + conf.DecompressorGzipExt, "-skip-top", "-old-windows", src, dest},
				Env: []string{
					"GOOGLE_CLOUD_PROJECT=" + project,
					"REEARTH_CMS_DECOMPRESSOR_TOPIC=" + conf.DecompressorTopic,
					"REEARTH_CMS_DECOMPRESSOR_ASSET_ID=" + p.DecompressAsset.AssetID,
				},
			},
		},
		ServiceAccount: fmt.Sprintf("projects/%s/serviceAccounts/%s", project, account),
		Options: &cloudbuild.BuildOptions{
			MachineType: machineType,
			DiskSizeGb:  diskSizeGb,
			Logging:     "CLOUD_LOGGING_ONLY",
			// Pool: &cloudbuild.PoolOption{
			// 	Name: fmt.Sprintf("projects/%s/locations/%s/workerPools/%s", project, region, conf.WorkerPool),
			// },
		},
	}

	if region != "" {
		call := cb.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Create(project, build)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func copyItems(ctx context.Context, p task.Payload, conf *TaskConfig) error {
	if !p.Copy.Validate() {
		return nil
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := conf.GCPProject
	account := conf.BuildServiceAccount
	region := conf.GCPRegion
	dbSecretName := conf.DBSecretName

	build := &cloudbuild.Build{
		Tags:     []string{"cms_copy-items"},
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: conf.CopierImage,
				Env: []string{
					"REEARTH_CMS_COPIER_COLLECTION=" + p.Copy.Collection,
					"REEARTH_CMS_COPIER_FILTER=" + p.Copy.Filter,
					"REEARTH_CMS_COPIER_CHANGES=" + p.Copy.Changes,
				},
				SecretEnv: []string{
					"REEARTH_CMS_DB",
				},
			},
		},
		ServiceAccount: fmt.Sprintf("projects/%s/serviceAccounts/%s", project, account),
		Options: &cloudbuild.BuildOptions{
			Logging: "CLOUD_LOGGING_ONLY",
			Pool: &cloudbuild.PoolOption{
				Name: fmt.Sprintf("projects/%s/locations/%s/workerPools/%s", project, region, conf.WorkerPool),
			},
		},
		AvailableSecrets: &cloudbuild.Secrets{
			SecretManager: []*cloudbuild.SecretManagerSecret{
				{
					VersionName: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", project, dbSecretName),
					Env:         "REEARTH_CMS_DB",
				},
			},
		},
	}

	if region != "" {
		call := cb.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Create(project, build)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func importItems(ctx context.Context, p task.Payload, conf *TaskConfig) error {
	if !p.Import.Validate() {
		return rerror.Fmt("invalid import payload")
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := conf.GCPProject
	account := conf.BuildServiceAccount
	region := conf.GCPRegion
	singleDb := conf.DBName == conf.AccountDBName

	args := []string{
		"item",
		"import",
		"-modelId=" + p.Import.ModelId,
		"-assetId=" + p.Import.AssetId,
		"-format=" + p.Import.Format,
		"-strategy=" + p.Import.Strategy,
		"-mutateSchema=" + fmt.Sprint(p.Import.MutateSchema),
	}
	if p.Import.GeometryFieldKey != "" {
		args = append(args, fmt.Sprintf("-geometryFieldKey=%s", p.Import.GeometryFieldKey))
	}
	if p.Import.UserId != "" {
		args = append(args, "-userId="+p.Import.UserId)
	} else if p.Import.IntegrationId != "" {
		args = append(args, "-integrationId="+p.Import.IntegrationId)
	}

	availableSecrets := []*cloudbuild.SecretManagerSecret{
		{
			VersionName: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", project, conf.DBSecretName),
			Env:         "REEARTH_CMS_DB",
		},
	}
	stepSecretEnv := []string{
		"REEARTH_CMS_DB",
	}
	if !singleDb {
		availableSecrets = append(availableSecrets, &cloudbuild.SecretManagerSecret{
			VersionName: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", project, conf.AccountDBSecretName),
			Env:         "REEARTH_CMS_DB_USERS",
		})
		stepSecretEnv = append(stepSecretEnv, "REEARTH_CMS_DB_USERS")
	}

	build := &cloudbuild.Build{
		Tags:     []string{"cms_import-items"},
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: conf.CmsImage,
				Env: []string{
					"REEARTH_CMS_GCS_BUCKETNAME=" + conf.GCSBucket,
					"REEARTH_CMS_DB_CMS=" + conf.DBName,
					"REEARTH_CMS_DB_ACCOUNT=" + conf.AccountDBName,
				},
				SecretEnv: stepSecretEnv,
				Args:      args,
			},
		},
		ServiceAccount: fmt.Sprintf("projects/%s/serviceAccounts/%s", project, account),
		Options: &cloudbuild.BuildOptions{
			Logging: "CLOUD_LOGGING_ONLY",
			Pool: &cloudbuild.PoolOption{
				Name: fmt.Sprintf("projects/%s/locations/%s/workerPools/%s", project, region, conf.WorkerPool),
			},
		},
		AvailableSecrets: &cloudbuild.Secrets{
			SecretManager: availableSecrets,
		},
	}

	if region != "" {
		call := cb.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Create(project, build)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) runPubSub(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	u, err := url.Parse(t.conf.GCSHost)
	if err != nil {
		return fmt.Errorf("failed to parse GCS host as a URL: %w", err)
	}

	var urlFn asset.URLResolver = func(a *asset.Asset) string {
		return getURL(u, a.UUID(), a.FileName())
	}

	data, err := marshalWebhookData(p.Webhook, urlFn)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	topic := t.pubsub.Topic(t.conf.Topic)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: data,
	})
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	if _, err := result.Get(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}
