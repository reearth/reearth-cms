package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createModel(e *httpexpect.Expect, pID, name, desc, key string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
				  createModel(input: {projectId: $projectId, name: $name, description: $description, key: $key}) {
					model {
					  id
					  name
					  description
					  key
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"projectId":   pID,
			"name":        name,
			"description": desc,
			"key":         key,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.createModel.model.id").Raw().(string), res
}

func getModel(e *httpexpect.Expect, mID string) (string, string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `query GetModel($modelId: ID!) {
				  node(id: $modelId, type: Model) {
					id
					... on Model {
					  id
					  name
					  description
					  key
					  public
					  schema {
						id
						fields {
						  id
						  type
						  title
						  key
						  description
						  required
						  unique
						  isTitle
						  multiple
						  order
						  typeProperty {
							... on SchemaFieldText {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldTextArea {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldMarkdown {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldAsset {
							  assetDefaultValue: defaultValue
							  __typename
							}
							... on SchemaFieldSelect {
							  selectDefaultValue: defaultValue
							  values
							  __typename
							}
							... on SchemaFieldTag {
							  tagDefaultValue: defaultValue
							  tags{
							    id
							    name
							    color
		  					  }
							  __typename
							}
							... on SchemaFieldInteger {
							  integerDefaultValue: defaultValue
							  min
							  max
							  __typename
							}
							... on SchemaFieldBool {
							  defaultValue
							  __typename
							}
							... on SchemaFieldURL {
							  defaultValue
							  __typename
							}
							__typename
						  }
						  __typename
						}
						__typename
					  }
					  metadataSchema {
	 					id
						fields {
						  id
						  type
						  title
						  key
						  description
						  required
						  unique
						  isTitle
						  multiple
						  order
						  typeProperty {
							... on SchemaFieldText {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldTextArea {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldMarkdown {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldAsset {
							  assetDefaultValue: defaultValue
							  __typename
							}
							... on SchemaFieldSelect {
							  selectDefaultValue: defaultValue
							  values
							  __typename
							}
							... on SchemaFieldTag {
							  tagDefaultValue: defaultValue
							  tags{
							    id
							    name
							    color
		  					  }
							  __typename
							}
							... on SchemaFieldInteger {
							  integerDefaultValue: defaultValue
							  min
							  max
							  __typename
							}
							... on SchemaFieldBool {
							  defaultValue
							  __typename
							}
							... on SchemaFieldURL {
							  defaultValue
							  __typename
							}
							__typename
						  }
						  __typename
						}
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId": mID,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	var msId string
	if res.Path("$.data.node.metadataSchema").Raw() != nil {
		msId = res.Path("$.data.node.metadataSchema.id").Raw().(string)
	}

	return res.Path("$.data.node.schema.id").Raw().(string),
		msId,
		res
}

func TestCreateModel(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	_, res := createModel(e, pId, "test", "test", "test-1")

	res.Object().
		Value("data").Object().
		Value("createModel").Object().
		Value("model").Object().
		HasValue("name", "test").
		HasValue("description", "test").
		HasValue("key", "test-1")

}
