import { Model, Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import { View } from "@reearth-cms/components/molecules/View/types";
import {
  Maybe,
  Model as GQLModel,
  Group as GQLGroup,
  View as GQLView,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLModel = (model: Maybe<GQLModel>): Model | undefined => {
  if (!model) return;

  return {
    id: model.id,
    description: model.description,
    name: model.name,
    key: model.key,
    public: model.public,
    schema: {
      id: model.schema?.id,
      fields: model.schema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          } as Field),
      ),
    },
    metadataSchema: {
      id: model.metadataSchema?.id,
      fields: model.metadataSchema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          } as Field),
      ),
    },
  };
};

export const fromGraphQLGroup = (group: Maybe<GQLGroup>): Group | undefined => {
  if (!group) return;

  return {
    id: group.id,
    schemaId: group.schemaId,
    projectId: group.projectId,
    name: group.name,
    description: group.description,
    key: group.key,
    schema: {
      id: group.schema?.id,
      fields: group.schema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          } as Field),
      ),
    },
  };
};

export const fromGraphQLView = (view: GQLView): View | undefined => {
  if (!view) return;

  return {
    id: view.id,
    name: view.name,
    modelId: view.modelId,
    projectId: view.projectId,
  };
};
