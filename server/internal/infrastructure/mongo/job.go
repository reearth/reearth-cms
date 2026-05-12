package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	jobIndexes       = []string{"projectid", "type", "status"}
	jobUniqueIndexes = []string{"id"}
)

type Job struct {
	client *mongox.Collection
}

func NewJob(client *mongox.Client) repo.Job {
	return &Job{client: client.WithCollection("job")}
}

func (r *Job) Init() error {
	return createIndexes(context.Background(), r.client, jobIndexes, jobUniqueIndexes)
}

func (r *Job) FindByID(ctx context.Context, jobID id.JobID) (*job.Job, error) {
	return r.findOne(ctx, bson.M{
		"id": jobID.String(),
	})
}

func (r *Job) FindByProject(ctx context.Context, projectID id.ProjectID, jobType *job.Type, status *job.Status) ([]*job.Job, error) {
	filter := bson.M{
		"projectid": projectID.String(),
	}
	if jobType != nil {
		filter["type"] = jobType.String()
	}
	if status != nil {
		filter["status"] = status.String()
	}
	return r.find(ctx, filter)
}

func (r *Job) Save(ctx context.Context, j *job.Job) error {
	doc, jID, err := mongodoc.NewJob(j)
	if err != nil {
		return err
	}
	return r.client.SaveOne(ctx, jID, doc)
}

func (r *Job) findOne(ctx context.Context, filter any) (*job.Job, error) {
	c := mongodoc.NewJobConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Job) find(ctx context.Context, filter any) ([]*job.Job, error) {
	c := mongodoc.NewJobConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}
