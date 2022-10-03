package gqldataloader

//go:generate go run github.com/vektah/dataloaden UserLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.User
//go:generate go run github.com/vektah/dataloaden AssetLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Asset
//go:generate go run github.com/vektah/dataloaden WorkspaceLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Workspace
//go:generate go run github.com/vektah/dataloaden ProjectLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Project
//go:generate go run github.com/vektah/dataloaden ModelLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Model
//go:generate go run github.com/vektah/dataloaden SchemaLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Schema
//go:generate go run github.com/vektah/dataloaden FieldLoader github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel.Field
