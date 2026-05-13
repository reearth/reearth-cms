package gcp

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"sync"
	"time"

	"cloud.google.com/go/pubsub/v2"
	"cloud.google.com/go/pubsub/v2/apiv1/pubsubpb"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/cloudbuild/v1"
)

var defaultDiskSizeGb int64 = 2000 // 2TB

const healthCheckCacheTTL = 30 * time.Second

type TaskRunner struct {
	conf      *TaskConfig
	pubsub    *pubsub.Client
	cbService *cloudbuild.Service

	hcMu       sync.Mutex
	hcResult   error
	hcResultAt time.Time
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	pubsub, err := pubsub.NewClient(ctx, conf.GCPProject)
	if err != nil {
		return nil, err
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create cloud build service: %w", err)
	}

	return &TaskRunner{
		conf:      conf,
		pubsub:    pubsub,
		cbService: cb,
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
	project := t.conf.GCPProject
	region := t.conf.GCPRegion

	req := &cloudbuild.RetryBuildRequest{
		Id:        id,
		ProjectId: project,
	}

	var err error
	if region != "" {
		name := path.Join("projects", project, "locations", region, "builds", id)
		_, err = t.cbService.Projects.Locations.Builds.Retry(name, req).Do()
	} else {
		_, err = t.cbService.Projects.Builds.Retry(project, id, req).Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

// HealthCheck implements gateway.TaskRunner.
// Results are cached for healthCheckCacheTTL to avoid hammering external APIs
// on frequent live-probe calls while still returning a fresh result on startup.
func (t *TaskRunner) HealthCheck(ctx context.Context) error {
	t.hcMu.Lock()
	if time.Since(t.hcResultAt) < healthCheckCacheTTL {
		err := t.hcResult
		t.hcMu.Unlock()
		return err
	}
	t.hcMu.Unlock()

	err := t.doHealthCheck(ctx)

	t.hcMu.Lock()
	t.hcResult = err
	t.hcResultAt = time.Now()
	t.hcMu.Unlock()

	return err
}

func (t *TaskRunner) doHealthCheck(ctx context.Context) error {
	if t.pubsub == nil {
		return rerror.ErrInternalBy(fmt.Errorf("pubsub client is not initialized"))
	}

	if t.conf.Topic != "" {
		topicName := fmt.Sprintf("projects/%s/topics/%s", t.conf.GCPProject, t.conf.Topic)
		if _, err := t.pubsub.TopicAdminClient.GetTopic(ctx, &pubsubpb.GetTopicRequest{Topic: topicName}); err != nil {
			return rerror.ErrInternalBy(fmt.Errorf("pubsub topic %s does not exist or is inaccessible: %w", t.conf.Topic, err))
		}
	}

	if t.conf.BuildServiceAccount == "" {
		return rerror.ErrInternalBy(fmt.Errorf("build service account is not configured"))
	}

	if err := CheckServiceAccountPermissions(ctx, t.conf.GCPProject, t.conf.BuildServiceAccount); err != nil {
		return err
	}

	if t.conf.WorkerPool != "" {
		if t.conf.GCPRegion == "" {
			return rerror.ErrInternalBy(fmt.Errorf("GCP region is not configured but worker pool is specified"))
		}

		poolName := fmt.Sprintf("projects/%s/locations/%s/workerPools/%s", t.conf.GCPProject, t.conf.GCPRegion, t.conf.WorkerPool)
		if _, err := t.cbService.Projects.Locations.WorkerPools.Get(poolName).Do(); err != nil {
			return rerror.ErrInternalBy(fmt.Errorf("failed to access worker pool %s: %w", t.conf.WorkerPool, err))
		}
	}

	return nil
}

func (t *TaskRunner) runCloudBuild(ctx context.Context, p task.Payload) error {
	if p.DecompressAsset != nil {
		return t.decompressAsset(ctx, p)
	}
	if p.Copy != nil {
		return t.copyItems(ctx, p)
	}
	if p.Import != nil {
		return t.importItems(ctx, p)
	}
	return nil
}

func (t *TaskRunner) decompressAsset(ctx context.Context, p task.Payload) error {
	conf := t.conf
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

	diskSizeGb := defaultDiskSizeGb
	if v := conf.DecompressorDiskSideGb; v > 0 {
		diskSizeGb = v
	}

	build := &cloudbuild.Build{
		Tags:     []string{"cms_decompress-asset"},
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: conf.DecompressorImage,
				Args: []string{"-v", "-n=192", "-gc=5000", "-chunk=1m", "-disk-limit=20g", "-skip-top", "-old-windows", src, dest},
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
		_, err = t.cbService.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build).Do()
	} else {
		_, err = t.cbService.Projects.Builds.Create(project, build).Do()
	}
	return rerror.ErrInternalBy(err)
}

func (t *TaskRunner) copyItems(ctx context.Context, p task.Payload) error {
	if !p.Copy.Validate() {
		return nil
	}

	conf := t.conf
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
		Options:        buildOptions(conf),
		AvailableSecrets: &cloudbuild.Secrets{
			SecretManager: []*cloudbuild.SecretManagerSecret{
				{
					VersionName: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", project, dbSecretName),
					Env:         "REEARTH_CMS_DB",
				},
			},
		},
	}

	var err error
	if region != "" {
		_, err = t.cbService.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build).Do()
	} else {
		_, err = t.cbService.Projects.Builds.Create(project, build).Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) importItems(ctx context.Context, p task.Payload) error {
	if !p.Import.Validate() {
		return rerror.Fmt("invalid import payload")
	}

	conf := t.conf
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
	stepSecretEnv := []string{"REEARTH_CMS_DB"}
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
		ServiceAccount:   fmt.Sprintf("projects/%s/serviceAccounts/%s", project, account),
		Options:          buildOptions(conf),
		AvailableSecrets: &cloudbuild.Secrets{
			SecretManager: availableSecrets,
		},
	}

	var err error
	if region != "" {
		_, err = t.cbService.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build).Do()
	} else {
		_, err = t.cbService.Projects.Builds.Create(project, build).Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

// buildOptions returns Cloud Build options with Pool set only when WorkerPool
// and GCPRegion are both configured; omitting Pool when either is absent avoids
// sending a malformed resource name to the API.
func buildOptions(conf *TaskConfig) *cloudbuild.BuildOptions {
	opts := &cloudbuild.BuildOptions{Logging: "CLOUD_LOGGING_ONLY"}
	if conf.WorkerPool != "" && conf.GCPRegion != "" {
		opts.Pool = &cloudbuild.PoolOption{
			Name: fmt.Sprintf("projects/%s/locations/%s/workerPools/%s", conf.GCPProject, conf.GCPRegion, conf.WorkerPool),
		}
	}
	return opts
}

func (t *TaskRunner) runPubSub(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	data, err := marshalWebhookData(p.Webhook)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	topic := t.pubsub.Publisher(t.conf.Topic)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: data,
	})
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	if _, err := result.Get(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}
