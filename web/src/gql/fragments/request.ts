import { gql } from "@apollo/client";

import { threadFragment } from "@reearth-cms/gql/fragments";

export const requestFragment = gql`
  fragment requestFragment on Request {
    id
    items {
      itemId
      version
      ref
      item {
        version
        parents
        refs
        value {
          id
          title
          schemaId
          modelId
          model {
            name
          }
          fields {
            schemaFieldId
            type
            value
            itemGroupId
          }
          referencedItems {
            id
            title
            schemaId
            createdBy {
              ... on Integration {
                name
              }
              ... on User {
                name
              }
            }
            status
            version
            createdAt
            updatedAt
          }
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
              typeProperty {
                ... on SchemaFieldText {
                  defaultValue
                  maxLength
                }
                ... on SchemaFieldTextArea {
                  defaultValue
                  maxLength
                }
                ... on SchemaFieldMarkdown {
                  defaultValue
                  maxLength
                }
                ... on SchemaFieldAsset {
                  assetDefaultValue: defaultValue
                }
                ... on SchemaFieldSelect {
                  selectDefaultValue: defaultValue
                  values
                }
                ... on SchemaFieldInteger {
                  integerDefaultValue: defaultValue
                  min
                  max
                }
                ... on SchemaFieldBool {
                  defaultValue
                }
                ... on SchemaFieldURL {
                  defaultValue
                }
                ... on SchemaFieldReference {
                  modelId
                }
                ... on SchemaFieldGroup {
                  groupId
                }
              }
            }
          }
        }
      }
    }
    title
    description
    createdBy {
      id
      name
      email
    }
    workspaceId
    projectId
    threadId
    reviewersId
    state
    createdAt
    updatedAt
    approvedAt
    closedAt
    thread {
      ...threadFragment
    }
    project {
      id
      name
      createdAt
      updatedAt
    }
    reviewers {
      id
      name
      email
    }
  }
  ${threadFragment}
`;

export default requestFragment;
