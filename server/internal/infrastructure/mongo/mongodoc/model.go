package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ModelDocument struct {
	ID          string
	Name        string
	Description string
	Key         string
	Public      bool
	Project     string
	Schema      string
	UpdatedAt   time.Time
}

type ModelConsumer struct {
	Rows model.List
}

func (c *ModelConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc ModelDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	m, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, m)
	return nil
}

func NewModel(model *model.Model) (*ModelDocument, string) {
	mId := model.ID().String()
	return &ModelDocument{
		ID:          mId,
		Name:        model.Name(),
		Description: model.Description(),
		Key:         model.Key().String(),
		Public:      model.Public(),
		Project:     model.Project().String(),
		Schema:      model.Schema().String(),
		UpdatedAt:   model.UpdatedAt(),
	}, mId
}

func (d *ModelDocument) Model() (*model.Model, error) {
	mId, err := id.ModelIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	pId, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	sId, err := id.SchemaIDFrom(d.Schema)
	if err != nil {
		return nil, err
	}

	return model.New().
		ID(mId).
		Name(d.Name).
		Description(d.Description).
		UpdatedAt(d.UpdatedAt).
		Key(key.New(d.Key)).
		IsPublic(d.Public).
		Project(pId).
		Schema(sId).
		Build()
}
