//go:generate go run github.com/reearth/reearth-cms/server/tools/cmd/gen --template=id.tmpl --output=workspace_gen.go --name=Workspace
//go:generate go run github.com/reearth/reearth-cms/server/tools/cmd/gen --template=id.tmpl --output=user_gen.go --name=User

// Testing
//go:generate go run github.com/reearth/reearth-cms/server/tools/cmd/gen --template=id_test.tmpl --output=workspace_gen_test.go --name=Workspace
//go:generate go run github.com/reearth/reearth-cms/server/tools/cmd/gen --template=id_test.tmpl --output=user_gen_test.go --name=User

package id
