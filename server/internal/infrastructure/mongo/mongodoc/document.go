package mongodoc

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"go.mongodb.org/mongo-driver/bson"
)

type Type string

type Document struct {
	Type   Type
	Object bson.Raw
}

func NewDocument(obj any) (doc Document, id string, err error) {
	var res any
	var ty Type

	switch m := obj.(type) {
	case *asset.Asset:
		ty = "asset"
		res, id = NewAsset(m)
		break
	case *item.Item:
		ty = "item"
		res, id = NewItem(m)
		break
	case *schema.Schema:
		ty = "schema"
		res, id = NewSchema(m)
		break
	case *project.Project:
		ty = "project"
		res, id = NewProject(m)
		break
	case *model.Model:
		ty = "model"
		res, id = NewModel(m)
		break
	case *thread.Thread:
		ty = "thread"
		res, id = NewThread(m)
		break
	case *integration.Integration:
		ty = "integration"
		res, id = NewIntegration(m)
		break
	case *user.Workspace:
		ty = "workspace"
		res, id = NewWorkspace(m)
		break
	case *user.User:
		ty = "user"
		res, id = NewUser(m)
		break
	default:
		err = errors.New("invalid object")
		return
	}

	raw, err := bson.Marshal(res)
	if err != nil {
		return
	}
	return Document{Object: raw, Type: ty}, id, nil
}

func ModelFrom(obj Document) (res any, err error) {
	switch obj.Type {
	case "asset":
		var d *AssetDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "item":
		var d *ItemDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "schema":
		var d *SchemaDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "project":
		var d *ProjectDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "model":
		var d *ModelDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "thread":
		var d *ThreadDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "integration":
		var d *IntegrationDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "workspace":
		var d *WorkspaceDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	case "user":
		var d *UserDocument
		if err = bson.Unmarshal(obj.Object, &d); err == nil {
			res, err = d.Model()
		}
		break
	default:
		err = errors.New("invalid document")
		break
	}
	return
}
