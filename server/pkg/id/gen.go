//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=team_gen.go --name=Team
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=user_gen.go --name=User

// Testing
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=team_gen_test.go --name=Team
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=user_gen_test.go --name=User

package id
